export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
  createdAt: Date;
}