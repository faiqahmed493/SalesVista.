'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import type { VisualizationPayload } from '@/lib/ai/chatTypes';
import ChartRenderer from '@/components/visualization/ChartRenderer';
import { useSavedInsights } from '@/lib/context/SavedInsightsContext';

export interface SavedInsightCardRef {
  refresh: () => Promise<void>;
}

interface SavedInsightCardProps {
  item: VisualizationPayload;
  onRemove: () => void;
  isDark?: boolean;
}

export const SavedInsightCard = forwardRef<SavedInsightCardRef, SavedInsightCardProps>(
  ({ item, onRemove, isDark = false }, ref) => {
    const { updateVisualizationData, saveVisualization } = useSavedInsights();
    const [currentData, setCurrentData] = useState(item.data);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRefresh = async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      setError(null);

      try {
        const res = await fetch('/api/insights/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sqlQuery: item.sqlQuery,
            config: item.config,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data)) {
          setCurrentData(json.data);
          setLastRefreshed(new Date());
          
          // Persist fresh data back into localStorage & React context
          updateVisualizationData(item.config.title, json.data, item.config.type);

          // If a query was resolved, update the item payload in context so sqlQuery is attached
          if (json.sqlQuery && !item.sqlQuery) {
            saveVisualization({
              ...item,
              data: json.data,
              sqlQuery: json.sqlQuery,
            });
          }
        } else {
          throw new Error(json.error || 'Failed to execute query for updated chart data.');
        }
      } catch (err) {
        console.error('Failed to refresh saved insight:', err);
        setError((err as Error).message);
      } finally {
        setIsRefreshing(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: handleRefresh,
    }));

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {error && (
          <div
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 10,
              fontSize: 12,
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>⚠️ Refresh failed: {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#B91C1C',
                fontWeight: 'bold',
                fontSize: 13,
              }}
            >
              ✕
            </button>
          </div>
        )}
        <ChartRenderer
          config={item.config}
          data={currentData}
          isDark={isDark}
          onRemove={onRemove}
          lastRefreshed={lastRefreshed}
        />
      </div>
    );
  }
);

SavedInsightCard.displayName = 'SavedInsightCard';
