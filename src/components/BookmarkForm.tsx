import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus } from "lucide-react";

interface BookmarkFormProps {
  onSubmit: (url: string) => void;
}

const BookmarkForm = ({ onSubmit }: BookmarkFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl mx-auto">
      <Input
        type="url"
        placeholder="Enter URL to bookmark..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 h-12 bg-white/70 backdrop-blur-sm border-gray-200 placeholder:text-gray-400"
      />
      <Button type="submit" className="h-12 px-6">
        <Plus className="h-5 w-5 mr-2" />
        Add
      </Button>
    </form>
  );
};

export default BookmarkForm;