"use client";

export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`spinner inline-block h-4 w-4 rounded-full border-2 border-white/50 border-t-white ${className}`}
      aria-hidden="true"
    />
  );
}

