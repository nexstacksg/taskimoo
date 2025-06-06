"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Paperclip,
  MessageSquare,
  Star,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: { name: string; avatar: string };
  dueDate: string;
  project: string;
  tags: string[];
  attachments: number;
  comments: number;
  starred: boolean;
}

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [tasks] = useState(initialTasks);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks((prev) =>
      prev.length === tasks.length ? [] : tasks.map((t) => t.id)
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Left side */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              Group by: <span className="font-medium">Status</span>
              <ChevronDown className="inline h-3 w-3 ml-1" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {selectedTasks.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedTasks.length} selected
                </span>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white">
                  Bulk Edit
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
              </>
            )}

            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === tasks.length}
                  onChange={toggleAllTasks}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-2 w-10"></th>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2 w-24">Status</th>
              <th className="px-4 py-2 w-20">Priority</th>
              <th className="px-4 py-2 w-32">Assignee</th>
              <th className="px-4 py-2 w-28">Due Date</th>
              <th className="px-4 py-2 w-32">Project</th>
              <th className="px-4 py-2 w-20">Tags</th>
              <th className="px-4 py-2 w-16 text-center">
                <Paperclip className="h-3.5 w-3.5 inline" />
              </th>
              <th className="px-4 py-2 w-16 text-center">
                <MessageSquare className="h-3.5 w-3.5 inline" />
              </th>
              <th className="px-4 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`hover:bg-gray-50 ${
                  selectedTasks.includes(task.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    className={`p-0.5 hover:bg-gray-100 rounded ${
                      task.starred ? "text-yellow-500" : ""
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        task.starred ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs text-gray-600 capitalize">
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {task.assignee.avatar}
                    </div>
                    <span className="text-sm text-gray-700">
                      {task.assignee.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-sm text-gray-700">{task.project}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    {task.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  {task.attachments > 0 && (
                    <span className="text-xs text-gray-500">
                      {task.attachments}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {task.comments > 0 && (
                    <span className="text-xs text-gray-500">
                      {task.comments}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
