import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bookmark } from "@/types/bookmark";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
}

const BookmarkCard = ({ bookmark, onDelete }: BookmarkCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 animate-scale-in">
      {bookmark.image && (
        <div className="relative h-40 overflow-hidden rounded-t-lg">
          <img
            src={bookmark.image}
            alt={bookmark.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {bookmark.title}
          </h3>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(bookmark.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {bookmark.description}
        </p>
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-accent rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;