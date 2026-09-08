from fastapi.testclient import TestClient
from uuid import uuid4
from app.main import app


client = TestClient(app)


def test_login_success():
    response = client.post(
        "/auth/login",
        data={
            "username": "testuser1@assethub.com",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_wrong_password():
    response = client.post(
        "/auth/login",
        data={
            "username": "testuser1@assethub.com",
            "password": "DefinitelyWrongPassword123!",
        },
    )

    assert response.status_code == 401

def test_user_cannot_create_asset():
    login_response = client.post(
        "/auth/login",
        data={
            "username": "testuser1@assethub.com",
            "password": "TestPassword123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.post(
        "/assets/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "asset_tag": "TEST-AUTO-001",
            "asset_type": "Laptop",
            "brand": "Apple",
            "model": "MacBook Air",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"

def test_admin_can_create_asset():
    login_response = client.post(
        "/auth/login",
        data={
            "username": "olumoroti@usf.edu",
            "password": "AdminPassword123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    asset_tag = f"TEST-AUTO-ADMIN-{uuid4().hex[:8]}"

    response = client.post(
        "/assets/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "asset_tag": asset_tag,
            "asset_type": "Laptop",
            "brand": "Apple",
            "model": "MacBook Pro",
        },
    )

    assert response.status_code == 200
    assert response.json()["asset_tag"] == asset_tag

def test_unauthenticated_user_cannot_create_asset():
    response = client.post(
        "/assets/",
        json={
            "asset_tag": "TEST-AUTO-NOAUTH-001",
            "asset_type": "Laptop",
            "brand": "Apple",
            "model": "MacBook Pro",
        },
    )

    assert response.status_code == 401