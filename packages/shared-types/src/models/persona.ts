export interface IPersona {
  id: string;
  name: string;
  avatar?: string | null;
  role: string; // e.g., "End User", "Administrator"
  age?: number | null;
  location?: string | null;
  bio: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  technicalProficiency: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPersonaPublic {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  bio: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  technicalProficiency: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ICreatePersona {
  name: string;
  avatar?: string;
  role: string;
  age?: number;
  location?: string;
  bio: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  technicalProficiency: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
}

export interface IUpdatePersona {
  name?: string;
  avatar?: string;
  role?: string;
  age?: number;
  location?: string;
  bio?: string;
  goals?: string[];
  frustrations?: string[];
  motivations?: string[];
  technicalProficiency?: 'LOW' | 'MEDIUM' | 'HIGH';
}