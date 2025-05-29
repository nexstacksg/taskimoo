import { internalApi, externalApi } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
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
   * Login user - uses internal API route that handles cookies
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  }

  /**
   * Register new user - uses internal API route that handles cookies
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  }

  /**
   * Logout user - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await internalApi.post('/auth/logout');
  }

  /**
   * Get current user profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<User> {
    const response = await internalApi.get<ApiResponse<{ user: User }>>('/auth/profile');
    
    // Handle different possible response structures
    if (response.data?.user) {
      return response.data.user;
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      // If the user data is directly in the data field
      return response.data as unknown as User;
    } else {
      throw new Error('Invalid user data structure');
    }
  }

  /**
   * Request password reset - goes directly to backend (no auth needed)
   */
  async forgotPassword(email: string): Promise<void> {
    await externalApi.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token - goes directly to backend (no auth needed)
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await externalApi.post('/auth/reset-password', { token, password });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await externalApi.post('/auth/resend-verification', { email });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await externalApi.post(`/auth/verify-email?token=${token}`);
  }
}

const authService = new AuthService();
export default authService;