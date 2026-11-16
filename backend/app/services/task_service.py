from app.models import Task, CreateTask


class TaskService:

    def __init__(self):
        self.tasks: list[Task] = [
            Task(
                id=1,
                title="Setup React frontend",
                description="Create BlueprintJS dashboard",
                status="completed",
            ),
            Task(
                id=2,
                title="Implement FastMCP",
                description="Create MCP tools",
                status="in-progress",
            ),
        ]

    def get_tasks(self) -> list[Task]:
        return self.tasks

    def get_task(self, task_id: int) -> Task | None:
        return next(
            (task for task in self.tasks if task.id == task_id),
            None,
        )

    def create_task(self, data: CreateTask) -> Task:

        new_id = max(
            [task.id for task in self.tasks],
            default=0,
        ) + 1

        task = Task(
            id=new_id,
            title=data.title,
            description=data.description,
            status="pending",
        )

        self.tasks.append(task)

        return task

    def delete_task(self, task_id: int) -> bool:

        task = self.get_task(task_id)

        if not task:
            return False

        self.tasks.remove(task)

        return True