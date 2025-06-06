import {
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Users,
  FolderOpen,
  ArrowRight,
  Plus,
} from "lucide-react";

// This is now a server component
export default function DashboardPage() {
  // Mock data for demonstration
  const recentTasks = [
    {
      id: 1,
      title: "Update user authentication flow",
      status: "in_progress",
      priority: "high",
      dueDate: "Today",
      assignee: "JD",
    },
    {
      id: 2,
      title: "Fix responsive issues on mobile",
      status: "todo",
      priority: "medium",
      dueDate: "Tomorrow",
      assignee: "JD",
    },
    {
      id: 3,
      title: "Implement new dashboard widgets",
      status: "done",
      priority: "low",
      dueDate: "Jun 8",
      assignee: "JD",
    },
    {
      id: 4,
      title: "Review pull request #234",
      status: "todo",
      priority: "high",
      dueDate: "Today",
      assignee: "JD",
    },
  ];

  const projects = [
    { id: 1, name: "Web Platform", tasks: 24, progress: 65, team: 5 },
    { id: 2, name: "Mobile App", tasks: 18, progress: 40, team: 3 },
    { id: 3, name: "API Development", tasks: 32, progress: 80, team: 4 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case "in_progress":
        return <AlertCircle className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <Circle className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Welcome Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Welcome back!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">12</div>
              <div className="text-xs text-gray-500">Tasks Done</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium">8</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">5</div>
              <div className="text-xs text-gray-500">Due Today</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium">24</div>
              <div className="text-xs text-gray-500">Team Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Recent Tasks
                </h3>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  View all tasks <ArrowRight className="inline h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3"
                  >
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getPriorityClass(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {task.assignee}
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add new task
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Active Projects
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Plus className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <div key={project.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">
                        {project.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{project.tasks} tasks</span>
                      <span>{project.team} members</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  <Plus className="h-3 w-3" /> Create Project
                </button>
                <button className="w-full flex items-center justify-start gap-2 px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  <Users className="h-3 w-3" /> Invite Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
