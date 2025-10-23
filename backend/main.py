from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import engine, get_db, DATABASE_URL
from models import Base, Todo
from schemas import TodoCreate, TodoUpdate, TodoResponse

# Create database tables
Base.metadata.create_all(bind=engine)


# Parse database host from connection string for display
def get_database_info() -> dict:
    """Extract database connection info for health checks"""
    try:
        # DATABASE_URL format: postgresql://user:pass@host:port/dbname
        if "postgres.database.azure.com" in DATABASE_URL:
            return {
                "type": "Azure Database for PostgreSQL",
                "managed": True,
                "host": (
                    DATABASE_URL.split("@")[1].split(":")[0]
                    if "@" in DATABASE_URL
                    else "unknown"
                ),
            }
        else:
            return {
                "type": "In-Cluster PostgreSQL",
                "managed": False,
                "host": (
                    DATABASE_URL.split("@")[1].split(":")[0]
                    if "@" in DATABASE_URL
                    else "localhost"
                ),
            }
    except Exception:
        return {"type": "PostgreSQL", "managed": False, "host": "unknown"}


db_info = get_database_info()

# FastAPI application instance with custom docs URL
app = FastAPI(
    title="Todo API",
    description="A simple todo application API",
    version="1.0.2",
    docs_url="/api/docs",  # Swagger UI at /api/docs
    redoc_url="/api/redoc",  # ReDoc at /api/redoc
    openapi_url="/api/openapi.json",  # OpenAPI schema at /api/openapi.json
)

# Configure CORS - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# General purpose health check endpoint
# Used by: developers, monitoring tools, CI/CD pipelines
# Can be used for manual health verification and debugging
@app.get("/health")
def health_check():
    """
    Simple health check endpoint with database information.
    Returns status and database connection details.
    """
    return {"status": "healthy", "database": db_info}


# Azure Load Balancer health probe endpoint
# Used by: Azure Load Balancer infrastructure
# Critical: Must return 200 OK or Load Balancer blocks traffic
# Required for Ingress to function properly
@app.get("/healthz")
def healthz():
    """
    Health probe endpoint for Azure Load Balancer.
    Returns minimal response to verify API is running.
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


# Update todo endpoint
@app.put("/api/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_update: TodoUpdate, db: Session = Depends(get_db)):
    """
    Update an existing todo item (toggle completed status).

    Args:
        todo_id: ID of the todo to update
        todo_update: Updated completion status
        db: Database session

    Returns:
        Updated todo item
    """
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    # Only update completed status
    db_todo.completed = todo_update.completed  # type: ignore

    db.commit()
    db.refresh(db_todo)

    return db_todo
