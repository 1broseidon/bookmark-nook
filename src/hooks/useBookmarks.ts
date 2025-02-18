
import { useState } from "react";
import { Bookmark } from "@/types/bookmark";
import { toast } from "@/components/ui/use-toast";
import {
  fetchUserBookmarks,
  createBookmark,
  deleteBookmark,
  moveBookmark,
  updateBookmarkPositions,
} from "@/services/bookmarkService";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const bookmarks = await fetchUserBookmarks();
      setBookmarks(bookmarks);
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
      const newBookmark = await createBookmark(url, selectedFolderId, bookmarks.length);
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

  const removeBookmark = async (id: string) => {
    try {
      // Optimistic update
      const originalBookmarks = [...bookmarks];
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      
      await deleteBookmark(id);
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been removed.",
      });
    } catch (error: any) {
      // Revert on error
      setBookmarks(bookmarks);
      toast({
        title: "Error deleting bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveBookmarkToPosition = async (bookmarkId: string, folderId: string | null, newPosition: number) => {
    try {
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (!bookmark) return;

      // Store original state for rollback
      const originalBookmarks = [...bookmarks];

      // Optimistic update
      const updatedBookmarks = bookmarks.map(b => {
        if (b.id === bookmarkId) {
          return { ...b, folderId, position: newPosition };
        }
        // Adjust positions of other bookmarks in the same folder
        if (b.folderId === folderId && b.position >= newPosition) {
          return { ...b, position: b.position + 1 };
        }
        return b;
      }).sort((a, b) => a.position - b.position);

      setBookmarks(updatedBookmarks);

      // Attempt database update
      const result = await moveBookmark(bookmark, folderId, newPosition);
      if (!result) {
        throw new Error('Failed to move bookmark');
      }
    } catch (error: any) {
      // Revert to original state on error
      setBookmarks(bookmarks);
      toast({
        title: "Error moving bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBookmarkOrder = async (items: Bookmark[]) => {
    try {
      // Store original state for rollback
      const originalBookmarks = [...bookmarks];
      
      // Optimistic update
      setBookmarks(items);

      // Update positions in database
      const updatedItems = await updateBookmarkPositions(items);
      
      if (!updatedItems || updatedItems.length === 0) {
        throw new Error('Failed to update bookmark positions');
      }

      // Update state with the server response
      const mappedBookmarks = updatedItems.map(b => ({
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
      
      setBookmarks(mappedBookmarks);
    } catch (error: any) {
      // Revert to original state on error
      setBookmarks(bookmarks);
      toast({
        title: "Error updating bookmark order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    bookmarks,
    setBookmarks,
    isLoadingBookmarks,
    isLoading,
    fetchBookmarks,
    addBookmark,
    deleteBookmark: removeBookmark,
    moveBookmark: moveBookmarkToPosition,
    updateBookmarkPositions: updateBookmarkOrder,
  };
};
