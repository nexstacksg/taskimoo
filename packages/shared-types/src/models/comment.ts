export interface IComment {
  id: string;
  content: string;
  authorId: string;
  taskId?: string | null;
  parentId?: string | null;
  mentions: string[];
  reactions?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentPublic {
  id: string;
  content: string;
  authorId: string;
  taskId: string | null;
  parentId: string | null;
  mentions: string[];
  reactions: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateComment {
  content: string;
  taskId?: string;
  parentId?: string;
  mentions?: string[];
}

export interface IUpdateComment {
  content?: string;
  mentions?: string[];
  reactions?: Record<string, any>;
}