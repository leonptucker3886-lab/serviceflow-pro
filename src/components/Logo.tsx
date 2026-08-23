export function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  };
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-md`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5 text-white" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" strokeLinecap="round" />
          <path d="M16 3v4h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-bold tracking-tight text-slate-900 ${textSizes[size]}`}>
        Service<span className="text-sky-600">Flow</span>
      </span>
    </div>
  );
}
