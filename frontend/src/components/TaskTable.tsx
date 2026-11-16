import {
  Button,
  HTMLTable,
  Tag,
} from "@blueprintjs/core";
import type { Intent } from "@blueprintjs/core";

import type { Task } from "../services/api";


interface Props {
  tasks: Task[];
  onDelete: (id: number) => void;
}


function statusIntent(status: string): Intent {
  switch (status) {
    case "completed":
      return "success";
    case "in-progress":
      return "warning";
    default:
      return "none";
  }
}


export default function TaskTable({
  tasks,
  onDelete,
}: Props) {

  return (
    <HTMLTable
      striped
      bordered
      interactive
      style={{
        width: "100%",
      }}
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>Task</th>
          <th>Description</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {tasks.map((task) => (

          <tr key={task.id}>

            <td>
              {task.id}
            </td>

            <td>
              {task.title}
            </td>

            <td>
              {task.description}
            </td>

            <td>
              <Tag
                intent={statusIntent(task.status)}
                minimal
                round
              >
                {task.status}
              </Tag>
            </td>

            <td>

              <Button
                icon="trash"
                intent="danger"
                minimal
                onClick={() =>
                  onDelete(task.id)
                }
              />

            </td>

          </tr>

        ))}

      </tbody>
    </HTMLTable>
  );
}