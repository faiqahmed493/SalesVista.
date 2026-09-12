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

export const SavedInsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedVisualizations, setSavedVisualizations] = useState<VisualizationPayload[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedVisualizations(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load saved insights from localStorage:', e);
    }
  }, []);

  // Save to localStorage on change
  const saveVisualization = (visualization: VisualizationPayload) => {
    setSavedVisualizations((current) => {
      const exists = current.some(
        (item) =>
          item.config.title === visualization.config.title &&
          item.config.type === visualization.config.type
      );
      if (exists) return current;
      const updated = [visualization, ...current];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save insight to localStorage:', e);
      }
      return updated;
    });
  };

  const removeVisualization = (title: string, type?: string) => {
    setSavedVisualizations((current) => {
      const updated = current.filter((item) => {
        if (type) {
          return !(item.config.title === title && item.config.type === type);
        }
        return item.config.title !== title;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update localStorage after remove:', e);
      }
      return updated;
    });
  };

  const isSaved = (title: string, type?: string) => {
    return savedVisualizations.some((item) => {
      if (type) {
        return item.config.title === title && item.config.type === type;
      }
      return item.config.title === title;
    });
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
