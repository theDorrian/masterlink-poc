import { useEffect, useReducer, useRef, useState } from 'react';
import { X } from 'lucide-react';

export const CROP_FRAME  = 280;
export const CROP_OUTPUT = 512;

function cropReduce(state, action) {
  const clamp = (nx, ny, ns, d) => {
    if (!d) return { x: nx, y: ny };
    const hw = (d.w * ns) / 2, hh = (d.h * ns) / 2, hf = CROP_FRAME / 2;
    return {
      x: Math.max(hf - hw, Math.min(hw - hf, nx)),
      y: Math.max(hf - hh, Math.min(hh - hf, ny)),
    };
  };
  switch (action.type) {
    case 'LOAD': {
      const minScale = Math.max(CROP_FRAME / action.w, CROP_FRAME / action.h);
      return { x: 0, y: 0, scale: minScale, dims: { w: action.w, h: action.h, minScale } };
    }
    case 'MOVE': {
      const c = clamp(action.x, action.y, state.scale, state.dims);
      return { ...state, x: c.x, y: c.y };
    }
    case 'ZOOM': {
      if (!state.dims) return state;
      const ns = Math.max(state.dims.minScale, Math.min(action.scale, 5));
      const c  = clamp(state.x, state.y, ns, state.dims);
      return { ...state, x: c.x, y: c.y, scale: ns };
    }
    default: return state;
  }
}

export default function AvatarCropModal({ src, onSave, onClose }) {
  const [crop, dispatch] = useReducer(cropReduce, { x: 0, y: 0, scale: 1, dims: null });
  const [saving, setSaving] = useState(false);
  const containerRef = useRef(null);
  const dragRef      = useRef(null);
  const pinchRef     = useRef(null);
  const cropRef      = useRef(crop);
  cropRef.current    = crop;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = e => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.93 : 1.07;
      dispatch({ type: 'ZOOM', scale: cropRef.current.scale * factor });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const pt = e => ({ x: (e.touches?.[0] ?? e).clientX, y: (e.touches?.[0] ?? e).clientY });

  const onDown = e => {
    e.preventDefault();
    if (e.touches?.length === 2) {
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      pinchRef.current = { dist: d, scale: cropRef.current.scale };
      dragRef.current  = null;
    } else {
      const p = pt(e);
      dragRef.current = { sx: p.x, sy: p.y, ox: cropRef.current.x, oy: cropRef.current.y };
    }
  };

  const onMove = e => {
    e.preventDefault();
    if (e.touches?.length === 2 && pinchRef.current) {
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      dispatch({ type: 'ZOOM', scale: pinchRef.current.scale * (d / pinchRef.current.dist) });
    } else if (dragRef.current) {
      const p = pt(e);
      dispatch({ type: 'MOVE', x: dragRef.current.ox + p.x - dragRef.current.sx, y: dragRef.current.oy + p.y - dragRef.current.sy });
    }
  };

  const onUp = () => { dragRef.current = null; pinchRef.current = null; };

  const handleSave = () => {
    const { x, y, scale, dims } = crop;
    if (!dims) return;
    setSaving(true);

    const srcX = dims.w / 2 - (CROP_FRAME / 2 + x) / scale;
    const srcY = dims.h / 2 - (CROP_FRAME / 2 + y) / scale;
    const srcW = CROP_FRAME / scale;
    const srcH = CROP_FRAME / scale;

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = CROP_OUTPUT;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, CROP_OUTPUT, CROP_OUTPUT);
      onSave(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.src = src;
  };

  const { dims, scale } = crop;
  const sliderPct = dims
    ? Math.round(((scale - dims.minScale) / Math.max(5 - dims.minScale, 0.01)) * 100)
    : 0;

  return (
    <div className="crop-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="crop-modal">
        <div className="crop-modal-header">
          <span className="crop-title">Reposition Photo</span>
          <button className="crop-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <p className="crop-hint">Drag to reposition · Scroll or pinch to zoom</p>

        <div
          ref={containerRef}
          className="crop-frame"
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        >
          {!dims && (
            <span className="spinner spinner-dark" style={{ width: 32, height: 32, position: 'absolute' }} />
          )}
          <img
            src={src}
            alt=""
            draggable="false"
            onLoad={e => dispatch({ type: 'LOAD', w: e.target.naturalWidth, h: e.target.naturalHeight })}
            style={{
              position: 'absolute',
              width:  dims?.w,
              height: dims?.h,
              left: '50%', top: '50%',
              transform: dims
                ? `translate(${-dims.w / 2 + crop.x}px, ${-dims.h / 2 + crop.y}px) scale(${scale})`
                : 'none',
              transformOrigin: 'center',
              visibility: dims ? 'visible' : 'hidden',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {dims && (
          <div className="crop-zoom-row">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--gray-400)', flexShrink: 0 }}>
              <path d="M12.9 11.5h-.8l-.3-.3a7 7 0 1 0-.8.8l.3.3v.8l5 4.9 1.5-1.5-4.9-5Zm-6.4 0a4.8 4.8 0 1 1 0-9.7 4.8 4.8 0 0 1 0 9.7ZM7 4v2H5v1h2v2h1V7h2V6H8V4H7Z"/>
            </svg>
            <input type="range" className="crop-zoom-slider"
              min={0} max={100} step={1} value={sliderPct}
              onChange={e => {
                const pct = Number(e.target.value) / 100;
                dispatch({ type: 'ZOOM', scale: dims.minScale + pct * (5 - dims.minScale) });
              }}
            />
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--gray-400)', flexShrink: 0 }}>
              <path d="M12.9 11.5h-.8l-.3-.3a7 7 0 1 0-.8.8l.3.3v.8l5 4.9 1.5-1.5-4.9-5Zm-6.4 0a4.8 4.8 0 1 1 0-9.7 4.8 4.8 0 0 1 0 9.7Z"/>
            </svg>
          </div>
        )}

        <div className="crop-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary"   onClick={handleSave} disabled={saving || !dims}>
            {saving ? <span className="spinner" /> : 'Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function openAvatarFile(fileInputRef, onDataUrl, onError) {
  const input = fileInputRef.current;
  if (!input) return;
  input.value = '';

  const handler = e => {
    input.removeEventListener('change', handler);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { onError('Please select an image file'); return; }
    if (file.size > 20 * 1024 * 1024)  { onError('File must be under 20 MB'); return; }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 150 || img.naturalHeight < 150) {
        URL.revokeObjectURL(url);
        onError('Image must be at least 150 × 150 px');
        return;
      }
      onDataUrl(url); // pass objectURL to open crop modal
    };
    img.onerror = () => { URL.revokeObjectURL(url); onError('Could not read image'); };
    img.src = url;
  };
  input.addEventListener('change', handler);
  input.click();
}
