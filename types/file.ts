export interface FileItem {
  name: string;
  uri: string;
  type: 'file' | 'folder';
  size?: number;
  modificationTime?: number;
  isDirectory: boolean;
  extension?: string;
  mimeType?: string;
}

export interface FileOperations {
  copy: (source: string, destination: string) => Promise<void>;
  move: (source: string, destination: string) => Promise<void>;
  delete: (uri: string) => Promise<void>;
  rename: (oldUri: string, newName: string) => Promise<void>;
  createFolder: (path: string, name: string) => Promise<void>;
  createFile: (path: string, name: string, content?: string) => Promise<void>;
}

export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';