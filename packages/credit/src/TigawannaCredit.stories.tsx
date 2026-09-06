import type { Story, StoryDefault } from "@ladle/react";
import type { CSSProperties, ReactNode } from "react";
import { TigawannaCredit, type CreditPosition } from "./TigawannaCredit";

export default {
  title: "Tigawanna Credit",
} satisfies StoryDefault;

/** Demo host tokens — mimics a typical shadcn theme so the bridge is visible. */
function ShadcnHost({ children }: { children: ReactNode }) {
  return (
    <div
      style={
        {
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
          "--background": "#f4f1ea",
          "--foreground": "#1a1814",
          "--card": "#fffcf7",
          "--card-foreground": "#1a1814",
          "--popover": "#fffcf7",
          "--primary": "#c45c26",
          "--primary-foreground": "#fff7f0",
          "--muted": "#ebe4d8",
          "--muted-foreground": "#5c574e",
          "--border": "#ddd4c5",
          "--radius": "0.75rem",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export const Default: Story = () => (
  <ShadcnHost>
    <TigawannaCredit />
  </ShadcnHost>
);

export const CustomLabel: Story = () => (
  <ShadcnHost>
    <TigawannaCredit label="Crafted with care by tigawanna" />
  </ShadcnHost>
);

export const BottomLeft: Story = () => (
  <ShadcnHost>
    <TigawannaCredit position="bottom-left" />
  </ShadcnHost>
);

export const TopRight: Story = () => (
  <ShadcnHost>
    <TigawannaCredit position="top-right" />
  </ShadcnHost>
);

export const OpenByDefault: Story = () => (
  <ShadcnHost>
    <TigawannaCredit defaultOpen />
  </ShadcnHost>
);

/** Force the mobile bottom-sheet path. */
export const MobileSheet: Story = () => (
  <ShadcnHost>
    <TigawannaCredit defaultOpen surface="sheet" />
  </ShadcnHost>
);

/** In-flow (e.g. footer) — not fixed to the viewport. */
export const InlineInFooter: Story = () => (
  <ShadcnHost>
    <div style={{ minHeight: "120vh", padding: "2rem" }}>
      <p>Scroll down to the footer credit…</p>
    </div>
    <footer
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        borderTop: "1px solid var(--border)",
      }}
    >
      <TigawannaCredit position="inline" />
    </footer>
  </ShadcnHost>
);

export const WithoutHostTokens: Story = () => <TigawannaCredit defaultOpen />;

/** System/host dark — badge should not stay stuck on white fallbacks. */
export const DarkMode: Story = () => (
  <div
    style={
      {
        minHeight: "100vh",
        colorScheme: "dark",
        background: "#1c1917",
        color: "#fafaf9",
        "--background": "#1c1917",
        "--foreground": "#fafaf9",
        "--card": "#292524",
        "--card-foreground": "#fafaf9",
        "--primary": "#fb923c",
        "--primary-foreground": "#1c1917",
        "--muted": "#44403c",
        "--muted-foreground": "#a8a29e",
        "--border": "#57534e",
        "--radius": "0.75rem",
      } as CSSProperties
    }
  >
    <TigawannaCredit defaultOpen />
  </div>
);

type ControlsArgs = {
  position: CreditPosition;
  defaultOpen: boolean;
};

export const WithControls: Story<ControlsArgs> = ({ position, defaultOpen }) => (
  <ShadcnHost>
    <TigawannaCredit position={position} defaultOpen={defaultOpen} />
  </ShadcnHost>
);

WithControls.args = {
  position: "bottom-right",
  defaultOpen: false,
};

WithControls.argTypes = {
  position: {
    control: { type: "select" },
    options: ["bottom-right", "bottom-left", "top-right", "top-left", "inline"],
  },
  defaultOpen: {
    control: { type: "boolean" },
  },
};
