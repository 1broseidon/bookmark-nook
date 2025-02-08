
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types/bookmark";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 ${viewMode === 'grid' ? 'bg-theme/10 text-theme' : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 ${viewMode === 'list' ? 'bg-theme/10 text-theme' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <List className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ViewToggle;
