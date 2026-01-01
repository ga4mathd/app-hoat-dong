import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convertToEmbedUrl } from "@/lib/youtube";
import { X } from "lucide-react";
import { Button } from "./button";

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null | undefined;
  title?: string;
}

export function VideoDialog({ open, onOpenChange, videoUrl, title }: VideoDialogProps) {
  const embedUrl = convertToEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] p-0 overflow-hidden bg-black border-none">
        <DialogHeader className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        {title && (
          <DialogTitle className="sr-only">{title}</DialogTitle>
        )}
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title || "Video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
