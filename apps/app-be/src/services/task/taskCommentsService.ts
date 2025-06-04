import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskCommentsService = {
  async addComment(data: {
    taskId: string;
    authorId: string;
    content: string;
    mentions?: string[];
  }) {
    const comment = await prisma.comment.create({
      data: {
        taskId: data.taskId,
        authorId: data.authorId,
        content: data.content,
        mentions: data.mentions || [],
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: data.taskId,
        userId: data.authorId,
        type: "COMMENT_ADDED",
        changes: JSON.stringify({ comment: { added: true } }),
      },
    });

    // TODO: Send notifications to mentioned users
    if (data.mentions && data.mentions.length > 0) {
      // Implement notification logic here
    }

    return comment;
  },

  async getTaskComments(taskId: string) {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return comments;
  },

  async updateComment(
    commentId: string,
    content: string,
    userId: string
  ) {
    // Verify user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, taskId: true, content: true },
    });

    if (!comment) {
      throw new ApiError("Comment not found", HttpStatus.NOT_FOUND);
    }

    if (comment.authorId !== userId) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: comment.taskId!,
        userId,
        type: "COMMENT_UPDATED",
        changes: JSON.stringify({ 
          comment: { 
            from: comment.content,
            to: content
          }
        }),
      },
    });

    return updatedComment;
  },

  async deleteComment(commentId: string, userId: string) {
    // Verify user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, taskId: true },
    });

    if (!comment) {
      throw new ApiError("Comment not found", HttpStatus.NOT_FOUND);
    }

    if (comment.authorId !== userId) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: comment.taskId!,
        userId,
        type: "COMMENT_DELETED",
        changes: JSON.stringify({ comment: { deleted: true } }),
      },
    });
  },
};