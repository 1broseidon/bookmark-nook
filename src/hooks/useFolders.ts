
import { useState } from "react";
import { Folder } from "@/types/folder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const fetchFolders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position');

      if (error) throw error;

      setFolders(folders.map(f => ({
        id: f.id,
        name: f.name,
        position: f.position,
        createdAt: new Date(f.created_at),
      })));
    } catch (error: any) {
      toast({
        title: "Error fetching folders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const createFolder = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create folders');
      }

      const { data: folder, error } = await supabase
        .from('folders')
        .insert({
          name,
          position: folders.length,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, {
        id: folder.id,
        name: folder.name,
        position: folder.position,
        createdAt: new Date(folder.created_at),
      }]);

      toast({
        title: "Folder created",
        description: "Your folder has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating folder",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const reorderFolders = async (startIndex: number, endIndex: number) => {
    const newFolders = Array.from(folders);
    const [removed] = newFolders.splice(startIndex, 1);
    newFolders.splice(endIndex, 0, removed);

    // Update positions in the local state immediately
    const updatedFolders = newFolders.map((folder, index) => ({
      ...folder,
      position: index
    }));
    setFolders(updatedFolders);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const updates = updatedFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        position: folder.position,
        user_id: session.user.id
      }));

      const { error } = await supabase
        .from('folders')
        .upsert(updates);

      if (error) throw error;
    } catch (error: any) {
      // Revert the local state if the server update fails
      toast({
        title: "Error updating folder order",
        description: error.message,
        variant: "destructive",
      });
      await fetchFolders(); // Reload the original order
    }
  };

  return {
    folders,
    selectedFolderId,
    isLoadingFolders,
    setSelectedFolderId,
    fetchFolders,
    createFolder,
    reorderFolders,
  };
};
