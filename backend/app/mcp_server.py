from fastmcp import FastMCP

from app.models import CreateTask
from app.services.task_service import TaskService


mcp = FastMCP("Task Management Server")

service = TaskService()


@mcp.tool
def get_tasks():
    """
    Get all tasks.
    """

    return service.get_tasks()


@mcp.tool
def get_task(task_id: int):
    """
    Get a task by ID.
    """

    task = service.get_task(task_id)

    if not task:
        return {
            "success": False,
            "message": "Task not found",
        }

    return task


@mcp.tool
def create_task(title: str, description: str = ""):
    """
    Create a new task.
    """

    task = service.create_task(
        CreateTask(
            title=title,
            description=description,
        )
    )

    return task


@mcp.tool
def delete_task(task_id: int):
    """
    Delete a task.
    """

    success = service.delete_task(task_id)

    return {
        "success": success
    }