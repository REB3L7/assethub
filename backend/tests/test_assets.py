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

def unique_asset_tag(prefix):

    return f"{prefix}-{uuid4().hex[:8]}"

def create_test_asset(token, prefix="TEST-ASSET"):

    response = client.post(

        "/assets/",

        headers={"Authorization": f"Bearer {token}"},

        json={

            "asset_tag": unique_asset_tag(prefix),

            "asset_type": "Laptop",

            "brand": "Apple",

            "model": "MacBook Pro",

        },

    )

    assert response.status_code == 200

    return response.json()

def test_authenticated_user_can_get_assets():

    token = get_user_token()

    response = client.get(

        "/assets/",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 200

    assert isinstance(response.json(), list)

def test_unauthenticated_user_cannot_get_assets():

    response = client.get("/assets/")

    assert response.status_code == 401

def test_admin_can_get_single_asset():

    token = get_admin_token()

    response = client.get(

        "/assets/3",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 200

    assert response.json()["id"] == 3

def test_get_nonexistent_asset_returns_404():

    token = get_admin_token()

    response = client.get(

        "/assets/999999",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 404

    assert response.json()["detail"] == "Asset not found"

def test_admin_can_assign_asset():

    token = get_admin_token()

    asset = create_test_asset(token, "TEST-ASSIGN")

    asset_id = asset["id"]

    response = client.post(

        f"/assets/{asset_id}/assign/2",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 200

    assert response.json()["assigned_to"] == 2

    assert response.json()["status"] == "Assigned"

def test_cannot_assign_already_assigned_asset():

    token = get_admin_token()

    asset = create_test_asset(token, "TEST-DOUBLE-ASSIGN")

    asset_id = asset["id"]

    first_response = client.post(

        f"/assets/{asset_id}/assign/2",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert first_response.status_code == 200

    second_response = client.post(

        f"/assets/{asset_id}/assign/2",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert second_response.status_code == 400

def test_admin_can_unassign_asset():

    token = get_admin_token()

    asset = create_test_asset(token, "TEST-UNASSIGN")

    asset_id = asset["id"]

    assign_response = client.post(

        f"/assets/{asset_id}/assign/2",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert assign_response.status_code == 200

    response = client.post(

        f"/assets/{asset_id}/unassign",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 200

    assert response.json()["assigned_to"] is None

    assert response.json()["status"] == "Available"

def test_assign_nonexistent_asset_returns_404():

    token = get_admin_token()

    response = client.post(

        "/assets/999999/assign/2",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 404

    assert response.json()["detail"] == "Asset not found"

def test_assign_asset_to_nonexistent_user_returns_404():

    token = get_admin_token()

    asset = create_test_asset(token, "TEST-NO-USER")

    asset_id = asset["id"]

    response = client.post(

        f"/assets/{asset_id}/assign/999999",

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 404

    assert response.json()["detail"] == "User not found"

def test_admin_can_update_asset_status():

    token = get_admin_token()

    asset = create_test_asset(token, "TEST-STATUS")

    asset_id = asset["id"]

    response = client.patch(

        f"/assets/{asset_id}/status",

        params={"status": "Maintenance"},

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 200

    assert response.json()["status"] == "Maintenance"

def test_regular_user_cannot_update_asset_status():

    token = get_user_token()

    response = client.patch(

        "/assets/3/status",

        params={"status": "Retired"},

        headers={"Authorization": f"Bearer {token}"},

    )

    assert response.status_code == 403

    assert response.json()["detail"] == "Admin access required"

def test_unauthenticated_user_cannot_get_single_asset():
    response = client.get("/assets/3")

    assert response.status_code == 401

def test_duplicate_asset_tag_returns_409():
    token = get_admin_token()

    asset_tag = unique_asset_tag("TEST-DUPLICATE")

    first_response = client.post(
        "/assets/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "asset_tag": asset_tag,
            "asset_type": "Laptop",
            "brand": "Apple",
            "model": "MacBook Pro",
        },
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/assets/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "asset_tag": asset_tag,
            "asset_type": "Laptop",
            "brand": "Apple",
            "model": "MacBook Pro",
        },
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == (
        "An asset with this asset tag already exists"
    )