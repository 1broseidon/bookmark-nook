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
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="container py-16 space-y-12 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light tracking-tight text-gray-900">
            Bookmark Manager
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Save and organize your favorite links in a beautiful, minimalist space
          </p>
        </div>
        <div className="space-y-8">
          <BookmarkForm onSubmit={addBookmark} />
          <SearchBar value={search} onChange={setSearch} />
          {bookmarks.length === 0 ? (
            <div className="text-center py-24 text-gray-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
              <p className="text-xl font-light">No bookmarks yet.</p>
              <p className="text-base mt-2">Add your first one above!</p>
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