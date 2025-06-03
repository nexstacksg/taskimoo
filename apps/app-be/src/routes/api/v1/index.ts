import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import testRoutes from "./test";
import workspaceRoutes from "./workspaces";
import projectRoutes from "./projects";
import taskRoutes from "./tasks";
import requirementRoutes from "./requirements";

const router = Router();

// Welcome message
router.get("/", (_req, res) => {
  res.json({
    message: "TaskiMoo API v1",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      workspaces: "/api/v1/workspaces",
      projects: "/api/v1/projects",
      tasks: "/api/v1/tasks",
      requirements: "/api/v1/requirements",
      test: "/api/v1/test",
    },
  });
});

// Route modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/requirements", requirementRoutes);
router.use("/test", testRoutes);

export default router;
