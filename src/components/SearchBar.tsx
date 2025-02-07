import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        placeholder="Search bookmarks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 bg-white/70 backdrop-blur-sm border-gray-200 placeholder:text-gray-400"
      />
    </div>
  );
};

export default SearchBar;