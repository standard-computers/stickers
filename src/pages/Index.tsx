import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const createNewFolder = async () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const name = folderName.trim() || "Untitled Folder";
    
    // Create folder in database with the provided name
    await supabase.from("folders").insert({
      id: randomId,
      name: name,
    });
    
    setIsDialogOpen(false);
    setFolderName("");
    navigate(`/folder/${randomId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      createNewFolder();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <StickyNote className="h-20 w-20 mx-auto text-primary" />
          <h1 className="text-5xl font-bold text-foreground">Stickr</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Create shareable collections of text snippets. Click to copy, share the link.
          </p>
        </div>
        
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="text-lg px-8 py-6"
        >
          Create New Folder
        </Button>

        <p className="text-sm text-muted-foreground">
          No signup required. Just create and share!
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter folder name..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
