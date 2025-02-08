
import { useState } from "react";
import { Folder } from "@/types/folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onReorderFolders: (startIndex: number, endIndex: number) => void;
}

const FolderList = ({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  onReorderFolders 
}: FolderListProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    onReorderFolders(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isCreating && (
        <div className="flex items-center gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setIsCreating(false);
            }}
          />
          <Button size="sm" onClick={handleCreateFolder}>Add</Button>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="folders">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1"
            >
              <div
                className={`px-3 py-2 rounded-lg cursor-pointer ${
                  selectedFolderId === null
                    ? "bg-theme/10 text-theme"
                    : "hover:bg-theme/5"
                }`}
                onClick={() => onSelectFolder(null)}
              >
                All Bookmarks
              </div>
              {folders.map((folder, index) => (
                <Draggable
                  key={folder.id}
                  draggableId={folder.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`px-3 py-2 rounded-lg cursor-pointer ${
                        selectedFolderId === folder.id
                          ? "bg-theme/10 text-theme"
                          : "hover:bg-theme/5"
                      }`}
                      onClick={() => onSelectFolder(folder.id)}
                    >
                      {folder.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default FolderList;
