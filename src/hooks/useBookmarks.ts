
import { useState } from "react";
import { Bookmark } from "@/types/bookmark";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position');

      if (error) throw error;

      setBookmarks(bookmarks.map(b => ({
        id: b.id,
        url: b.url,
        title: b.title,
        description: b.description || 'No description available',
        image: b.image_url,
        tags: b.tags || [],
        folderId: b.folder_id,
        position: b.position,
        createdAt: new Date(b.created_at),
      })));
    } catch (error: any) {
      toast({
        title: "Error fetching bookmarks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const addBookmark = async (url: string, selectedFolderId: string | null) => {
    setIsLoading(true);
    try {
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
          position: bookmarks.length,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newBookmark: Bookmark = {
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

      setBookmarks((prev) => [newBookmark, ...prev]);
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been successfully added.",
      });
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error adding bookmark",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveBookmark = async (bookmarkId: string, folderId: string | null, newPosition: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (!bookmark) return;

      const { error } = await supabase
        .from('bookmarks')
        .update({
          folder_id: folderId,
          position: newPosition,
          user_id: session.user.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          image_url: bookmark.image,
          tags: bookmark.tags
        })
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(prev => {
        const updatedBookmarks = prev.map(b => {
          if (b.id === bookmarkId) {
            return { ...b, folderId, position: newPosition };
          }
          // Adjust positions of other bookmarks in the same folder
          if (b.folderId === folderId && b.position >= newPosition) {
            return { ...b, position: b.position + 1 };
          }
          return b;
        });
        return updatedBookmarks.sort((a, b) => a.position - b.position);
      });
    } catch (error: any) {
      toast({
        title: "Error moving bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBookmarkPositions = async (items: Bookmark[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const updates = items.map((bookmark, index) => ({
        id: bookmark.id,
        position: index,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        image_url: bookmark.image,
        tags: bookmark.tags,
        user_id: session.user.id,
        folder_id: bookmark.folderId
      }));

      const { error } = await supabase
        .from('bookmarks')
        .upsert(updates);

      if (error) throw error;

      // Update local state to match server state
      setBookmarks(items);
    } catch (error: any) {
      toast({
        title: "Error updating bookmark order",
        description: error.message,
        variant: "destructive",
      });
      // Reload original order if server update fails
      await fetchBookmarks();
    }
  };

  return {
    bookmarks,
    setBookmarks,
    isLoadingBookmarks,
    isLoading,
    fetchBookmarks,
    addBookmark,
    deleteBookmark,
    moveBookmark,
    updateBookmarkPositions,
  };
};
