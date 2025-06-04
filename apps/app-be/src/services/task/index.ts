// Task Service Modules
export { taskService as coreTaskService } from "./taskService";
export { taskCommentsService } from "./taskCommentsService";
export { taskChecklistsService } from "./taskChecklistsService";
export { taskTimeTrackingService } from "./taskTimeTrackingService";
export { taskDependenciesService } from "./taskDependenciesService";
export { taskUtilitiesService } from "./taskUtilitiesService";

// Import all service modules
import { taskService as coreTaskService } from "./taskService";
import { taskCommentsService } from "./taskCommentsService";
import { taskChecklistsService } from "./taskChecklistsService";
import { taskTimeTrackingService } from "./taskTimeTrackingService";
import { taskDependenciesService } from "./taskDependenciesService";
import { taskUtilitiesService } from "./taskUtilitiesService";

// Main unified task service that combines all modules
export const taskService = {
  // CRUD Operations
  createTask: coreTaskService.createTask.bind(coreTaskService),
  getTasks: coreTaskService.getTasks.bind(coreTaskService),
  getTaskById: coreTaskService.getTaskById.bind(coreTaskService),
  updateTask: coreTaskService.updateTask.bind(coreTaskService),
  deleteTask: coreTaskService.deleteTask.bind(coreTaskService),
  bulkUpdateTasks: coreTaskService.bulkUpdateTasks.bind(coreTaskService),
  reorderTasks: coreTaskService.reorderTasks.bind(coreTaskService),

  // Comments
  addComment: taskCommentsService.addComment.bind(taskCommentsService),
  getTaskComments:
    taskCommentsService.getTaskComments.bind(taskCommentsService),
  updateComment: taskCommentsService.updateComment.bind(taskCommentsService),
  deleteComment: taskCommentsService.deleteComment.bind(taskCommentsService),

  // Checklists
  addChecklist: taskChecklistsService.addChecklist.bind(taskChecklistsService),
  getTaskChecklists: taskChecklistsService.getTaskChecklists.bind(
    taskChecklistsService
  ),
  updateChecklistItem: taskChecklistsService.updateChecklistItem.bind(
    taskChecklistsService
  ),
  updateChecklistItemTitle: taskChecklistsService.updateChecklistItemTitle.bind(
    taskChecklistsService
  ),
  deleteChecklistItem: taskChecklistsService.deleteChecklistItem.bind(
    taskChecklistsService
  ),
  addChecklistItem: taskChecklistsService.addChecklistItem.bind(
    taskChecklistsService
  ),
  deleteChecklist: taskChecklistsService.deleteChecklist.bind(
    taskChecklistsService
  ),
  reorderChecklistItems: taskChecklistsService.reorderChecklistItems.bind(
    taskChecklistsService
  ),

  // Time Tracking
  trackTime: taskTimeTrackingService.trackTime.bind(taskTimeTrackingService),
  stopTimeTracking: taskTimeTrackingService.stopTimeTracking.bind(
    taskTimeTrackingService
  ),
  getTaskTimeTracking: taskTimeTrackingService.getTaskTimeTracking.bind(
    taskTimeTrackingService
  ),
  getUserTimeTracking: taskTimeTrackingService.getUserTimeTracking.bind(
    taskTimeTrackingService
  ),
  updateTimeEntry: taskTimeTrackingService.updateTimeEntry.bind(
    taskTimeTrackingService
  ),
  deleteTimeEntry: taskTimeTrackingService.deleteTimeEntry.bind(
    taskTimeTrackingService
  ),
  getActiveTimeEntry: taskTimeTrackingService.getActiveTimeEntry.bind(
    taskTimeTrackingService
  ),

  // Dependencies
  addDependency: taskDependenciesService.addDependency.bind(
    taskDependenciesService
  ),
  removeDependency: taskDependenciesService.removeDependency.bind(
    taskDependenciesService
  ),
  getTaskDependencies: taskDependenciesService.getTaskDependencies.bind(
    taskDependenciesService
  ),
  checkCircularDependency: taskDependenciesService.checkCircularDependency.bind(
    taskDependenciesService
  ),
  getDependencyChain: taskDependenciesService.getDependencyChain.bind(
    taskDependenciesService
  ),
  getBlockedTasks: taskDependenciesService.getBlockedTasks.bind(
    taskDependenciesService
  ),
  getReadyTasks: taskDependenciesService.getReadyTasks.bind(
    taskDependenciesService
  ),
  bulkAddDependencies: taskDependenciesService.bulkAddDependencies.bind(
    taskDependenciesService
  ),
  bulkRemoveDependencies: taskDependenciesService.bulkRemoveDependencies.bind(
    taskDependenciesService
  ),

  // Utilities
  getTaskActivity:
    taskUtilitiesService.getTaskActivity.bind(taskUtilitiesService),
  getTaskMetrics:
    taskUtilitiesService.getTaskMetrics.bind(taskUtilitiesService),
  duplicateTask: taskUtilitiesService.duplicateTask.bind(taskUtilitiesService),
  moveTaskToList:
    taskUtilitiesService.moveTaskToList.bind(taskUtilitiesService),
  archiveTask: taskUtilitiesService.archiveTask.bind(taskUtilitiesService),
  unarchiveTask: taskUtilitiesService.unarchiveTask.bind(taskUtilitiesService),
  getTasksByAssignee:
    taskUtilitiesService.getTasksByAssignee.bind(taskUtilitiesService),
  getOverdueTasks:
    taskUtilitiesService.getOverdueTasks.bind(taskUtilitiesService),
  generateTaskReport:
    taskUtilitiesService.generateTaskReport.bind(taskUtilitiesService),
};

// For backwards compatibility, also export as default
export default taskService;
