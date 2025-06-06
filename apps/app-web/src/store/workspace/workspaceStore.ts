import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IWorkspace, IProject } from "@app/shared-types";

interface WorkspaceState {
  // Current workspace
  currentWorkspace: IWorkspace | null;
  currentProject: IProject | null;

  // Lists
  workspaces: IWorkspace[];
  projects: IProject[];

  // Loading states
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;

  // Actions
  setCurrentWorkspace: (_workspace: IWorkspace | null) => void;
  setCurrentProject: (_project: IProject | null) => void;
  setWorkspaces: (_workspaces: IWorkspace[]) => void;
  setProjects: (_projects: IProject[]) => void;
  addWorkspace: (_workspace: IWorkspace) => void;
  updateWorkspace: (_id: string, _updates: Partial<IWorkspace>) => void;
  removeWorkspace: (_id: string) => void;
  addProject: (_project: IProject) => void;
  updateProject: (_id: string, _updates: Partial<IProject>) => void;
  removeProject: (_id: string) => void;
  setLoadingWorkspaces: (_loading: boolean) => void;
  setLoadingProjects: (_loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        currentWorkspace: null,
        currentProject: null,
        workspaces: [],
        projects: [],
        isLoadingWorkspaces: false,
        isLoadingProjects: false,

        // Current selection actions
        setCurrentWorkspace: (_workspace) => {
          set((state) => {
            state.currentWorkspace = _workspace;
            // Clear current project when switching workspace
            if (_workspace?.id !== state.currentWorkspace?.id) {
              state.currentProject = null;
            }
          });
        },

        setCurrentProject: (_project) => {
          set((state) => {
            state.currentProject = _project;
          });
        },

        // Workspace actions
        setWorkspaces: (_workspaces) => {
          set((state) => {
            state.workspaces = _workspaces;
          });
        },

        addWorkspace: (_workspace) => {
          set((state) => {
            state.workspaces.push(_workspace);
          });
        },

        updateWorkspace: (_id, _updates) => {
          set((state) => {
            const index = state.workspaces.findIndex((w) => w.id === _id);
            if (index !== -1) {
              Object.assign(state.workspaces[index], _updates);

              // Update current workspace if it's the one being updated
              if (state.currentWorkspace?.id === _id) {
                Object.assign(state.currentWorkspace, _updates);
              }
            }
          });
        },

        removeWorkspace: (_id) => {
          set((state) => {
            state.workspaces = state.workspaces.filter((w) => w.id !== _id);

            // Clear current workspace if it's being removed
            if (state.currentWorkspace?.id === _id) {
              state.currentWorkspace = null;
              state.currentProject = null;
            }
          });
        },

        // Project actions
        setProjects: (_projects) => {
          set((state) => {
            state.projects = _projects;
          });
        },

        addProject: (_project) => {
          set((state) => {
            state.projects.push(_project);
          });
        },

        updateProject: (_id, _updates) => {
          set((state) => {
            const index = state.projects.findIndex((p) => p.id === _id);
            if (index !== -1) {
              Object.assign(state.projects[index], _updates);

              // Update current project if it's the one being updated
              if (state.currentProject?.id === _id) {
                Object.assign(state.currentProject, _updates);
              }
            }
          });
        },

        removeProject: (_id) => {
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== _id);

            // Clear current project if it's being removed
            if (state.currentProject?.id === _id) {
              state.currentProject = null;
            }
          });
        },

        // Loading actions
        setLoadingWorkspaces: (_loading) => {
          set((state) => {
            state.isLoadingWorkspaces = _loading;
          });
        },

        setLoadingProjects: (_loading) => {
          set((state) => {
            state.isLoadingProjects = _loading;
          });
        },
      })),
      {
        name: "workspace-storage",
        partialize: (state) => ({
          currentWorkspace: state.currentWorkspace,
          currentProject: state.currentProject,
        }),
      }
    )
  )
);
