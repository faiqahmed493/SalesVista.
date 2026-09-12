'use client';

import React, { useState } from 'react';
import ChartRenderer from './ChartRenderer';
import type { VisualizationConfig, DataRecord } from '@/lib/visualization/types';

interface DashboardItem {
  id: string;
  config: VisualizationConfig;
  data: DataRecord[];
}

export default function SalesDashboard() {
  const [isDark, setIsDark] = useState<boolean>(true);

  // Active dashboard item state allowing additions/deletions
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardItem[]>([
    {
      id: 'rev-quota',
      config: {
        type: 'composed',
        title: 'Revenue vs Sales Target',
        description: 'Monthly progression with target overlay',
        xKey: 'month',
        unit: '$',
        series: [
          { key: 'actual', label: 'Actual Revenue', chartType: 'bar', color: '#3B82F6' },
          { key: 'target', label: 'Quota', chartType: 'line', dashed: true, color: '#10B981' },
        ],
      },
      data: [
        { month: 'Jan', actual: 45000, target: 40000 },
        { month: 'Feb', actual: 52000, target: 48000 },
        { month: 'Mar', actual: 58000, target: 55000 },
        { month: 'Apr', actual: 64000, target: 60000 },
        { month: 'May', actual: 79000, target: 70000 },
      ],
    },
    {
      id: 'pipeline-funnel',
      config: {
        type: 'funnel',
        title: 'Deal Pipeline Velocity',
        description: 'Lead stages to closed won conversion',
        xKey: 'stage',
        series: [{ key: 'count', label: 'Opportunities' }],
      },
      data: [
        { stage: 'Qualified', count: 1200 },
        { stage: 'Discovery', count: 750 },
        { stage: 'Proposal', count: 420 },
        { stage: 'Negotiation', count: 190 },
        { stage: 'Closed Won', count: 110 },
      ],
    },
    {
      id: 'product-share',
      config: {
        type: 'pie',
        title: 'Segment Contribution',
        description: 'Revenue split by tier',
        xKey: 'segment',
        series: [{ key: 'revenue', label: 'Revenue' }],
      },
      data: [
        { segment: 'Enterprise', revenue: 450000 },
        { segment: 'Mid-Market', revenue: 280000 },
        { segment: 'SMB', revenue: 140000 },
      ],
    },
    {
      id: 'rep-radar',
      config: {
        type: 'radar',
        title: 'Sales Rep Index',
        description: 'Performance across core capabilities',
        xKey: 'rep',
        radarIndicators: [
          { name: 'Attainment', max: 100 },
          { name: 'Win Rate', max: 100 },
          { name: 'Outreach', max: 100 },
          { name: 'Deal Size', max: 100 },
        ],
        series: [
          { key: 'attainment', label: 'Attainment' },
          { key: 'winRate', label: 'Win Rate' },
          { key: 'outreach', label: 'Outreach' },
          { key: 'dealSize', label: 'Deal Size' },
        ],
      },
      data: [
        { rep: 'Alice (Senior AE)', attainment: 92, winRate: 68, outreach: 80, dealSize: 85 },
        { rep: 'Bob (Mid AE)', attainment: 74, winRate: 45, outreach: 90, dealSize: 60 },
      ],
    },
  ]);

  const handleRemoveChart = (id: string) => {
    setDashboardWidgets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
        padding: '32px 24px',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: isDark ? '#F9FAFB' : '#0F172A',
            }}
          >
            Executive Analytics Suite
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: isDark ? '#9CA3AF' : '#64748B' }}>
            Interactive ECharts BI Dashboard ({dashboardWidgets.length} Active Charts)
          </p>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#F9FAFB' : '#0F172A',
            border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
            padding: '8px 16px',
            borderRadius: 9999,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 20,
        }}
      >
        {dashboardWidgets.map((widget) => (
          <ChartRenderer
            key={widget.id}
            config={widget.config}
            data={widget.data}
            isDark={isDark}
            onRemove={() => handleRemoveChart(widget.id)}
          />
        ))}
      </div>
    </div>
  );
}