'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VisualizationPayload } from '@/lib/ai/chatTypes';

interface SavedInsightsContextType {
  savedVisualizations: VisualizationPayload[];
  saveVisualization: (visualization: VisualizationPayload) => void;
  removeVisualization: (title: string, type?: string) => void;
  isSaved: (title: string, type?: string) => boolean;
}

const SavedInsightsContext = createContext<SavedInsightsContextType | undefined>(undefined);

const STORAGE_KEY = 'salesvista_saved_insights_v1';

/**
 * Strict helper to compare if two visualization payloads represent the same widget.
 * Normalizes title (trimmed, lowercased) and checks type to prevent duplicate cards.
 */
function isSameWidget(a: VisualizationPayload, bTitle: string, bType?: string): boolean {
  if (!a || !a.config || !a.config.title) return false;
  const normATitle = a.config.title.trim().toLowerCase();
  const normBTitle = bTitle.trim().toLowerCase();

  if (bType) {
    return normATitle === normBTitle && a.config.type === bType;
  }
  return normATitle === normBTitle;
}

/**
 * Filter an array of visualizations to ensure unique items only (no duplicates).
 */
export function deduplicateVisualizations(items: VisualizationPayload[]): VisualizationPayload[] {
  const result: VisualizationPayload[] = [];

  for (const item of items) {
    if (!item || !item.config || !item.config.title) continue;
    const exists = result.some((existing) =>
      isSameWidget(existing, item.config.title, item.config.type)
    );
    if (!exists) {
      result.push(item);
    }
  }

  return result;
}

export const SavedInsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedVisualizations, setSavedVisualizations] = useState<VisualizationPayload[]>([]);

  // Load and deduplicate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = deduplicateVisualizations(parsed);
          setSavedVisualizations(cleaned);
          // If duplicates were found and stripped, update localStorage with clean array
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load saved insights from localStorage:', e);
    }
  }, []);

  // Save visualization with strict duplicate prevention
  const saveVisualization = (visualization: VisualizationPayload) => {
    if (!visualization || !visualization.config || !visualization.config.title) return;

    setSavedVisualizations((current) => {
      // Check if widget with same normalized title and type already exists
      const exists = current.some((item) =>
        isSameWidget(item, visualization.config.title, visualization.config.type)
      );

      if (exists) {
        // Already saved; do not add duplicate
        return current;
      }

      const updated = [visualization, ...current];
      const cleaned = deduplicateVisualizations(updated);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch (e) {
        console.warn('Failed to save insight to localStorage:', e);
      }
      return cleaned;
    });
  };

  // Remove visualization matching title (and optional type)
  const removeVisualization = (title: string, type?: string) => {
    if (!title) return;

    setSavedVisualizations((current) => {
      const updated = current.filter((item) => !isSameWidget(item, title, type));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update localStorage after remove:', e);
      }
      return updated;
    });
  };

  // Check if visualization is already saved (case-insensitive & trimmed)
  const isSaved = (title: string, type?: string) => {
    if (!title) return false;
    return savedVisualizations.some((item) => isSameWidget(item, title, type));
  };

  return (
    <SavedInsightsContext.Provider
      value={{
        savedVisualizations,
        saveVisualization,
        removeVisualization,
        isSaved,
      }}
    >
      {children}
    </SavedInsightsContext.Provider>
  );
};

export function useSavedInsights() {
  const context = useContext(SavedInsightsContext);
  if (!context) {
    throw new Error('useSavedInsights must be used within a SavedInsightsProvider');
  }
  return context;
}
