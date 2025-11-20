import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Share2, Home } from "lucide-react";
import { useState } from "react";
import { StickerCard } from "@/components/StickerCard";

interface Sticker {
  id: string;
  content: string;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const Folder = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStickerContent, setNewStickerContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [folderName, setFolderName] = useState("");

  const { data: folder } = useQuery({
    queryKey: ["folder", folderId],
    queryFn: async () => {
      // Try to get existing folder
      const { data: existingFolder, error: fetchError } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .single();

      if (existingFolder) {
        setFolderName(existingFolder.name);
        return existingFolder as Folder;
      }

      // Create folder if it doesn't exist
      const { data: newFolder, error: insertError } = await supabase
        .from("folders")
        .insert({ id: folderId, name: "Untitled Folder" })
        .select()
        .single();

      if (insertError) throw insertError;
      setFolderName(newFolder.name);
      return newFolder as Folder;
    },
  });

  const { data: stickers = [], isLoading } = useQuery({
    queryKey: ["stickers", folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stickers")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Sticker[];
    },
  });

  const createSticker = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from("stickers")
        .insert({ folder_id: folderId, content });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers", folderId] });
      setNewStickerContent("");
      setIsAdding(false);
      toast.success("Sticker created!");
    },
    onError: () => {
      toast.error("Failed to create sticker");
    },
  });

  const deleteSticker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stickers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers", folderId] });
      toast.success("Sticker deleted!");
    },
    onError: () => {
      toast.error("Failed to delete sticker");
    },
  });

  const updateFolderName = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("folders")
        .update({ name })
        .eq("id", folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
      toast.success("Folder name updated!");
    },
    onError: () => {
      toast.error("Failed to update folder name");
    },
  });

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleAddSticker = () => {
    if (newStickerContent.trim()) {
      createSticker.mutate(newStickerContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleAddSticker();
    }
  };

  const handleFolderNameChange = () => {
    const trimmedName = folderName.trim();
    if (trimmedName && trimmedName !== folder?.name) {
      updateFolderName.mutate(trimmedName);
    } else if (!trimmedName && folder?.name) {
      setFolderName(folder.name);
    }
    setIsEditingName(false);
  };

  const handleFolderNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFolderNameChange();
    } else if (e.key === "Escape") {
      setFolderName(folder?.name || "Untitled Folder");
      setIsEditingName(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Go home"
            >
              <Home className="h-5 w-5" />
            </Button>
            {isEditingName ? (
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onBlur={handleFolderNameChange}
                onKeyDown={handleFolderNameKeyDown}
                className="text-xl font-semibold max-w-md"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {folder?.name || folderId}
              </h1>
            )}
          </div>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stickers.map((sticker, index) => (
              <StickerCard
                key={sticker.id}
                content={sticker.content}
                colorIndex={index % 5}
                onCopy={() => handleCopy(sticker.content)}
                onDelete={() => deleteSticker.mutate(sticker.id)}
              />
            ))}

            {isAdding ? (
              <div className="p-4 rounded-lg border-2 border-dashed border-border bg-card">
                <Textarea
                  placeholder="Enter sticker text... (Ctrl+Enter to add)"
                  value={newStickerContent}
                  onChange={(e) => setNewStickerContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mb-2 min-h-[120px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSticker}
                    size="sm"
                    className="flex-1"
                    disabled={!newStickerContent.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setNewStickerContent("");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="p-8 rounded-lg border-2 border-dashed border-border bg-card hover:bg-muted transition-colors flex items-center justify-center group"
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Add Sticker
                  </p>
                </div>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Folder;