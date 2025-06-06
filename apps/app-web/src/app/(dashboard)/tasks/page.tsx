import { TasksClient } from "./TasksClient";

// Server component
export default function TasksPage() {
  // In a real app, you would fetch this data from your database
  const tasks = [
    {
      id: 1,
      title: "Update user authentication flow",
      status: "in_progress",
      priority: "high",
      assignee: { name: "John Doe", avatar: "JD" },
      dueDate: "2024-06-06",
      project: "Web Platform",
      tags: ["frontend", "auth"],
      attachments: 2,
      comments: 5,
      starred: true,
    },
    {
      id: 2,
      title: "Fix responsive issues on mobile devices",
      status: "todo",
      priority: "medium",
      assignee: { name: "Jane Smith", avatar: "JS" },
      dueDate: "2024-06-07",
      project: "Mobile App",
      tags: ["bug", "mobile"],
      attachments: 0,
      comments: 3,
      starred: false,
    },
    {
      id: 3,
      title: "Implement new dashboard widgets",
      status: "done",
      priority: "low",
      assignee: { name: "Bob Johnson", avatar: "BJ" },
      dueDate: "2024-06-08",
      project: "Web Platform",
      tags: ["feature", "dashboard"],
      attachments: 4,
      comments: 12,
      starred: false,
    },
  ];

  return <TasksClient initialTasks={tasks} />;
}
