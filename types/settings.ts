export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  showHiddenFiles: boolean;
  defaultSort: {
    by: 'name' | 'date' | 'size' | 'type';
    order: 'asc' | 'desc';
  };
  gridView: boolean;
  autoBackup: boolean;
}