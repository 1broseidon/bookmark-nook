
import { useState, useEffect } from "react";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import ViewToggle from "@/components/ViewToggle";
import FolderList from "@/components/FolderList";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext } from "@hello-pangea/dnd";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useFolders } from "@/hooks/useFolders";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const Index = () => {
  const [search, setSearch] = useState("");
  const { checkUser, handleLogout, subscribeToAuthChanges } = useAuth();
  const {
    bookmarks,
    setBookmarks,
    isLoadingBookmarks,
    isLoading,
    fetchBookmarks,
    addBookmark,
    deleteBookmark,
    moveBookmark,
    updateBookmarkPositions,
  } = useBookmarks();
  const {
    folders,
    selectedFolderId,
    isLoadingFolders,
    setSelectedFolderId,
    fetchFolders,
    createFolder,
    reorderFolders,
  } = useFolders();
  const {
    viewMode,
    isLoadingPreferences,
    fetchUserPreferences,
    updateViewMode,
  } = useUserPreferences();

  useEffect(() => {
    checkUser();
    fetchBookmarks();
    fetchUserPreferences();
    fetchFolders();

    const subscription = subscribeToAuthChanges(() => {
      fetchBookmarks();
      fetchUserPreferences();
      fetchFolders();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    
    if (sourceId !== destinationId) {
      const bookmarkId = result.draggableId;
      const newFolderId = destinationId === 'main' ? null : destinationId;
      await moveBookmark(bookmarkId, newFolderId, result.destination.index);
    } else {
      const items = Array.from(bookmarks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setBookmarks(items);
      await updateBookmarkPositions(items);
    }
  };

  const filteredBookmarks = bookmarks
    .filter(b => 
      (!selectedFolderId || b.folderId === selectedFolderId) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
       b.description.toLowerCase().includes(search.toLowerCase()) ||
       b.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => a.position - b.position);

  if (isLoadingPreferences || isLoadingFolders) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="bg-background hover:bg-background/80"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <div className="container py-16 space-y-12 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light tracking-tight">
            Bookmark Manager
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save and organize your favorite links in a beautiful, minimalist space
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
          <div className="space-y-8">
            <FolderList
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={createFolder}
              onReorderFolders={reorderFolders}
            />
          </div>
          <div className="space-y-8">
            <BookmarkForm 
              onSubmit={(url) => addBookmark(url, selectedFolderId)} 
              isLoading={isLoading} 
            />
            <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
              <SearchBar value={search} onChange={setSearch} />
              <ViewToggle viewMode={viewMode} onViewChange={updateViewMode} />
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              {isLoadingBookmarks ? (
                <div className="text-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Loading your bookmarks...</p>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground bg-background/50 backdrop-blur-sm rounded-2xl border border-theme/20">
                  <p className="text-xl font-light">No bookmarks yet.</p>
                  <p className="text-base mt-2">Add your first one above!</p>
                </div>
              ) : (
                <BookmarkGrid
                  bookmarks={filteredBookmarks}
                  onDelete={deleteBookmark}
                  viewMode={viewMode}
                />
              )}
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
