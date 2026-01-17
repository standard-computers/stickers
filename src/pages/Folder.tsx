import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Share2, Home, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { StickerCard } from "@/components/StickerCard";
import { Switch } from "@/components/ui/switch";

interface Sticker {
  id: string;
  content: string;
  created_at: string;
  color_index: number;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  dark_mode: boolean;
}

const Folder = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStickerContent, setNewStickerContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusedStickerId, setFocusedStickerId] = useState<string | null>(null);

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
        setIsDarkMode(existingFolder.dark_mode);
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
      setIsDarkMode(newFolder.dark_mode);
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
        .order("created_at", { ascending: true });

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

  const updateStickerColor = useMutation({
    mutationFn: async ({ id, colorIndex }: { id: string; colorIndex: number }) => {
      const { error } = await supabase
        .from("stickers")
        .update({ color_index: colorIndex })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers", folderId] });
    },
    onError: () => {
      toast.error("Failed to update color");
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

  const updateFolderDarkMode = useMutation({
    mutationFn: async (darkMode: boolean) => {
      const { error } = await supabase
        .from("folders")
        .update({ dark_mode: darkMode })
        .eq("id", folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
    },
    onError: () => {
      toast.error("Failed to update dark mode");
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async () => {
      // Delete all stickers in the folder first
      const { error: stickersError } = await supabase
        .from("stickers")
        .delete()
        .eq("folder_id", folderId);
      
      if (stickersError) throw stickersError;

      // Then delete the folder
      const { error: folderError } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (folderError) throw folderError;
    },
    onSuccess: () => {
      toast.success("Folder deleted!");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to delete folder");
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

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    updateFolderDarkMode.mutate(checked);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName.toLowerCase();
      
      // Don't trigger shortcuts if focus is on input, textarea, button, or contenteditable
      const isInputFocused = 
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'button' ||
        (activeElement as HTMLElement)?.isContentEditable;

      // 'N' shortcut to create new note
      if ((e.key === 'n' || e.key === 'N') && !isInputFocused) {
        e.preventDefault();
        setIsAdding(true);
        setFocusedStickerId(null);
        return;
      }

      // Arrow key navigation for focused sticker
      if (focusedStickerId && !isInputFocused && stickers.length > 0) {
        const currentIndex = stickers.findIndex(s => s.id === focusedStickerId);
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        
        if (e.key === 'ArrowRight') {
          newIndex = (currentIndex + 1) % stickers.length;
        } else if (e.key === 'ArrowLeft') {
          newIndex = (currentIndex - 1 + stickers.length) % stickers.length;
        } else if (e.key === 'ArrowDown') {
          // Move to next row (assume 4 columns on large screens)
          newIndex = Math.min(currentIndex + 4, stickers.length - 1);
        } else if (e.key === 'ArrowUp') {
          newIndex = Math.max(currentIndex - 4, 0);
        }

        if (newIndex !== currentIndex) {
          e.preventDefault();
          setFocusedStickerId(stickers[newIndex].id);
        }
      }

      // Ctrl+C to copy focused sticker
      if (e.ctrlKey && e.key === 'c' && focusedStickerId && !isInputFocused) {
        const focusedSticker = stickers.find(s => s.id === focusedStickerId);
        if (focusedSticker) {
          e.preventDefault();
          handleCopy(focusedSticker.content);
        }
      }

      // Escape to clear focus
      if (e.key === 'Escape' && focusedStickerId) {
        setFocusedStickerId(null);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedStickerId, stickers]);

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete folder?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this folder and all its stickers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteFolder.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                content={sticker.content}
                colorIndex={sticker.color_index}
                isFocused={focusedStickerId === sticker.id}
                onCopy={() => handleCopy(sticker.content)}
                onDelete={() => deleteSticker.mutate(sticker.id)}
                onColorChange={(colorIndex) => updateStickerColor.mutate({ id: sticker.id, colorIndex })}
                onFocus={() => setFocusedStickerId(sticker.id)}
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
                    className="flex-1 gap-2"
                    disabled={!newStickerContent.trim()}
                  >
                    Add
                    <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Ctrl+↵
                    </kbd>
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
                  <kbd className="mt-2 inline-block px-2 py-0.5 text-xs font-mono rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    N
                  </kbd>
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