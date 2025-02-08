
import { supabase } from "@/integrations/supabase/client";
import { Bookmark } from "@/types/bookmark";
import { toast } from "@/components/ui/use-toast";

export const fetchUserBookmarks = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', session.user.id)
    .order('position');

  if (error) throw error;

  return bookmarks.map(b => ({
    id: b.id,
    url: b.url,
    title: b.title,
    description: b.description || 'No description available',
    image: b.image_url,
    tags: b.tags || [],
    folderId: b.folder_id,
    position: b.position,
    createdAt: new Date(b.created_at),
  }));
};

export const createBookmark = async (url: string, selectedFolderId: string | null, existingBookmarksCount: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to add bookmarks');
  }

  const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch metadata');
  }

  const { title, description, image, publisher } = data.data;
  
  const { data: bookmark, error } = await supabase
    .from('bookmarks')
    .insert({
      url,
      title: title || url,
      description: description || 'No description available',
      image_url: image?.url,
      tags: publisher ? [publisher] : [],
      folder_id: selectedFolderId,
      position: existingBookmarksCount,
      user_id: session.user.id
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description,
    image: bookmark.image_url,
    tags: bookmark.tags,
    folderId: bookmark.folder_id,
    position: bookmark.position,
    createdAt: new Date(bookmark.created_at),
  };
};

export const deleteBookmark = async (id: string) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const moveBookmark = async (bookmark: Bookmark, folderId: string | null, newPosition: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data, error } = await supabase
    .from('bookmarks')
    .update({
      folder_id: folderId,
      position: newPosition,
      user_id: session.user.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      image_url: bookmark.image,
      tags: bookmark.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookmark.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBookmarkPositions = async (items: Bookmark[]) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Create an array of updates with all required fields
  const updates = items.map((bookmark, index) => ({
    id: bookmark.id,
    position: index,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || 'No description available',
    image_url: bookmark.image,
    tags: bookmark.tags || [],
    user_id: session.user.id,
    folder_id: bookmark.folderId,
    updated_at: new Date().toISOString()
  }));

  // Perform the upsert operation
  const { error } = await supabase
    .from('bookmarks')
    .upsert(updates, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error updating bookmark positions:', error);
    throw error;
  }

  // Fetch the updated bookmarks to return the latest state
  const { data: updatedBookmarks, error: fetchError } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', session.user.id)
    .in('id', items.map(item => item.id))
    .order('position');

  if (fetchError) throw fetchError;
  return updatedBookmarks;
};
