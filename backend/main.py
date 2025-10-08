from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import engine, get_db
from models import Base, Todo
from schemas import TodoCreate, TodoResponse

# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI application instance
app = FastAPI(
    title="Todo API", description="A simple todo application API", version="1.0.1"
)

# Configure CORS - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint - verify API is running
@app.get("/health")
def health_check():
    """
    Simple health check endpoint.
    Returns status to verify API is running.
    """
    return {"status": "healthy"}


# Get all todos endpoint
@app.get("/api/todos", response_model=List[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    """
    Retrieve all todos from database.
    Returns a list of all todo items.
    """
    todos = db.query(Todo).all()
    return todos


# Create new todo endpoint
@app.post("/api/todos", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """
    Create a new todo item.

    Args:
        todo: Todo data from request body
        db: Database session

    Returns:
        Created todo item
    """
    # Create new Todo instance
    db_todo = Todo(title=todo.title, completed=todo.completed)

    # Add to database
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    return db_todo
