import { Request, Response, NextFunction } from "express";
import authService from "../../services/auth/authService";
import { AuthRequest } from "../../middleware/auth/authenticate";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  EmailVerificationRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ErrorCode,
  HttpStatus,
  ApiResponse,
} from "@app/shared-types";

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, RefreshTokenRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    await authService.logout(req.user.id);

    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const user = await authService.getCurrentUser(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request<{}, {}, EmailVerificationRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.verifyEmail(req.body.token);

    const response: ApiResponse = {
      success: true,
      message: "Email verified successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request<{}, {}, PasswordResetRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.requestPasswordReset(req.body.email);

    const response: ApiResponse = {
      success: true,
      message: "Password reset email sent if the email exists",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{}, {}, PasswordResetConfirmRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);

    const response: ApiResponse = {
      success: true,
      message: "Password reset successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
