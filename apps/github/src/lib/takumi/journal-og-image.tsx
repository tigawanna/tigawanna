export interface JournalOgImageProps {
  title: string;
  description: string;
  typeLabel: string;
  siteLabel: string;
}

/**
 * JSX template rendered by Takumi into a 1200×630 journal/lesson share card.
 */
export function JournalOgImage({ title, description, typeLabel, siteLabel }: JournalOgImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundImage: "linear-gradient(145deg, #1a1a15 0%, #151811 48%, #1e2119 100%)",
        color: "#f6efd7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontFamily: "Space Grotesk",
            fontSize: "28px",
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: "#c5ccb4",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "999px",
              backgroundColor: "#c5ccb4",
            }}
          />
          {siteLabel}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            border: "1px solid rgba(198, 204, 180, 0.28)",
            borderRadius: "999px",
            fontFamily: "Space Grotesk",
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#d8deca",
          }}
        >
          {typeLabel}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "980px" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontSize: title.length > 72 ? "58px" : "72px",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#f6efd7",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Space Grotesk",
              fontSize: "30px",
              fontWeight: 400,
              lineHeight: 1.35,
              color: "rgba(198, 204, 180, 0.82)",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          fontFamily: "Space Grotesk",
          fontSize: "24px",
          color: "#c5ccb4",
        }}
      >
        Today I Learned
      </div>
    </div>
  );
}
