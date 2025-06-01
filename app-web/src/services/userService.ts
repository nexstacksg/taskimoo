import { internalApi } from "./api";
import { User } from "./authService";

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  department?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

class UserService {
  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<User> {
    const response =
      await internalApi.get<ApiResponse<User>>("/users/my-profile");
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileData): Promise<User> {
    const response = await internalApi.put<ApiResponse<User>>(
      "/users/my-profile",
      data
    );
    return response.data;
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("photo", file);

    // For file uploads, we need to override the content-type
    const response = await fetch("/api/users/my-profile/photo", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload photo");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await internalApi.post("/users/change-password", {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    const response = await internalApi.get<ApiResponse<User>>(
      `/users/${userId}`
    );
    return response.data;
  }

  /**
   * List users (admin only)
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await internalApi.get<
      ApiResponse<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>
    >(`/users?${queryParams.toString()}`);

    return response.data;
  }
}

const userService = new UserService();
export default userService;
