
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
import { toast } from "@/components/ui/use-toast";

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

  const handleMoveToFolder = async (bookmarkId: string, folderId: string | null) => {
    try {
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (!bookmark) return;

      const currentPosition = bookmarks.findIndex(b => b.id === bookmarkId);
      if (currentPosition === -1) return;

      await moveBookmark(bookmarkId, folderId, currentPosition);
      toast({
        title: "Bookmark moved",
        description: `Bookmark moved to ${folderId ? folders.find(f => f.id === folderId)?.name : 'root folder'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error moving bookmark",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleLogout()}
          className="relative h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm border border-theme/20 hover:bg-background/80"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <div className="container py-16 space-y-12 max-w-7xl mx-auto px-6 relative">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Bookmark Manager
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save and organize your favorite links in a beautiful, minimalist space
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
          <div className="space-y-8">
            <div className="rounded-2xl bg-background/60 backdrop-blur-xl border border-theme/10 p-6 animate-fade-in">
              <FolderList
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={createFolder}
                onReorderFolders={reorderFolders}
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="rounded-2xl bg-background/60 backdrop-blur-xl border border-theme/10 p-6 animate-fade-in">
              <BookmarkForm 
                onSubmit={(url) => addBookmark(url, selectedFolderId)} 
                isLoading={isLoading} 
              />
            </div>
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
                <div className="text-center py-24 bg-background/60 backdrop-blur-xl rounded-2xl border border-theme/10 animate-fade-in">
                  <p className="text-xl font-light">No bookmarks yet.</p>
                  <p className="text-base mt-2 text-muted-foreground">Add your first one above!</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-background/60 backdrop-blur-xl border border-theme/10 p-6 animate-fade-in">
                  <BookmarkGrid
                    bookmarks={filteredBookmarks}
                    folders={folders}
                    onDelete={deleteBookmark}
                    onMoveToFolder={handleMoveToFolder}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
