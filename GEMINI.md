# GEMINI.MD: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

## 1. Project Overview & Purpose

* **Primary Goal:** This is a web application called "PongDistrict" designed to track table tennis/ping pong matches and maintain a global leaderboard using the ELO rating system.
* **Business Domain:** Sports tracking, recreational gaming, ELO ranking systems.

## 2. Core Technologies & Stack

* **Languages:** Python 3.11 (Backend), JavaScript/JSX (Frontend React).
* **Frameworks & Runtimes:** Node.js v20 (Frontend Runtime), React 18 (Vite), TailwindCSS v4, FastAPI (Backend).
* **Databases:** SQLite (via SQLAlchemy ORM).
* **Key Libraries/Dependencies:** `fastapi`, `sqlalchemy`, `uvicorn`, `python-jose` (Backend); `react`, `react-router-dom`, `tailwindcss`, `react-oidc-context`, `lucide-react` (Frontend).
* **Package Manager(s):** `npm` (Frontend), `pip` (Backend).

## 3. Architectural Patterns

* **Overall Architecture:** Client-Server Architecture / Single Page Application (SPA). The frontend is a React SPA communicating via REST API to a Python FastAPI backend. Both are containerized using Docker and orchestrated via Docker Compose.
* **Directory Structure Philosophy:** 
    * `/frontend`: Contains the Vite+React SPA source code, configuration, and UI components.
    * `/backend`: Contains the FastAPI application, database connections, schemas, authentication middleware, and business logic (ELO calculation).

## 4. Coding Conventions & Style Guide

* **Formatting:** Standard Python formatting (likely PEP 8 conventions), Standard JavaScript and Vite template conventions. Vite is set up using standard modern React patterns.
* **Naming Conventions:** 
    * `variables`, `functions`: camelCase (`myVariable`) in JS, snake_case (`my_variable`) in Python.
    * `classes`, `components`: PascalCase (`MyReactComponent`) in both JS and Python class definitions.
    * `files`: kebab-case or PascalCase for React components, snake_case for Python modules.
* **API Design:** RESTful principles. JSON used for request/response bodies.
* **Error Handling:** Standard HTTP status codes using FastAPI `HTTPException`. Frontend catches errors in API requests and sets local state appropriately.

## 5. Key Files & Entrypoints

* **Main Entrypoint(s):** 
  * `backend/main.py` (FastAPI Server)
  * `frontend/src/main.jsx` (React entrypoint)
* **Configuration:** 
  * `docker-compose.yml` (Primary infrastructure config)
  * `backend/.env` (FastAPI local secrets, copy from `.env.example`)
  * `frontend/.env` (Vite local configuration, copy from `.env.example`)
  * `frontend/vite.config.js` 
* **CI/CD Pipeline:** None formally established yet, but Dockerfiles are provided for clean local builds.

## 6. Development & Testing Workflow

* **Local Development Environment:** 
  1. Copy `backend/.env.example` to `backend/.env` and set a `SECRET_KEY`.
  2. Copy `frontend/.env.example` to `frontend/.env`.
  3. Use `docker-compose up --build -d` to spin up the services.
  Access frontend via `localhost:5173` and backend API at `localhost:8000`.
* **Testing:** Run backend logic tests directly using pytest (inferred). Manual verification via the UI can also be used.
* **CI/CD Process:** Not currently configured.

## 7. Specific Instructions for AI Collaboration

* **Contribution Guidelines:** Adhere to the defined technology stack and styling options. Use modern TailwindCSS v4 utility classes for all styling; avoid writing custom CSS. 
* **Infrastructure (IaC):** The `docker-compose.yml` serves as local infrastructure as code.
* **Security:** Use JWT for authentication. Ensure `python-jose` correctly verifies JWT parameters passed from the React frontend before acting on any sensitive endpoints (`/matches`, `/users`).
* **Dependencies:** Add Python dependencies to `backend/requirements.txt`. Add JS dependencies via `npm install` within the `frontend/` directory.
* **Commit Messages:** Follow standard concise and descriptive commit messages, ideally Conventional Commits specification.
