from pydantic import BaseModel


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
    id: int
    name: str
    email: str
    department: str

    class Config:
        from_attributes = True


class AssetResponse(AssetCreate):
    id: int
    status: str
    assigned_to: int | None = None
    assigned_user: UserResponse | None = None

    class Config:
        from_attributes = True