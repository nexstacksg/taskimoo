import { internalApi } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  profilePhoto?: string;
  employeeId?: string;
  department?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

class AuthService {
  /**
   * Admin login - uses internal API route that handles cookies
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  }

  /**
   * Logout admin - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await internalApi.post('/auth/logout');
  }

  /**
   * Get current admin profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<User> {
    const response = await internalApi.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data.user;
  }
}

const authService = new AuthService();
export default authService;