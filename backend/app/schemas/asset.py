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

class AssetResponse(AssetCreate):
    id: int
    status: str
    assigned_to: int | None = None

    class Config:
        from_attributes = True