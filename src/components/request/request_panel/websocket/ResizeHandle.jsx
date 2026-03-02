export default function ResizeHandle({ onMouseDown, isDragging }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="group relative shrink-0 h-[5px] cursor-row-resize flex items-center justify-center z-10 hover:bg-brand-primary/5 transition-colors"
    >
      <div
        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-px transition-colors ${
          isDragging ? 'bg-brand-primary/70' : 'bg-border-subtle group-hover:bg-brand-primary/40'
        }`}
      />
      <div className="relative flex items-center gap-0.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${
              isDragging ? 'bg-brand-primary' : 'bg-[#333] group-hover:bg-brand-primary/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
