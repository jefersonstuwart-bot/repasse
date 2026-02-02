import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, open, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomed(false);
  }, [initialIndex, open]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomed(false);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomed(false);
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    
    switch (e.key) {
      case "ArrowRight":
        goNext();
        break;
      case "ArrowLeft":
        goPrev();
        break;
      case "Escape":
        onClose();
        break;
    }
  }, [open, goNext, goPrev, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Zoom button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-20 top-4 z-50 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={() => setZoomed(!zoomed)}
      >
        {zoomed ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
      </Button>

      {/* Image counter */}
      <div className="absolute left-4 top-4 z-50 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 z-50 h-14 w-14 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={goPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Main Image */}
      <div 
        className={`flex h-full w-full items-center justify-center p-16 ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={images[currentIndex]}
          alt={`Imagem ${currentIndex + 1}`}
          className={`max-h-full transition-transform duration-300 ${
            zoomed ? "max-w-none scale-150" : "max-w-full object-contain"
          }`}
          style={{ 
            maxHeight: zoomed ? "none" : "calc(100vh - 8rem)",
            maxWidth: zoomed ? "none" : "calc(100vw - 8rem)"
          }}
        />
      </div>

      {/* Navigation - Next */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 z-50 h-14 w-14 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={goNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-lg bg-black/50 p-2 backdrop-blur-sm">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setZoomed(false);
              }}
              className={`h-16 w-24 overflow-hidden rounded-md border-2 transition-all ${
                index === currentIndex 
                  ? "border-white opacity-100" 
                  : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <img 
                src={image} 
                alt={`Miniatura ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-50 text-sm text-white/50">
        Use ← → para navegar • ESC para fechar
      </div>
    </div>
  );
}
