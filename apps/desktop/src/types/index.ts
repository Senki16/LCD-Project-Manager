export type UserRole = 'ADMIN' | 'MEMBER' | 'OBSERVER';
export type ProjectStatus = 'IDEA' | 'PLANNING' | 'IN_DEVELOPMENT' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskColumn = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  role: UserRole;
  createdAt: string;
}

export interface ProjectCollaborator {
  id: string;
  userId: string;
  role: 'MEMBER' | 'OBSERVER';
  user: Pick<User, 'id' | 'name' | 'email' | 'color' | 'avatar'>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  ownerId: string;
  owner: Pick<User, 'id' | 'name' | 'email' | 'color' | 'avatar'>;
  collaborators: ProjectCollaborator[];
  startDate?: string;
  endDate?: string;
  tags?: string;
  color: string;
  emoji?: string;
  tasks?: Task[];
  _count?: { tasks: number; files: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  text: string;
  completed: boolean;
  position: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskColumn;
  priority: Priority;
  column: TaskColumn;
  position: number;
  dueDate?: string;
  tags?: string;
  assignees: Array<{ id: string; userId: string; user: Pick<User, 'id' | 'name' | 'color' | 'avatar'> }>;
  checklists: ChecklistItem[];
  _count?: { comments: number; attachments: number };
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  projectId?: string;
  taskId?: string;
  folderId?: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  path: string;
  version: number;
  project?: Pick<Project, 'id' | 'name' | 'emoji'>;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  parentId?: string;
  _count?: { files: number; children: number };
  createdAt: string;
}

export interface Doc {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId?: string;
  taskId?: string;
  authorId: string;
  author: Pick<User, 'id' | 'name' | 'color' | 'avatar'>;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId?: string;
  project?: Pick<Project, 'id' | 'name' | 'emoji'>;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'color' | 'avatar'>;
  type: string;
  description: string;
  metadata?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  byStatus: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  recentActivity: Activity[];
}

export interface SearchResults {
  projects: Array<Pick<Project, 'id' | 'name' | 'description' | 'status' | 'emoji' | 'color'>>;
  tasks: Array<Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'projectId'> & { project: { name: string } }>;
  files: Array<Pick<FileRecord, 'id' | 'name' | 'extension' | 'mimeType' | 'projectId'> & { project: { name: string } }>;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  IDEA: 'Idea',
  PLANNING: 'Planeación',
  IN_DEVELOPMENT: 'En Desarrollo',
  IN_REVIEW: 'En Revisión',
  COMPLETED: 'Completado',
  ARCHIVED: 'Archivado',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  IDEA: '#8E8E93',
  PLANNING: '#FF9500',
  IN_DEVELOPMENT: '#007AFF',
  IN_REVIEW: '#AF52DE',
  COMPLETED: '#34C759',
  ARCHIVED: '#636366',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#34C759',
  MEDIUM: '#FF9500',
  HIGH: '#FF3B30',
  CRITICAL: '#FF2D55',
};

export const COLUMN_LABELS: Record<TaskColumn, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Proceso',
  BLOCKED: 'Bloqueado',
  IN_REVIEW: 'En Revisión',
  COMPLETED: 'Completado',
};

export const COLUMN_COLORS: Record<TaskColumn, string> = {
  PENDING: '#8E8E93',
  IN_PROGRESS: '#007AFF',
  BLOCKED: '#FF3B30',
  IN_REVIEW: '#AF52DE',
  COMPLETED: '#34C759',
};
