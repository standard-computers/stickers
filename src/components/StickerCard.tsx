import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickerCardProps {
  content: string;
  colorIndex: number;
  onCopy: () => void;
  onDelete: () => void;
}

const colorClasses = [
  "bg-sticker-yellow",
  "bg-sticker-pink",
  "bg-sticker-blue",
  "bg-sticker-green",
  "bg-sticker-purple",
];

export const StickerCard = ({
  content,
  colorIndex,
  onCopy,
  onDelete,
}: StickerCardProps) => {
  const colorClass = colorClasses[colorIndex];

  return (
    <div
      className={`${colorClass} p-4 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group relative min-h-[150px] flex flex-col`}
      onClick={onCopy}
    >
      <div className="flex-1 break-words whitespace-pre-wrap text-foreground mb-2">
        {content}
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-background/80 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-background/80 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};