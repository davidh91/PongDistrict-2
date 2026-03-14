import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


@pytest.fixture
def client(tmp_path, monkeypatch):
    database_path = tmp_path / "security-test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-security-tests")

    for module_name in ["database", "models", "auth", "main"]:
        sys.modules.pop(module_name, None)

    import main

    with TestClient(main.app) as test_client:
        yield test_client


def register_user(
    client: TestClient, username: str, email: str, password: str = "P@ssword123!"
):
    response = client.post(
        "/register",
        json={
            "username": username,
            "email": email,
            "password": password,
            "password_repeat": password,
        },
    )
    assert response.status_code == 200
    return response.json()


def login_user(client: TestClient, identifier: str, password: str = "P@ssword123!"):
    response = client.post(
        "/token",
        data={"username": identifier, "password": password},
    )
    assert response.status_code == 200
    return response


def test_leaderboard_does_not_expose_email_addresses(client: TestClient):
    register_user(client, "player-one", "player1@example.com")

    response = client.get("/leaderboard")

    assert response.status_code == 200
    assert response.json()
    assert "email" not in response.json()[0]


def test_login_sets_cookie_and_allows_current_user_lookup(client: TestClient):
    user = register_user(client, "player-two", "player2@example.com")

    login_response = login_user(client, "player-two")
    me_response = client.get("/users/me")

    assert login_response.cookies.get("access_token")
    assert me_response.status_code == 200
    assert me_response.json()["id"] == user["id"]


def test_logout_clears_authentication_cookie(client: TestClient):
    register_user(client, "player-three", "player3@example.com")
    login_user(client, "player-three")

    logout_response = client.post("/logout")
    me_response = client.get("/users/me")

    assert logout_response.status_code == 200
    assert me_response.status_code == 401


def test_user_cannot_record_match_for_two_other_players(client: TestClient):
    player_one = register_user(client, "alpha-player", "alpha@example.com")
    player_two = register_user(client, "beta-player", "beta@example.com")
    register_user(client, "gamma-player", "gamma@example.com")
    login_user(client, "gamma-player")

    response = client.post(
        "/matches",
        json={
            "winner_id": player_one["id"],
            "loser_id": player_two["id"],
        },
    )

    assert response.status_code == 403


def test_login_rate_limit_triggers_after_too_many_attempts(client: TestClient):
    register_user(client, "rate-limit-player", "ratelimit@example.com")

    status_codes = []
    for _ in range(11):
        response = client.post(
            "/token",
            data={"username": "rate-limit-player", "password": "wrong-password!"},
        )
        status_codes.append(response.status_code)

    assert status_codes[-1] == 429
