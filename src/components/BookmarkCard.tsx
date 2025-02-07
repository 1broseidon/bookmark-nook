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
    <Card className="group hover:shadow-lg transition-all duration-300 border-theme/20 bg-background/70 backdrop-blur-sm animate-scale-in dark:bg-background/40">
      {bookmark.image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={bookmark.image}
            alt={bookmark.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-light text-xl leading-tight line-clamp-2">
            {bookmark.title}
          </h3>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/80"
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => onDelete(bookmark.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed line-clamp-2 font-light">
          {bookmark.description}
        </p>
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-theme/5 text-theme dark:text-theme-dark rounded-full font-light"
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