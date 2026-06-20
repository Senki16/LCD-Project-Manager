import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Projects
export const projectsApi = {
  getAll: (params?: Record<string, string>) => api.get('/projects', { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks
export const tasksApi = {
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/tasks`),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  move: (id: string, data: { column: string; position: number }) => api.patch(`/tasks/${id}/move`, data),
  updateChecklist: (taskId: string, itemId: string, completed: boolean) =>
    api.patch(`/tasks/${taskId}/checklist/${itemId}`, { completed }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Files
export const filesApi = {
  getByProject: (projectId: string, folderId?: string) =>
    api.get(`/projects/${projectId}/files`, { params: folderId ? { folderId } : {} }),
  getFolders: (projectId: string, parentId?: string) =>
    api.get(`/projects/${projectId}/folders`, { params: parentId ? { parentId } : {} }),
  getRecent: (limit = 8) => api.get('/files/recent', { params: { limit } }),
  upload: (projectId: string, file: File, folderId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (folderId) form.append('folderId', folderId);
    return api.post(`/projects/${projectId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  rename: (id: string, name: string) => api.patch(`/files/${id}/rename`, { name }),
  delete: (id: string) => api.delete(`/files/${id}`),
  getDownloadUrl: (id: string) => `${BASE_URL}/files/${id}/download`,
  createFolder: (projectId: string, data: { name: string; parentId?: string }) =>
    api.post(`/projects/${projectId}/folders`, data),
  deleteFolder: (id: string) => api.delete(`/folders/${id}`),
};

// Activity
export const activityApi = {
  getAll: () => api.get('/activity'),
  getByProject: (projectId: string) => api.get(`/activity/project/${projectId}`),
  create: (data: any) => api.post('/activity', data),
};

// Comments
export const commentsApi = {
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/comments`),
  getByTask: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  create: (data: any) => api.post('/comments', data),
  update: (id: string, content: string) => api.put(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Docs
export const docsApi = {
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/docs`),
  getOne: (id: string) => api.get(`/docs/${id}`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/docs`, data),
  update: (id: string, data: any) => api.put(`/docs/${id}`, data),
  delete: (id: string) => api.delete(`/docs/${id}`),
};

// Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
};

// Search
export const searchApi = {
  search: (q: string) => api.get('/search', { params: { q } }),
};
