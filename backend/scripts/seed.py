"""Seed script - populate database with test data.

Usage:
    cd backend
    uv run python -m scripts.seed
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import select

from app.db import get_session, init_db
from app.models.user import User


def seed_users() -> None:
    """Create sample users."""

    users = [
        User(name="Alice Johnson", email="alice@example.com"),
        User(name="Bob Smith", email="bob@example.com"),
        User(name="Charlie Brown", email="charlie@example.com"),
        User(name="Diana Prince", email="diana@example.com"),
        User(name="Eve Wilson", email="eve@example.com"),
    ]

    with get_session() as session:
        # Check if users already exist
        existing = session.exec(select(User)).first()
        if existing:
            print("Database already has users, skipping seed.")
            return

        for user in users:
            session.add(user)

        session.commit()
        print(f"Created {len(users)} users.")


def main() -> None:
    """Run all seed functions."""
    print("Initializing database...")
    init_db()

    print("Seeding data...")
    seed_users()

    print("Done!")


if __name__ == "__main__":
    main()
