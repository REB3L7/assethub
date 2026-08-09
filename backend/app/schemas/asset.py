from pydantic import BaseModel


class AssetCreate(BaseModel):
    asset_tag: str
    asset_type: str
    brand: str
    model: str


class AssetResponse(AssetCreate):
    id: int
    status: str

    class Config:
        from_attributes = True