import { createBrowserClient } from './supabase';

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const supabase = createBrowserClient();
  const ext = file.name.split('.').pop();
  const path = `${propertyId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('property-images').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('property-images').getPublicUrl(path);
  return data.publicUrl;
}
