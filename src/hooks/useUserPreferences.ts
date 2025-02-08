
import { useState } from "react";
import { ViewMode } from "@/types/bookmark";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useUserPreferences = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const fetchUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('view_mode')
        .maybeSingle();

      if (error) throw error;

      if (preferences) {
        setViewMode(preferences.view_mode as ViewMode);
      } else {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            view_mode: 'grid'
          });

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error('Error fetching user preferences:', error);
      toast({
        title: "Error fetching preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const updateViewMode = async (mode: ViewMode) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: session.user.id,
            view_mode: mode
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      setViewMode(mode);
      
    } catch (error: any) {
      console.error('Error updating view mode:', error);
      toast({
        title: "Error updating view mode",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    viewMode,
    isLoadingPreferences,
    fetchUserPreferences,
    updateViewMode,
  };
};
