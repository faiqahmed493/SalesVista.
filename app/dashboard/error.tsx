"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: 440,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2
          style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}
        >
          Dashboard failed to load
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
          {error.message ||
            "An unexpected error occurred while loading weather data."}
        </p>
        {error.digest && (
          <code
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              background: "var(--muted)",
              padding: "4px 8px",
              borderRadius: 4,
            }}
          >
            Error ID: {error.digest}
          </code>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            background: "var(--accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
