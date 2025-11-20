import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const createNewFolder = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    navigate(`/folder/${randomId}`);
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
          onClick={createNewFolder}
          size="lg"
          className="text-lg px-8 py-6"
        >
          Create New Folder
        </Button>

        <p className="text-sm text-muted-foreground">
          No signup required. Just create and share!
        </p>
      </div>
    </div>
  );
};

export default Index;
