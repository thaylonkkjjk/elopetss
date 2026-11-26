import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCropPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspectRatio: number;   // e.g. 16/9 for banner, 1 for avatar
  outputWidth: number;   // output canvas width in px
  outputHeight: number;
  hint?: string;
}

export default function ImageCropPicker({
  label, value, onChange, aspectRatio, outputWidth, outputHeight, hint,
}: ImageCropPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Canvas preview dimensions (display)
  const previewW = 400;
  const previewH = Math.round(previewW / aspectRatio);

  // Draw on canvas whenever state changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, previewW, previewH);
    const scaledW = img.naturalWidth * scale * (previewW / outputWidth);
    const scaledH = img.naturalHeight * scale * (previewH / outputHeight);
    ctx.drawImage(img, offset.x, offset.y, scaledW, scaledH);
  }, [scale, offset, previewW, previewH, outputWidth, outputHeight]);

  useEffect(() => { draw(); }, [draw]);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setRawSrc(src);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        // Fit image to fill canvas initially
        const fitScale = Math.max(outputWidth / img.naturalWidth, outputHeight / img.naturalHeight);
        setScale(fitScale);
        setOffset({
          x: (previewW - img.naturalWidth * fitScale * (previewW / outputWidth)) / 2,
          y: (previewH - img.naturalHeight * fitScale * (previewH / outputHeight)) / 2,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    // Render at full output resolution
    const out = document.createElement('canvas');
    out.width = outputWidth;
    out.height = outputHeight;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    const scaledW = img.naturalWidth * scale;
    const scaledH = img.naturalHeight * scale;
    const ox = offset.x * (outputWidth / previewW);
    const oy = offset.y * (outputHeight / previewH);
    ctx.drawImage(img, ox, oy, scaledW, scaledH);
    const dataUrl = out.toDataURL('image/jpeg', 0.6); // 60% = ~10-20KB, carrega instantaneamente
    onChange(dataUrl);
    setRawSrc(null);
  };

  const handleCancel = () => {
    setRawSrc(null);
    imgRef.current = null;
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setRawSrc(null);
    imgRef.current = null;
  };

  // ── CROP MODE ──
  if (rawSrc) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="border-2 border-orange-300 rounded-xl overflow-hidden bg-gray-900">
          <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
            <span className="text-white text-xs font-medium">Ajuste o recorte — arraste para reposicionar</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setScale(s => Math.max(0.2, s - 0.1))}
                className="text-white/70 hover:text-white p-1"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-white/60 text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
              <button type="button" onClick={() => setScale(s => s + 0.1)}
                className="text-white/70 hover:text-white p-1"><ZoomIn className="w-4 h-4" /></button>
              <button type="button" onClick={() => {
                const img = imgRef.current;
                if (!img) return;
                const fitScale = Math.max(outputWidth / img.naturalWidth, outputHeight / img.naturalHeight);
                setScale(fitScale);
                setOffset({
                  x: (previewW - img.naturalWidth * fitScale * (previewW / outputWidth)) / 2,
                  y: (previewH - img.naturalHeight * fitScale * (previewH / outputHeight)) / 2,
                });
              }} className="text-white/70 hover:text-white p-1"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex justify-center p-2 bg-gray-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={previewW}
              height={previewH}
              className="cursor-grab active:cursor-grabbing rounded-lg max-w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            />
          </div>

          <div className="bg-gray-800 px-3 py-2 flex gap-2 justify-end">
            <Button type="button" size="sm" variant="outline" onClick={handleCancel}
              className="border-white/20 text-white hover:bg-white/10">
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleConfirm}
              className="bg-orange-500 hover:bg-orange-600 text-white">
              <Check className="w-4 h-4 mr-1" /> Confirmar
            </Button>
          </div>
        </div>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    );
  }

  // ── PREVIEW / UPLOAD MODE ──
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-300 transition-colors"
        style={{ aspectRatio: `${previewW}/${previewH}`, maxHeight: 180 }}
        onClick={() => fileRef.current?.click()}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1.5 rounded-full">Trocar imagem</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 py-6">
            <Upload className="w-8 h-8" />
            <span className="text-sm">Clique para escolher uma imagem</span>
            {hint && <span className="text-xs text-gray-300">{hint}</span>}
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
