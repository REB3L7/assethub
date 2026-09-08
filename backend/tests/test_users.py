from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


TEST_USER_EMAIL = "testuser1@assethub.com"
TEST_USER_PASSWORD = "TestPassword123"

ADMIN_EMAIL = "olumoroti@usf.edu"
ADMIN_PASSWORD = "AdminPassword123"


def get_user_token():
    response = client.post(
        "/auth/login",
        data={
            "username": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
        },
    )

    assert response.status_code == 200
    return response.json()["access_token"]


def get_admin_token():
    response = client.post(
        "/auth/login",
        data={
            "username": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        },
    )

    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_can_get_users():
    token = get_admin_token()

    response = client.get(
        "/users/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_regular_user_cannot_get_users():
    token = get_user_token()

    response = client.get(
        "/users/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_unauthenticated_user_cannot_get_users():
    response = client.get("/users/")

    assert response.status_code == 401


def test_admin_can_create_user():
    token = get_admin_token()

    unique_email = f"test-{uuid4().hex[:8]}@assethub.com"

    response = client.post(
        "/users/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Automated Test User",
            "email": unique_email,
            "department": "IT",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == unique_email


def test_regular_user_cannot_create_user():
    token = get_user_token()

    unique_email = f"blocked-{uuid4().hex[:8]}@assethub.com"

    response = client.post(
        "/users/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Blocked User",
            "email": unique_email,
            "department": "IT",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_unauthenticated_user_cannot_create_user():
    response = client.post(
        "/users/",
        json={
            "name": "Unauthorized User",
            "email": f"unauthorized-{uuid4().hex[:8]}@assethub.com",
            "department": "IT",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 401