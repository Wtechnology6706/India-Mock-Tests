export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid #e2e8f0",
          borderTopColor: "#b94a2b",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <strong style={{ display: "block", color: "#1e3a34", fontSize: "1rem" }}>
          Preparing your examination workspace...
        </strong>
        <small style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
          Northstar Practice Engine
        </small>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
