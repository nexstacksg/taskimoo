import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import {
  HttpStatus,
  ICreateWorkspace,
  IUpdateWorkspace,
  MemberPermission,
} from "@app/shared-types";
import { generateSlug } from "../../utils/slug";

export const workspaceService = {
  async createWorkspace(data: ICreateWorkspace & { ownerId: string }) {
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      throw new ApiError("Workspace slug already exists", HttpStatus.CONFLICT);
    }

    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        slug,
        owner: {
          connect: { id: data.ownerId },
        },
        // Automatically add owner as a member
        members: {
          create: {
            userId: data.ownerId,
            permission: "OWNER",
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return workspace;
  },

  async getUserWorkspaces(
    userId: string,
    pagination: { page: number; limit: number }
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.workspace.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      data: workspaces,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getWorkspaceById(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
            spaces: true,
          },
        },
      },
    });

    return workspace;
  },

  async updateWorkspace(workspaceId: string, data: IUpdateWorkspace) {
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return workspace;
  },

  async deleteWorkspace(workspaceId: string) {
    // Cascade delete will handle related records
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });
  },

  async checkUserAccess(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return !!member;
  },

  async checkUserPermission(
    workspaceId: string,
    userId: string,
    requiredPermissions: MemberPermission[]
  ): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) return false;

    return requiredPermissions.includes(member.permission as MemberPermission);
  },

  async getUserPermission(
    workspaceId: string,
    userId: string
  ): Promise<MemberPermission | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return member ? (member.permission as MemberPermission) : null;
  },

  async inviteToWorkspace(data: {
    workspaceId: string;
    email: string;
    permission: MemberPermission;
    invitedBy: string;
  }) {
    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: data.workspaceId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        throw new ApiError(
          "User is already a member of this workspace",
          HttpStatus.CONFLICT
        );
      }
    }

    // Check for existing pending invite
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId: data.workspaceId,
        email: data.email,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      throw new ApiError(
        "Invitation already sent to this email",
        HttpStatus.CONFLICT
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = await prisma.workspaceInvite.create({
      data: {
        ...data,
        expiresAt,
        status: "PENDING",
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // TODO: Send invitation email

    return invite;
  },

  async acceptInvite(inviteId: string, userEmail: string) {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      throw new ApiError("Invitation not found", HttpStatus.NOT_FOUND);
    }

    if (invite.email !== userEmail) {
      throw new ApiError("Invitation not for this user", HttpStatus.FORBIDDEN);
    }

    if (invite.status !== "PENDING") {
      throw new ApiError(
        "Invitation already processed",
        HttpStatus.BAD_REQUEST
      );
    }

    if (new Date() > invite.expiresAt) {
      throw new ApiError("Invitation has expired", HttpStatus.BAD_REQUEST);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new ApiError("User not found", HttpStatus.NOT_FOUND);
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Add user to workspace
      await tx.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: user.id,
          permission: invite.permission,
        },
      });

      // Update invite status
      await tx.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      });

      return invite.workspace;
    });

    return result;
  },

  async getWorkspaceMembers(workspaceId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            profilePhoto: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return members;
  },

  async removeWorkspaceMember(workspaceId: string, userId: string) {
    // Prevent removing the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      throw new ApiError(
        "Cannot remove workspace owner",
        HttpStatus.BAD_REQUEST
      );
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  },

  async updateMemberPermission(
    workspaceId: string,
    userId: string,
    permission: MemberPermission
  ) {
    // Prevent changing owner permission
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId && permission !== "OWNER") {
      throw new ApiError(
        "Cannot change owner permission",
        HttpStatus.BAD_REQUEST
      );
    }

    const member = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { permission },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return member;
  },

  async getWorkspaceInvites(workspaceId: string) {
    const invites = await prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  },

  async cancelInvite(inviteId: string) {
    await prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: "DECLINED" },
    });
  },
};
