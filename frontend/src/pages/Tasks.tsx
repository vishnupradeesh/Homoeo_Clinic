import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Elevation,
  H2,
  Icon,
  InputGroup,
  Spinner,
  TextArea,
} from "@blueprintjs/core";

import TaskTable from "../components/TaskTable";

import {
  createTask,
  deleteTask,
  getTasks,
  type Task,
} from "../services/api";


export default function Tasks() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      setLoading(true);
      setTasks(await getTasks());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreate() {
    if (!title.trim()) {
      return;
    }

    await createTask({ title, description });
    setTitle("");
    setDescription("");
    await loadTasks();
  }

  async function handleDelete(id: number) {
    await deleteTask(id);
    await loadTasks();
  }

  return (
    <div className="dashboard">

      <div className="hero hero-settings">
        <div className="hero-content">
          <H2>Tasks</H2>
          <p className="hero-subtitle">
            Track and manage clinic tasks.
          </p>
        </div>
        <div className="hero-badge">
          <Icon icon="tick" size={28} />
        </div>
      </div>

      <Card elevation={Elevation.TWO} className="contact-card">
        <h3>Create Task</h3>

        <InputGroup
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />

        <TextArea
          fill
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />

        <Button
          icon="add"
          intent="primary"
          text="Create Task"
          onClick={handleCreate}
        />
      </Card>

      <Card elevation={Elevation.ONE} className="contact-card">
        <h3>All Tasks</h3>

        {loading ? (
          <Spinner />
        ) : (
          <TaskTable tasks={tasks} onDelete={handleDelete} />
        )}
      </Card>

    </div>
  );
}
