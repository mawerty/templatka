import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import select

from app.db import get_session, init_db
from app.models.cat import Cat


def seed_cats() -> None:
    cats = [
        Cat(name="Whiskers", breed="Persian"),
        Cat(name="Mittens", breed="Siamese"),
        Cat(name="Shadow", breed="Black Domestic"),
        Cat(name="Luna", breed="Maine Coon"),
        Cat(name="Oliver", breed="Tabby"),
    ]

    with get_session() as session:
        existing = session.exec(select(Cat)).first()
        if existing:
            print("Database already has cats, skipping seed.")
            return

        for cat in cats:
            session.add(cat)

        session.commit()
        print(f"Created {len(cats)} cats.")


def main() -> None:
    print("Initializing database...")
    init_db()
    print("Seeding data...")
    seed_cats()
    print("Done!")


if __name__ == "__main__":
    main()
