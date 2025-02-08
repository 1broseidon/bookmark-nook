
import { Bookmark, ViewMode } from "@/types/bookmark";
import BookmarkCard from "./BookmarkCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
  viewMode: ViewMode;
}

const BookmarkGrid = ({ bookmarks, onDelete, viewMode }: BookmarkGridProps) => {
  return (
    <Droppable droppableId="main">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "flex flex-col gap-4"
          }
        >
          {bookmarks.map((bookmark, index) => (
            <Draggable
              key={bookmark.id}
              draggableId={bookmark.id}
              index={index}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    onDelete={onDelete}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default BookmarkGrid;
