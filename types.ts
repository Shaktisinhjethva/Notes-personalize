
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  todos?: TodoItem[]; // Optional checklist items
  drawingData?: string; // Base64 image data
  folderId: string;
  tags: string[];
  updatedAt: number;
  createdAt: number;
  isFavorite: boolean;
  isPinned: boolean;
  fontFamily?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export enum ViewMode {
  List = 'list',
  Grid = 'grid'
}

export type SidebarTab = 'all' | 'favorites' | 'trash' | 'admin' | string; // added admin

export interface AdminSettings {
  siteName: string;
  maintenanceMode: boolean;
  aiFeaturesEnabled: boolean;
  maxNoteSize: number;
  allowPublicSharing: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  lastLogin: number;
  ip?: string;
  userAgent?: string;
  createdAt?: number;
  notesCount?: number;
}
