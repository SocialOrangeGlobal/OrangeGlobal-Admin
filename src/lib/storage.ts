import { supabase } from './supabase';

export type BucketName = 'resumes' | 'profile-pictures' | 'talent-documents' | string;

export const uploadFile = async (
  file: File,
  bucket: BucketName,
  path: string
): Promise<string> => {
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
