import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../config/jwt";
import { extractBearerToken } from "../../utils/auth";
import { ApiError } from "../error/errorHandler";
import prisma from "../../database/client";
import { UserRole, UserStatus, IUser } from "@app/shared-types";

export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new ApiError("No token provided", 401, "NO_TOKEN");
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 401, "USER_NOT_FOUND");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError("Account is not active", 403, "ACCOUNT_INACTIVE");
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhoto: user.profilePhoto,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      emailVerified: !!user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError("Invalid token", 401, "INVALID_TOKEN"));
    }
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user && user.status === UserStatus.ACTIVE) {
        req.user = {
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          emailVerified: !!user.emailVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
  } catch {
    console.error("Ignore errors for optional auth");
    // Ignore errors for optional auth
  }

  next();
};
