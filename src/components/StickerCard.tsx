import { Copy, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StickerCardProps {
  content: string;
  colorIndex: number;
  isFocused?: boolean;
  onCopy: () => void;
  onDelete: () => void;
  onColorChange?: (colorIndex: number) => void;
  onFocus?: () => void;
}

const colorClasses = [
  "bg-sticker-yellow",
  "bg-sticker-pink",
  "bg-sticker-blue",
  "bg-sticker-green",
  "bg-sticker-purple",
];

const colorLabels = ["Yellow", "Pink", "Blue", "Green", "Purple"];

export const StickerCard = ({
  content,
  colorIndex,
  isFocused,
  onCopy,
  onDelete,
  onColorChange,
  onFocus,
}: StickerCardProps) => {
  const colorClass = colorClasses[colorIndex] || colorClasses[0];

  const handleClick = () => {
    onFocus?.();
    onCopy();
  };

  return (
    <div
      className={`${colorClass} p-4 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group relative min-h-[150px] flex flex-col ${
        isFocused ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex-1 break-words whitespace-pre-wrap text-foreground mb-2">
        {content}
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onColorChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 hover:bg-background"
                onClick={(e) => e.stopPropagation()}
              >
                <Palette className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                {colorClasses.map((cls, idx) => (
                  <button
                    key={idx}
                    className={`${cls} w-6 h-6 rounded-full border-2 transition-all ${
                      idx === colorIndex ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                    }`}
                    onClick={() => onColorChange(idx)}
                    title={colorLabels[idx]}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
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