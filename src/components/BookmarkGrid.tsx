import { Bookmark } from "@/types/bookmark";
import BookmarkCard from "./BookmarkCard";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

const BookmarkGrid = ({ bookmarks, onDelete }: BookmarkGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BookmarkGrid;