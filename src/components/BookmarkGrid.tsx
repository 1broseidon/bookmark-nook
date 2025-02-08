
import { Bookmark, ViewMode } from "@/types/bookmark";
import { Folder } from "@/types/folder";
import BookmarkCard from "./BookmarkCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  onDelete: (id: string) => void;
  onMoveToFolder: (bookmarkId: string, folderId: string | null) => void;
  viewMode: ViewMode;
}

const BookmarkGrid = ({ 
  bookmarks, 
  folders,
  onDelete, 
  onMoveToFolder,
  viewMode 
}: BookmarkGridProps) => {
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
                    folders={folders}
                    onDelete={onDelete}
                    onMoveToFolder={onMoveToFolder}
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
