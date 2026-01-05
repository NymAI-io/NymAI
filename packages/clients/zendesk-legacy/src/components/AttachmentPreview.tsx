/**
 * AttachmentPreview Component
 * Displays attachment with redaction preview, showing PII bounding boxes.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import { OCRResult, BoundingBox } from '@/types/ocr';

export interface AttachmentPreviewProps {
  /** OCR result containing findings to highlight */
  result: OCRResult;
  /** Whether to show the redaction overlay */
  showRedaction: boolean;
  /** Image source (data URL or blob URL) */
  imageSrc: string;
  /** Original attachment URL for fallback */
  originalUrl?: string;
}

/**
 * ImageCanvas Component
 * Renders image with PII bounding boxes highlighted.
 */
interface ImageCanvasProps {
  imageSrc: string;
  findings: { boundingBox: BoundingBox }[];
  showRedaction: boolean;
  zoom: number;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageSrc,
  findings,
  showRedaction,
  zoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size based on zoom
      canvas.width = img.width * zoom;
      canvas.height = img.height * zoom;

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      findings.forEach((finding) => {
        const box = finding.boundingBox;
        const x = box.x0 * canvas.width;
        const y = box.y0 * canvas.height;
        const width = (box.x1 - box.x0) * canvas.width;
        const height = (box.y1 - box.y0) * canvas.height;

        if (showRedaction) {
          // Draw black box for redaction
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, width, height);
        } else {
          // Draw highlight box for preview
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2 / zoom;
          ctx.strokeRect(x, y, width, height);

          // Semi-transparent fill
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.fillRect(x, y, width, height);
        }
      });

      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageLoaded(false);
    };

    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, findings, showRedaction, zoom]);

  return (
    <div className="relative bg-muted/50 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ cursor: imageLoaded ? 'crosshair' : 'wait' }}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading image...</div>
        </div>
      )}
    </div>
  );
};

/**
 * AttachmentPreview Component
 */
export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  result,
  showRedaction,
  imageSrc,
  originalUrl: _originalUrl, // TODO: implement fallback
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showRedaction ? (
              <EyeOff className="h-4 w-4 text-destructive" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">{result.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {showRedaction ? 'Redaction Preview' : 'PII Detection Preview'}
              </p>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            {zoom !== 1 && (
              <Button variant="ghost" size="sm" onClick={handleResetZoom}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <ImageCanvas
          imageSrc={imageSrc}
          findings={result.findings}
          showRedaction={showRedaction}
          zoom={zoom}
        />

        {/* Legend */}
        {!showRedaction && result.findings.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-destructive bg-destructive/20" />
              <span>PII Detected ({result.findings.length} regions)</span>
            </div>
          </div>
        )}

        {/* Info */}
        {result.processingTimeMs && (
          <div className="text-xs text-muted-foreground">
            Processed in {result.processingTimeMs}ms
          </div>
        )}
      </CardContent>
    </Card>
  );
};
