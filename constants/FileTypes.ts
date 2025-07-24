export const FileTypes = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    icon: 'image',
    color: '#10B981',
  },
  video: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    icon: 'videocam',
    color: '#EF4444',
  },
  audio: {
    extensions: ['.mp3', '.wav', '.aac', '.ogg', '.wma'],
    icon: 'musical-notes',
    color: '#8B5CF6',
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    icon: 'document-text',
    color: '#3B82F6',
  },
  archive: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    icon: 'archive',
    color: '#F59E0B',
  },
  code: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.py', '.java'],
    icon: 'code-slash',
    color: '#6B7280',
  },
};

export const getFileType = (filename: string) => {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  
  for (const [type, config] of Object.entries(FileTypes)) {
    if (config.extensions.includes(extension)) {
      return { type, ...config };
    }
  }
  
  return { type: 'unknown', icon: 'document', color: '#6B7280' };
};