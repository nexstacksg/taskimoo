export interface IActivity {
  id: string;
  type: string;
  taskId: string;
  userId: string;
  changes: Record<string, any>;
  createdAt: Date;
}

export interface IActivityPublic {
  id: string;
  type: string;
  taskId: string;
  userId: string;
  changes: Record<string, any>;
  createdAt: Date;
}

export interface ICreateActivity {
  type: string;
  taskId: string;
  userId: string;
  changes: Record<string, any>;
}