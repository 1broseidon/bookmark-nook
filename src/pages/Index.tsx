import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import ViewToggle from "@/components/ViewToggle";
import FolderList from "@/components/FolderList";
import { Bookmark, ViewMode } from "@/types/bookmark";
import { Folder } from "@/types/folder";
import { toast } from "@/components/ui/use-toast";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Index = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  useEffect(() => {
    checkUser();
    fetchBookmarks();
    fetchUserPreferences();
    fetchFolders();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchFolders = async () => {
    try {
      const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .order('position');

      if (error) throw error;

      setFolders(folders.map(f => ({
        id: f.id,
        name: f.name,
        position: f.position,
        createdAt: new Date(f.created_at),
      })));
    } catch (error: any) {
      toast({
        title: "Error fetching folders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const createFolder = async (name: string) => {
    try {
      const { data: folder, error } = await supabase
        .from('folders')
        .insert({
          name,
          position: folders.length,
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, {
        id: folder.id,
        name: folder.name,
        position: folder.position,
        createdAt: new Date(folder.created_at),
      }]);

      toast({
        title: "Folder created",
        description: "Your folder has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating folder",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const reorderFolders = async (startIndex: number, endIndex: number) => {
    const newFolders = Array.from(folders);
    const [removed] = newFolders.splice(startIndex, 1);
    newFolders.splice(endIndex, 0, removed);

    setFolders(newFolders);

    try {
      const updates = newFolders.map((folder, index) => ({
        id: folder.id,
        position: index,
      }));

      const { error } = await supabase
        .from('folders')
        .upsert(updates);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error updating folder order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveBookmark = async (bookmarkId: string, folderId: string | null, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({
          folder_id: folderId,
          position: newPosition,
        })
        .eq('id', bookmarkId);

      if (error) throw error;

      // Update local state
      setBookmarks(prev => prev.map(b => {
        if (b.id === bookmarkId) {
          return { ...b, folderId, position: newPosition };
        }
        return b;
      }));
    } catch (error: any) {
      toast({
        title: "Error moving bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    
    // If moving between different droppable areas (folders)
    if (sourceId !== destinationId) {
      const bookmarkId = result.draggableId;
      const newFolderId = destinationId === 'main' ? null : destinationId;
      await moveBookmark(bookmarkId, newFolderId, result.destination.index);
    } else {
      // If reordering within the same droppable area
      const items = Array.from(bookmarks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setBookmarks(items);

      // Update positions in the database
      try {
        const updates = items.map((bookmark, index) => ({
          id: bookmark.id,
          position: index,
        }));

        const { error } = await supabase
          .from('bookmarks')
          .upsert(updates);

        if (error) throw error;
      } catch (error: any) {
        toast({
          title: "Error updating bookmark order",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('view_mode')
        .maybeSingle();

      if (error) throw error;

      if (preferences) {
        setViewMode(preferences.view_mode as ViewMode);
      } else {
        // Create default preferences if none exist
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            view_mode: 'grid'
          });

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error('Error fetching user preferences:', error);
      toast({
        title: "Error fetching preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const updateViewMode = async (mode: ViewMode) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: session.user.id,
            view_mode: mode
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      setViewMode(mode);
      
    } catch (error: any) {
      console.error('Error updating view mode:', error);
      toast({
        title: "Error updating view mode",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
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

  const addBookmark = async (url: string) => {
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
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
            <BookmarkForm onSubmit={addBookmark} isLoading={isLoading} />
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
