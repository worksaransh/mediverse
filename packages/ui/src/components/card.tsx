import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className = "", children, hover = true }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6
        ${hover ? "hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
