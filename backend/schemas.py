from pydantic import BaseModel, Field
from datetime import datetime


class TodoCreate(BaseModel):
    """
    Schema for creating a new todo item.
    """

    title: str = Field(
        ..., min_length=1, max_length=100, description="Title of the todo item"
    )
    completed: bool = Field(default=False, description="Completion status")


class TodoResponse(BaseModel):
    """
    Schema for todo item response.
    """

    id: int
    title: str
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True
