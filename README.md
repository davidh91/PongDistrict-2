> Disclaimer: This README and parts of this project were written with AI assistance.

# PongDistrict

PongDistrict is a full-stack table tennis match tracker.

It lets players:

- Create accounts and sign in
- Record match results
- Update ratings with ELO scoring
- View a live leaderboard
- Browse match history

## Why this app exists

This project was built as a practical learning exercise in coding using LLMs. The goal was to ship a real, usable app while learning how to:

- Break features into small prompts
- Iterate quickly with AI-generated drafts
- Review and harden generated code
- Keep human control over architecture and security decisions

## LLM disclosure

This app was developed with LLM assistance.

Primary model used:

- Gemini (primarily via Google Antigravity)
- GPT-5.3-Codex (secondary support via GitHub Copilot in VS Code)

How it was used:

- Generate initial scaffolding and feature drafts
- Refactor API and frontend components
- Suggest debugging and deployment steps
- Help write and tighten security smoke tests

Human role:

- Defined product scope and UX
- Chose data model and auth behavior
- Reviewed, edited, and validated generated code
- Ran tests and deployment checks

In short: AI accelerated development, but final decisions and verification stayed human-led.

## Tech stack

Backend:

- FastAPI
- SQLAlchemy
- PostgreSQL (Render)
- JWT auth in HTTP-only cookies

Frontend:

- React + Vite
- Tailwind CSS

Deployment:

- Backend: Render
- Database: Render Postgres
- Frontend: Netlify

## Local development

1. Clone the repository.
2. Start services with Docker Compose from the project root.
3. Open the frontend and backend URLs shown by the containers.

## Production notes

- Do not use SQLite for production persistence on ephemeral platforms.
- Use Render Postgres through DATABASE_URL.
- For cross-site auth (Netlify frontend + Render backend), configure secure cookie and CORS settings correctly.

## Status

This is a practice project focused on shipping, learning, and improving LLM-assisted engineering workflow.
