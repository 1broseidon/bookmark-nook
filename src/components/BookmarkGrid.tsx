
import { Bookmark, ViewMode } from "@/types/bookmark";
import BookmarkCard from "./BookmarkCard";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
  viewMode: ViewMode;
}

const BookmarkGrid = ({ bookmarks, onDelete, viewMode }: BookmarkGridProps) => {
  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        : "flex flex-col gap-4"
    }>
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default BookmarkGrid;
