import { useState } from "react";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import ViewToggle from "@/components/ViewToggle";
import { Bookmark, ViewMode } from "@/types/bookmark";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const addBookmark = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch metadata');
      }

      const { title, description, image, publisher } = data.data;
      
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        url,
        title: title || url,
        description: description || 'No description available',
        image: image?.url,
        tags: publisher ? [publisher] : [],
        createdAt: new Date(),
      };

      setBookmarks((prev) => [newBookmark, ...prev]);
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been successfully added.",
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast({
        title: "Error adding bookmark",
        description: "Failed to fetch metadata for the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast({
      title: "Bookmark deleted",
      description: "Your bookmark has been removed.",
    });
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <ThemeToggle />
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
          {bookmarks.length === 0 ? (
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
