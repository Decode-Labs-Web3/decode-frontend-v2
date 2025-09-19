"use client";
import { ReactNode } from "react";

interface LegalContentProps {
  title: string;
  children?: ReactNode;
  isSubSection?: boolean;
  items?: string[];
}

export default function LegalContent({
  title,
  children,
  isSubSection = false,
  items,
}: LegalContentProps) {
  // If it's a list, render the list items
  if (items && items.length > 0) {
    return (
      <div>
        <h2
          className={`${
            isSubSection
              ? "text-xl font-semibold mb-3 ml-2"
              : "text-2xl font-bold mb-4 ml-4"
          }`}
        >
          {title}
        </h2>
        <ul className="space-y-2 ml-6">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-gray-400 font-bold mt-1 flex-shrink-0">
                -
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // If it's a sub-section, render without the main container
  if (isSubSection) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-3 ml-2">{title}</h3>
        <div className="ml-4">{children}</div>
      </div>
    );
  }

  // Default section rendering - with box for main sections
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="ml-4">{children}</div>
    </div>
  );
}
