import { useState } from "react";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import SearchBar from "@/components/SearchBar";
import { Bookmark } from "@/types/bookmark";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");

  const addBookmark = async (url: string) => {
    // In a real app, this would fetch metadata from an API
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      url,
      title: "Example Title",
      description: "This is an example description for the bookmark.",
      image: "https://picsum.photos/400/300",
      tags: ["example", "new"],
      createdAt: new Date(),
    };

    setBookmarks((prev) => [newBookmark, ...prev]);
    toast({
      title: "Bookmark added",
      description: "Your bookmark has been successfully added.",
    });
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
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Bookmark Manager</h1>
          <p className="text-muted-foreground">
            Save and organize your favorite links
          </p>
        </div>
        <div className="space-y-6">
          <BookmarkForm onSubmit={addBookmark} />
          <SearchBar value={search} onChange={setSearch} />
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No bookmarks yet. Add your first one above!
            </div>
          ) : (
            <BookmarkGrid
              bookmarks={filteredBookmarks}
              onDelete={deleteBookmark}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;