from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    department: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str

    class Config:
        from_attributes = True