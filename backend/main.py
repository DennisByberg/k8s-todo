from fastapi import FastAPI

# FastAPI application instance
app = FastAPI(
    title="Todo API", description="A simple todo application API", version="1.0.0"
)

# Temporary in-memory storage
todos = [
    {"id": 1, "title": "Learn FastAPI", "completed": False},
    {"id": 2, "title": "Build Todo App", "completed": False},
    {"id": 3, "title": "Deploy to Kubernetes", "completed": False},
]


# Health check endpoint - verify API is running
@app.get("/health")
def health_check():
    """
    Simple health check endpoint.
    Returns status to verify API is running.
    """
    return {"status": "healthy"}


# Get all todos endpoint
@app.get("/api/todos")
def get_todos():
    """
    Retrieve all todos.
    Returns a list of all todo items.
    """
    return {"todos": todos}
