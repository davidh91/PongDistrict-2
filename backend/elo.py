def calculate_elo(winner_elo: int, loser_elo: int, k_factor: int = 32) -> tuple[int, int]:
    """
    Calculates new ELO ratings using standard ELO formula.
    Returns: (new_winner_elo, new_loser_elo)
    """
    # Expected score
    expected_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_elo - loser_elo) / 400))
    
    # New ratings
    new_winner_elo = int(winner_elo + k_factor * (1 - expected_winner))
    new_loser_elo = int(loser_elo + k_factor * (0 - expected_loser))
    
    return new_winner_elo, new_loser_elo
