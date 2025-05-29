import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
  deviceToken?: string;
  platform?: 'ios' | 'android';
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
  accessToken: string;
  refreshToken: string;
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = response.data.data;
    
    await this.saveAuthData(authData);
    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Register data being sent:', JSON.stringify(data, null, 2));
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;
    
    await this.saveAuthData(authData);
    return authData;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    emergencyContact?: string;
    department?: string;
  }): Promise<User> {
    const response = await api.put('/users/my-profile', data);
    const updatedUser = response.data.data;
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private async saveAuthData(authData: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('accessToken', authData.accessToken);
    await AsyncStorage.setItem('refreshToken', authData.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(authData.user));
    if (authData.company) {
      await AsyncStorage.setItem('company', JSON.stringify(authData.company));
    }
  }
}

export default new AuthService();