
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import ViewToggle from "@/components/ViewToggle";
import { Bookmark, ViewMode } from "@/types/bookmark";
import { toast } from "@/components/ui/use-toast";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);

  useEffect(() => {
    checkUser();
    fetchBookmarks();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookmarks(bookmarks.map(b => ({
        id: b.id,
        url: b.url,
        title: b.title,
        description: b.description || 'No description available',
        image: b.image_url,
        tags: b.tags || [],
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

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

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
        <div className="space-y-8">
          <BookmarkForm onSubmit={addBookmark} isLoading={isLoading} />
          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <SearchBar value={search} onChange={setSearch} />
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Index;
