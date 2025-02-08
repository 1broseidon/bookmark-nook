
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
      await deleteBookmark(id);
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

  const moveBookmarkToPosition = async (bookmarkId: string, folderId: string | null, newPosition: number) => {
    try {
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (!bookmark) return;

      // Update local state optimistically
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

      await moveBookmark(bookmark, folderId, newPosition);
    } catch (error: any) {
      toast({
        title: "Error moving bookmark",
        description: error.message,
        variant: "destructive",
      });
      await fetchBookmarks(); // Revert to original state on error
    }
  };

  const updateBookmarkOrder = async (items: Bookmark[]) => {
    try {
      // Update local state optimistically
      setBookmarks(items);
      await updateBookmarkPositions(items);
    } catch (error: any) {
      toast({
        title: "Error updating bookmark order",
        description: error.message,
        variant: "destructive",
      });
      await fetchBookmarks(); // Revert to original state on error
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
