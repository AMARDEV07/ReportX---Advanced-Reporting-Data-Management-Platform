import { memo } from "react";

const LOGO_SRC = "data:image/jpeg;base64,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";


const STYLES = `
  @keyframes logoBounce {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-10px); }
  }
`;

const SIZE_PX = { sm: 32, md: 56, lg: 80, xl: 104 };

const Loader = memo(({
  size = "md",
  text = "Loading…",
  fullScreen = false,
  blur = true,
}) => {
  const px = SIZE_PX[size] ?? 56;

  const Content = () => (
    <div
      role="status"
      aria-busy="true"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "#C14F0E",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <img
        src={LOGO_SRC}
        alt="loading"
        style={{
          width: px,
          height: px,
          borderRadius: 10,
          objectFit: "contain",
          animation: "logoBounce 0.9s ease-in-out infinite",
        }}
      />

      {text && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            opacity: 0.7,
            letterSpacing: "0.04em",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: blur ? "blur(5px)" : "none",
        }}
      >
        <style>{STYLES}</style>
        <Content />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
      <style>{STYLES}</style>
      <Content />
    </div>
  );
});

export default Loader;
export { Loader };