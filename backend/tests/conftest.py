import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base, get_db
from app.main import app
from app.auth.dependencies import get_db
from app.auth.security import hash_password
from app.models.user import User


TEST_DATABASE_URL = "postgresql://roti@localhost/assethub_test"

test_engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    admin = User(
        name="Test Admin",
        email="admin@test.assethub.com",
        department="IT",
        password_hash=hash_password("AdminPassword123"),
        role="Admin",
    )

    regular_user = User(
        name="Test User",
        email="user@test.assethub.com",
        department="Operations",
        password_hash=hash_password("TestPassword123"),
        role="User",
    )

    db.add(admin)
    db.add(regular_user)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)