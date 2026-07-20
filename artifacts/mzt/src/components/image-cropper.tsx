import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Minus, Plus, RotateCcw } from 'lucide-react';

export type CropAspect = number; // width / height

export interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  aspect: CropAspect;
  title: string;
  onCropped: (file: File) => void;
  circularPreview?: boolean;
}

export function ImageCropper({
  open,
  onClose,
  imageUrl,
  aspect,
  title,
  onCropped,
  circularPreview = false,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when a new image opens
  useEffect(() => {
    if (open && imageUrl) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, imageUrl]);

  const onImageLoad = useCallback(() => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    setImageSize({ width: naturalWidth, height: naturalHeight });

    // Compute frame size purely from container dimensions + aspect ratio.
    // naturalWidth/naturalHeight must NOT influence the frame size — only the initial scale.
    const padding = 48;
    const maxWidth = container.clientWidth - padding;
    const maxHeight = container.clientHeight - padding;

    let frameWidth = maxWidth;
    let frameHeight = frameWidth / aspect;

    if (frameHeight > maxHeight) {
      frameHeight = maxHeight;
      frameWidth = frameHeight * aspect;
    }

    frameWidth = Math.max(160, frameWidth);
    frameHeight = Math.max(160 / aspect, frameHeight);

    setFrameSize({ width: frameWidth, height: frameHeight });

    // Initial scale: fit image so it fully covers the crop frame, based on aspect ratio only.
    // A 800×500 and a 4000×2500 image with the same ratio will look identical.
    const initialScale = Math.max(
      frameWidth / naturalWidth,
      frameHeight / naturalHeight,
    );
    setPosition({ x: 0, y: 0 });
    setScale(Number(initialScale.toFixed(3)));
  }, [aspect]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05; // 5% per wheel tick
    setScale((s) => Math.max(0.01, Math.min(5, Number((s + delta).toFixed(2)))));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [dragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - position.x, y: t.clientY - position.y });
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      setPosition({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    },
    [dragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const applyCrop = async () => {
    if (!imageUrl || !imageRef.current || frameSize.width === 0) return;
    setIsUploading(true);
    try {
      const file = await cropImageToFile(imageUrl, imageRef.current, frameSize, position, scale, aspect);
      onCropped(file);
    } finally {
      setIsUploading(false);
    }
  };

  if (!imageUrl) return null;

  const clampedScale = Math.max(0.01, Math.min(5, scale));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isUploading && onClose()}>
      <DialogContent className="max-w-2xl w-[calc(100vw-32px)] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="font-sans text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center bg-black/40 overflow-hidden select-none"
          style={{ height: 360 }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Cropping frame visual */}
          <div
            className="absolute z-20 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{
              width: frameSize.width,
              height: frameSize.height,
              borderRadius: circularPreview ? '50%' : 0,
            }}
          >
            <div
              className="w-full h-full border-2 border-white/80"
              style={{ borderRadius: circularPreview ? '50%' : 4 }}
            />
          </div>

          {/* Draggable/zoomable image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            className="absolute z-10 max-w-none cursor-grab active:cursor-grabbing"
            draggable={false}
            onLoad={onImageLoad}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${clampedScale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setScale((s) => Math.max(0.01, Number((s - 0.01).toFixed(2))))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono w-12 text-center">{Math.round(clampedScale * 100)}%</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setScale((s) => Math.min(5, Number((s + 0.01).toFixed(2))))}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                // Reset to the initial "fit frame" scale rather than 1:1
                if (imageRef.current && frameSize.width > 0) {
                  const img = imageRef.current;
                  const fitScale = Math.max(
                    frameSize.width / img.naturalWidth,
                    frameSize.height / img.naturalHeight,
                  );
                  setScale(Number(fitScale.toFixed(3)));
                } else {
                  setScale(1);
                }
                setPosition({ x: 0, y: 0 });
              }}
              title="Вписать в рамку"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Отмена
            </Button>
            <Button type="button" onClick={applyCrop} disabled={isUploading}>
              {isUploading ? 'Загрузка...' : 'Применить'}
            </Button>
          </div>
        </div>

        <p className="px-5 pb-4 text-xs text-muted-foreground font-sans">
          Колёсико мыши — зум. Перетаскивайте изображение, чтобы выбрать область.
        </p>
      </DialogContent>
    </Dialog>
  );
}

/** Crop the visible area inside the frame and return as a File. */
async function cropImageToFile(
  imageUrl: string,
  img: HTMLImageElement,
  frameSize: { width: number; height: number },
  position: { x: number; y: number },
  scale: number,
  aspect: number,
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Output size: use the natural resolution of the image relative to the displayed frame,
  // capped at a reasonable max to avoid huge uploads.
  const maxOutput = 2048;
  const displayScale = img.naturalWidth / (img.width * scale);

  let outputWidth = Math.round(frameSize.width * displayScale);
  let outputHeight = Math.round(frameSize.height * displayScale);

  if (outputWidth > maxOutput || outputHeight > maxOutput) {
    const ratio = Math.min(maxOutput / outputWidth, maxOutput / outputHeight);
    outputWidth = Math.round(outputWidth * ratio);
    outputHeight = Math.round(outputHeight * ratio);
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Compute the source rectangle in natural image coordinates.
  // The image is centered in the container; position.x/y is the translation of the image center.
  // The frame is also centered, so the visible crop is the image region that lies under the frame.
  const sourceX = (img.naturalWidth - frameSize.width / scale) / 2 - position.x / scale;
  const sourceY = (img.naturalHeight - frameSize.height / scale) / 2 - position.y / scale;
  const sourceW = frameSize.width / scale;
  const sourceH = frameSize.height / scale;

  // Clamp source rectangle to the image bounds so we don't draw transparent/empty areas.
  const clampedX = Math.max(0, Math.min(sourceX, img.naturalWidth - sourceW));
  const clampedY = Math.max(0, Math.min(sourceY, img.naturalHeight - sourceH));
  const clampedW = Math.max(1, Math.min(sourceW, img.naturalWidth - clampedX));
  const clampedH = Math.max(1, Math.min(sourceH, img.naturalHeight - clampedY));

  // Fill canvas with black (in case clamping leaves uncovered edges, e.g. very small images)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, outputWidth, outputHeight);
  ctx.drawImage(
    img,
    clampedX, clampedY, clampedW, clampedH,
    0, 0, outputWidth, outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to crop image'));
        return;
      }
      const ext = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
      const file = new File([blob], `cropped-${Date.now()}.${ext}`, { type: `image/${ext}` });
      resolve(file);
    }, 'image/jpeg', 0.92);
  });
}

export default ImageCropper;
