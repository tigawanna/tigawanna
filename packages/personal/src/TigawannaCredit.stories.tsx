import type { Story, StoryDefault } from "@ladle/react";
import type { CSSProperties, ReactNode } from "react";
import "./astryx-styles";
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

export const WithoutHostTokens: Story = () => <TigawannaCredit defaultOpen />;

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
    options: ["bottom-right", "bottom-left", "top-right", "top-left"],
  },
  defaultOpen: {
    control: { type: "boolean" },
  },
};
