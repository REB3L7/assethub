from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    asset_tag: str
    asset_type: str
    brand: str
    model: str


class AssetUpdate(BaseModel):
    asset_tag: str
    asset_type: str
    brand: str
    model: str
    status: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    department: str


class AssetResponse(AssetCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    assigned_to: int | None = None
    assigned_user: UserResponse | None = None
