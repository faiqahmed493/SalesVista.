"use client";

import React, { useRef, useState } from "react";
import type { LocationConfig } from "@/lib/data/locations";

interface LocationSelectorProps {
  locations: LocationConfig[];
  selected: string;
  onSelect: (locationId: string) => void;
  disabled?: boolean;
}

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

export default function LocationSelector({
  locations,
  selected,
  onSelect,
  disabled = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLoc = locations.find((l) => l.id === selected) ?? locations[0];
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id !== selected) onSelect(id);
  };

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 13,
          fontWeight: 500,
          color: disabled ? "var(--muted-foreground)" : "var(--foreground)",
          transition: "all 0.15s",
          minWidth: 140,
          justifyContent: "space-between",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--accent)", opacity: 0.8 }}>
            <MapPinIcon />
          </span>
          {selectedLoc?.name ?? "Select location"}
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
            color: "var(--muted-foreground)",
          }}
        >
          <ChevronDown />
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
            overflow: "hidden",
            zIndex: 50,
            minWidth: 160,
          }}
        >
          {locations.map((loc) => (
            <button
              key={loc.id}
              role="option"
              aria-selected={loc.id === selected}
              onClick={() => handleSelect(loc.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "10px 14px",
                background: loc.id === selected ? "var(--muted)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
                borderBottom: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                if (loc.id !== selected)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                if (loc.id !== selected)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
                {loc.name}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                {loc.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
