import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UploadedPhoto {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
}

export interface UploadedVideo {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
}

export function usePhotoUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhotos = async (photos: UploadedPhoto[]): Promise<string[]> => {
    if (!user) throw new Error("User not authenticated");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        // Generate unique filename
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-photos')
          .upload(fileName, photo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / photos.length) * 100));
      }
      
      return uploadedUrls;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadVideos = async (videos: UploadedVideo[]): Promise<string[]> => {
    if (!user) throw new Error("User not authenticated");
    
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const fileExt = video.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, video.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const deletePhoto = async (photoUrl: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    
    const urlParts = photoUrl.split('/property-photos/');
    if (urlParts.length !== 2) return;
    
    const filePath = urlParts[1];
    
    await supabase.storage
      .from('property-photos')
      .remove([filePath]);
  };

  return {
    uploadPhotos,
    uploadVideos,
    deletePhoto,
    isUploading,
    uploadProgress,
  };
}
