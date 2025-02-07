import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface BookmarkFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const BookmarkForm = ({ onSubmit, isLoading }: BookmarkFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <Input
          type="url"
          placeholder="Enter a URL to bookmark..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="outline"
          className="bg-background hover:bg-background/80 border-theme/20 hover:border-theme text-foreground transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Add Bookmark"
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookmarkForm;