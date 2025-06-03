import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import {
  HttpStatus,
  ICreateRequirement,
  IUpdateRequirement,
  RequirementType,
  RequirementStatus,
} from "@app/shared-types";

export const requirementService = {
  async createRequirement(data: ICreateRequirement & { authorId: string }) {
    // Generate requirement code based on type
    const code = await this.generateRequirementCode(data.projectId, data.type);

    const requirement = await prisma.requirement.create({
      data: {
        ...data,
        code,
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
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Create initial history entry
    await this.createHistoryEntry(requirement.id, {
      version: 1,
      changes: {
        action: "created",
        title: requirement.title,
        description: requirement.description,
        type: requirement.type,
        priority: requirement.priority,
      },
      changedBy: data.authorId,
    });

    // Trigger AI analysis in background (non-blocking)
    this.analyzeRequirementAsync(requirement.id).catch(console.error);

    return requirement;
  },

  async generateRequirementCode(
    projectId: string,
    type: RequirementType
  ): Promise<string> {
    // Get project key for prefix
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { key: true },
    });

    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Get type prefix
    const typePrefix = this.getTypePrefix(type);

    // Get next sequence number for this type in project
    const lastRequirement = await prisma.requirement.findFirst({
      where: {
        projectId,
        type,
      },
      orderBy: { createdAt: "desc" },
      select: { code: true },
    });

    let sequence = 1;
    if (lastRequirement) {
      // Extract sequence number from code (e.g., "PROJ-FR-001" -> 1)
      const match = lastRequirement.code.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    return `${project.key}-${typePrefix}-${sequence.toString().padStart(3, "0")}`;
  },

  getTypePrefix(type: RequirementType): string {
    const prefixes = {
      FUNCTIONAL: "FR",
      NON_FUNCTIONAL: "NFR",
      TECHNICAL: "TR",
      BUSINESS_RULE: "BR",
      CONSTRAINT: "CR",
    };
    return prefixes[type] || "REQ";
  },

  async getRequirements(filters: {
    projectId: string;
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { projectId, type, status, priority, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      projectId,
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
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
          _count: {
            select: {
              linkedTasks: true,
              attachments: true,
              history: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.requirement.count({ where }),
    ]);

    return {
      data: requirements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRequirementById(requirementId: string) {
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
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
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        linkedTasks: {
          include: {
            sourceTask: {
              select: {
                id: true,
                title: true,
                number: true,
                status: true,
                type: true,
              },
            },
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            history: true,
          },
        },
      },
    });

    return requirement;
  },

  async updateRequirement(
    requirementId: string,
    data: IUpdateRequirement,
    userId: string
  ) {
    const currentRequirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: {
        version: true,
        title: true,
        description: true,
        type: true,
        status: true,
        priority: true,
        acceptanceCriteria: true,
        dependencies: true,
        tags: true,
      },
    });

    if (!currentRequirement) {
      throw new ApiError("Requirement not found", HttpStatus.NOT_FOUND);
    }

    // Increment version for significant changes
    const isSignificantChange =
      data.title ||
      data.description ||
      data.type ||
      data.acceptanceCriteria ||
      data.dependencies;

    const newVersion = isSignificantChange
      ? currentRequirement.version + 1
      : currentRequirement.version;

    const requirement = await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        ...data,
        version: newVersion,
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
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Track changes for history
    const changes: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const currentValue = (currentRequirement as any)[key];
      const newValue = (data as any)[key];
      if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
        changes[key] = { from: currentValue, to: newValue };
      }
    });

    if (Object.keys(changes).length > 0) {
      await this.createHistoryEntry(requirementId, {
        version: newVersion,
        changes: {
          action: "updated",
          ...changes,
        },
        changedBy: userId,
      });

      // Re-analyze requirement if content changed
      if (data.title || data.description || data.acceptanceCriteria) {
        this.analyzeRequirementAsync(requirementId).catch(console.error);
      }
    }

    return requirement;
  },

  async deleteRequirement(requirementId: string) {
    // Check if requirement has linked tasks
    const linkedTasksCount = await prisma.taskLink.count({
      where: { requirementId },
    });

    if (linkedTasksCount > 0) {
      throw new ApiError(
        "Cannot delete requirement with linked tasks. Remove task links first.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Cascade delete will handle related records
    await prisma.requirement.delete({
      where: { id: requirementId },
    });
  },

  async createHistoryEntry(
    requirementId: string,
    data: {
      version: number;
      changes: Record<string, any>;
      changedBy: string;
    }
  ) {
    await prisma.requirementHistory.create({
      data: {
        requirementId,
        version: data.version,
        changes: JSON.stringify(data.changes),
        changedBy: data.changedBy,
      },
    });
  },

  async getRequirementHistory(requirementId: string) {
    const history = await prisma.requirementHistory.findMany({
      where: { requirementId },
      orderBy: { createdAt: "desc" },
    });

    return history.map((entry) => ({
      ...entry,
      changes: JSON.parse(entry.changes),
    }));
  },

  // AI-powered features
  async analyzeRequirement(requirementId: string) {
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: {
        title: true,
        description: true,
        type: true,
        acceptanceCriteria: true,
      },
    });

    if (!requirement) {
      throw new ApiError("Requirement not found", HttpStatus.NOT_FOUND);
    }

    // TODO: Integrate with AI service for analysis
    const analysis = await this.performAIAnalysis(requirement);

    // Update quality score
    await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        qualityScore: analysis.qualityScore,
      },
    });

    return analysis;
  },

  async analyzeRequirementAsync(requirementId: string) {
    try {
      await this.analyzeRequirement(requirementId);
    } catch (error) {
      console.error(`Failed to analyze requirement ${requirementId}:`, error);
    }
  },

  async performAIAnalysis(requirement: {
    title: string;
    description: string;
    type: string;
    acceptanceCriteria: string[];
  }) {
    // Placeholder for AI analysis - integrate with your AI service
    // This would call OpenAI, Claude, or custom AI models

    const suggestions: string[] = [];
    let qualityScore = 70; // Base score

    // Basic quality checks
    if (requirement.title.length < 10) {
      suggestions.push("Title should be more descriptive (at least 10 characters)");
      qualityScore -= 10;
    }

    if (requirement.description.length < 50) {
      suggestions.push("Description should be more detailed (at least 50 characters)");
      qualityScore -= 15;
    }

    if (requirement.acceptanceCriteria.length === 0) {
      suggestions.push("Add acceptance criteria to make the requirement testable");
      qualityScore -= 20;
    }

    // Check for ambiguous language
    const ambiguousWords = ["maybe", "probably", "some", "several", "many"];
    const hasAmbiguousLanguage = ambiguousWords.some((word) =>
      requirement.description.toLowerCase().includes(word)
    );

    if (hasAmbiguousLanguage) {
      suggestions.push("Avoid ambiguous language - be specific and measurable");
      qualityScore -= 10;
    }

    // Check for testability
    if (
      requirement.type === "FUNCTIONAL" &&
      !requirement.description.toLowerCase().includes("should")
    ) {
      suggestions.push("Functional requirements should clearly state what the system should do");
      qualityScore -= 5;
    }

    return {
      qualityScore: Math.max(0, Math.min(100, qualityScore)),
      suggestions,
      completeness: {
        hasTitle: requirement.title.length > 0,
        hasDescription: requirement.description.length > 0,
        hasAcceptanceCriteria: requirement.acceptanceCriteria.length > 0,
        isTestable: requirement.acceptanceCriteria.length > 0,
      },
      potentialIssues: suggestions,
    };
  },

  async generateTestCases(requirementId: string) {
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: {
        title: true,
        description: true,
        type: true,
        acceptanceCriteria: true,
      },
    });

    if (!requirement) {
      throw new ApiError("Requirement not found", HttpStatus.NOT_FOUND);
    }

    // TODO: Integrate with AI service for test case generation
    const testCases = await this.generateAITestCases(requirement);

    // Store test case IDs in requirement
    await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        testCases: testCases.map((tc) => tc.id),
      },
    });

    return testCases;
  },

  async generateAITestCases(requirement: {
    title: string;
    description: string;
    type: string;
    acceptanceCriteria: string[];
  }) {
    // Placeholder for AI test case generation
    // This would call AI service to generate test cases

    const testCases = [];

    // Generate test cases based on acceptance criteria
    for (let i = 0; i < requirement.acceptanceCriteria.length; i++) {
      const criteria = requirement.acceptanceCriteria[i];

      testCases.push({
        id: `TC-${Date.now()}-${i + 1}`,
        title: `Test case for: ${criteria.substring(0, 50)}...`,
        description: `Verify that ${criteria}`,
        steps: [
          "Setup test environment",
          "Execute the specified action",
          "Verify the expected outcome",
        ],
        expectedResult: criteria,
        priority: "MEDIUM",
        type: "FUNCTIONAL",
      });
    }

    // Generate edge case tests
    if (requirement.type === "FUNCTIONAL") {
      testCases.push({
        id: `TC-${Date.now()}-edge`,
        title: `Edge case testing for ${requirement.title}`,
        description: `Test boundary conditions and edge cases for ${requirement.title}`,
        steps: [
          "Identify boundary values",
          "Test with minimum values",
          "Test with maximum values",
          "Test with invalid inputs",
        ],
        expectedResult: "System handles edge cases gracefully",
        priority: "HIGH",
        type: "BOUNDARY",
      });
    }

    return testCases;
  },

  async linkToTask(requirementId: string, taskId: string) {
    // Check if link already exists
    const existingLink = await prisma.taskLink.findFirst({
      where: {
        requirementId,
        sourceTaskId: taskId,
      },
    });

    if (existingLink) {
      throw new ApiError("Task is already linked to this requirement", HttpStatus.CONFLICT);
    }

    const link = await prisma.taskLink.create({
      data: {
        sourceTaskId: taskId,
        requirementId,
        linkType: "implements",
      },
      include: {
        sourceTask: {
          select: {
            id: true,
            title: true,
            number: true,
            status: true,
          },
        },
        requirement: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return link;
  },

  async unlinkFromTask(requirementId: string, taskId: string) {
    await prisma.taskLink.deleteMany({
      where: {
        requirementId,
        sourceTaskId: taskId,
      },
    });
  },

  async getRequirementCoverage(projectId: string) {
    const [
      totalRequirements,
      implementedRequirements,
      testedRequirements,
    ] = await Promise.all([
      prisma.requirement.count({
        where: { projectId },
      }),
      prisma.requirement.count({
        where: {
          projectId,
          status: "IMPLEMENTED",
        },
      }),
      prisma.requirement.count({
        where: {
          projectId,
          testCases: {
            not: {
              equals: [],
            },
          },
        },
      }),
    ]);

    return {
      total: totalRequirements,
      implemented: implementedRequirements,
      tested: testedRequirements,
      implementationCoverage:
        totalRequirements > 0 ? (implementedRequirements / totalRequirements) * 100 : 0,
      testCoverage: totalRequirements > 0 ? (testedRequirements / totalRequirements) * 100 : 0,
    };
  },

  async detectDuplicates(projectId: string, title: string, description: string) {
    // Simple similarity check - could be enhanced with AI
    const requirements = await prisma.requirement.findMany({
      where: { projectId },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
      },
    });

    const potentialDuplicates = requirements.filter((req) => {
      const titleSimilarity = this.calculateSimilarity(title, req.title);
      const descSimilarity = this.calculateSimilarity(description, req.description);

      return titleSimilarity > 0.8 || descSimilarity > 0.7;
    });

    return potentialDuplicates;
  },

  calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity - could be enhanced with AI embeddings
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  },
};