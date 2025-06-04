import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskChecklistsService = {
  async addChecklist(data: {
    taskId: string;
    title: string;
    items: { content: string; isCompleted?: boolean }[];
    userId?: string;
  }) {
    const checklist = await prisma.checklist.create({
      data: {
        taskId: data.taskId,
        title: data.title,
        items: {
          create: data.items.map((item, index) => ({
            content: item.content,
            isCompleted: item.isCompleted || false,
            position: index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    // Create activity log
    if (data.userId) {
      await prisma.activity.create({
        data: {
          taskId: data.taskId,
          userId: data.userId,
          type: "CHECKLIST_ADDED",
          changes: JSON.stringify({ checklist: { added: data.title } }),
        },
      });
    }

    return checklist;
  },

  async getTaskChecklists(taskId: string) {
    const checklists = await prisma.checklist.findMany({
      where: { taskId },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return checklists;
  },

  async updateChecklistItem(
    itemId: string, 
    data: { isCompleted: boolean },
    userId?: string
  ) {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          select: {
            taskId: true,
            title: true,
          },
        },
      },
    });

    if (!item) {
      throw new ApiError("Checklist item not found", HttpStatus.NOT_FOUND);
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        isCompleted: data.isCompleted,
        updatedAt: new Date(),
      },
    });

    // Create activity log
    if (userId) {
      await prisma.activity.create({
        data: {
          taskId: item.checklist.taskId,
          userId,
          type: data.isCompleted
            ? "CHECKLIST_ITEM_COMPLETED"
            : "CHECKLIST_ITEM_UNCOMPLETED",
          changes: JSON.stringify({
            checklistItem: {
              content: item.content,
              isCompleted: { from: item.isCompleted, to: data.isCompleted },
            },
          }),
        },
      });
    }

    return updatedItem;
  },

  async updateChecklistItemTitle(
    itemId: string,
    content: string,
    userId: string
  ) {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          select: {
            taskId: true,
          },
        },
      },
    });

    if (!item) {
      throw new ApiError("Checklist item not found", HttpStatus.NOT_FOUND);
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: item.checklist.taskId,
        userId,
        type: "CHECKLIST_ITEM_UPDATED",
        changes: JSON.stringify({
          checklistItem: {
            content: { from: item.content, to: content },
          },
        }),
      },
    });

    return updatedItem;
  },

  async deleteChecklistItem(itemId: string, userId: string) {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          select: {
            taskId: true,
          },
        },
      },
    });

    if (!item) {
      throw new ApiError("Checklist item not found", HttpStatus.NOT_FOUND);
    }

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: item.checklist.taskId,
        userId,
        type: "CHECKLIST_ITEM_DELETED",
        changes: JSON.stringify({
          checklistItem: {
            deleted: item.content,
          },
        }),
      },
    });
  },

  async addChecklistItem(checklistId: string, content: string, userId: string) {
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      select: {
        taskId: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new ApiError("Checklist not found", HttpStatus.NOT_FOUND);
    }

    const item = await prisma.checklistItem.create({
      data: {
        checklistId,
        content,
        position: checklist._count.items,
        isCompleted: false,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: checklist.taskId,
        userId,
        type: "CHECKLIST_ITEM_ADDED",
        changes: JSON.stringify({
          checklistItem: {
            added: content,
          },
        }),
      },
    });

    return item;
  },

  async deleteChecklist(checklistId: string, userId: string) {
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      select: {
        taskId: true,
        title: true,
      },
    });

    if (!checklist) {
      throw new ApiError("Checklist not found", HttpStatus.NOT_FOUND);
    }

    // Delete all items first
    await prisma.checklistItem.deleteMany({
      where: { checklistId },
    });

    // Delete the checklist
    await prisma.checklist.delete({
      where: { id: checklistId },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: checklist.taskId,
        userId,
        type: "CHECKLIST_DELETED",
        changes: JSON.stringify({
          checklist: {
            deleted: checklist.title,
          },
        }),
      },
    });
  },

  async reorderChecklistItems(
    checklistId: string,
    itemIds: string[],
    userId: string
  ) {
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      select: {
        taskId: true,
      },
    });

    if (!checklist) {
      throw new ApiError("Checklist not found", HttpStatus.NOT_FOUND);
    }

    // Validate all items belong to the checklist
    const items = await prisma.checklistItem.findMany({
      where: {
        id: { in: itemIds },
        checklistId,
      },
      select: { id: true },
    });

    if (items.length !== itemIds.length) {
      throw new ApiError(
        "Some items do not belong to the specified checklist",
        HttpStatus.BAD_REQUEST
      );
    }

    // Update positions
    const updates = itemIds.map((itemId, index) =>
      prisma.checklistItem.update({
        where: { id: itemId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: checklist.taskId,
        userId,
        type: "CHECKLIST_REORDERED",
        changes: JSON.stringify({
          checklist: {
            reordered: itemIds.length + " items",
          },
        }),
      },
    });
  },
};
