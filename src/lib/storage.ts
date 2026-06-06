import { supabase } from './supabase';

export type BucketName = 'resumes' | 'profile-pictures' | 'talent-documents' | 'company-logo' | string;

export const BUCKET_CONSTRAINTS: Record<string, { maxSize: number; allowedTypes: string[] }> = {
  'talent-documents': {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  'company-logo': {
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'profile-pictures': {
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  'resumes': {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileConstraints = (file: File, bucket: BucketName, customAllowedExts?: string): string | null => {
  const constraints = BUCKET_CONSTRAINTS[bucket];
  if (constraints) {
    // Check file type first
    if (customAllowedExts) {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedExts = customAllowedExts.split(',').map(s => s.trim().toLowerCase());
      if (!acceptedExts.includes(fileExt)) {
        return `Invalid file type. Allowed: ${customAllowedExts.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}.`;
      }
    } else {
      if (!constraints.allowedTypes.includes(file.type) && file.type !== "") {
        const allowedExts = constraints.allowedTypes.map(t => {
          if (t.includes('wordprocessingml')) return 'docx';
          if (t.includes('msword')) return 'doc';
          return t.split('/')[1];
        });
        return `Invalid file type. Allowed: ${allowedExts.join(', ').toUpperCase()}.`;
      }
    }

    // Check file size after type is validated
    if (file.size > constraints.maxSize) {
      return `File size exceeds the limit of ${formatSize(constraints.maxSize)}.`;
    }
  }
  return null;
};

export const uploadFile = async (
  file: File,
  bucket: BucketName,
  path: string
): Promise<string> => {
  // Client-side validation before upload
  const validationError = validateFileConstraints(file, bucket);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (bucket: BucketName, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`Delete failed: ${error.message}`);
  }
};
