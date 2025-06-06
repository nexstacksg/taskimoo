import { useAuthStore } from "@/store/auth/authStore";
import { UserRole } from "@app/shared-types";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccessAdminFeatures = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const canManageProjects = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER]);
  };

  const canEditTasks = (): boolean => {
    return hasAnyRole([
      UserRole.ADMIN,
      UserRole.PROJECT_MANAGER,
      UserRole.DEVELOPER,
      UserRole.TESTER,
    ]);
  };

  const canViewOnly = (): boolean => {
    return hasAnyRole([UserRole.VIEWER, UserRole.GUEST]);
  };

  const canCreateWorkspace = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER]);
  };

  const canInviteMembers = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER]);
  };

  const canDeleteItems = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER]);
  };

  const canAccessReports = (): boolean => {
    return !hasRole(UserRole.GUEST);
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccessAdminFeatures,
    canManageProjects,
    canEditTasks,
    canViewOnly,
    canCreateWorkspace,
    canInviteMembers,
    canDeleteItems,
    canAccessReports,
  };
}
