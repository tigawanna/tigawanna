"use client";

import { BottomSheet } from "@astryxdesign/core/BottomSheet";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Heading } from "@astryxdesign/core/Heading";
import { Icon } from "@astryxdesign/core/Icon";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import { Theme } from "@astryxdesign/core/theme";
import type { ComponentType, ReactElement, SVGProps } from "react";
import { useState } from "react";
import { creditProfile } from "./constants";
import {
  DevtoIcon,
  GitHubIcon,
  GlobeIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "./icons";
import { TigawannaMark } from "./mark";
import { styles } from "./styles.stylex";
import { creditTheme } from "./theme";

export type CreditPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/** Default floating trigger copy. */
export const DEFAULT_CREDIT_LABEL: string = `Built with ❤️ by ${creditProfile.brand}`;

export type TigawannaCreditProps = {
  /** Corner placement for the floating badge. */
  position?: CreditPosition;
  /** Override the trigger text (defaults to “Built with ❤️ by tigawanna”). */
  label?: string;
  /** Start with the profile surface open. */
  defaultOpen?: boolean;
  /**
   * Overlay mode. `auto` uses a bottom sheet below 768px, dialog above.
   * Force `sheet` / `dialog` for tests and demos.
   */
  surface?: "auto" | "dialog" | "sheet";
};

const MOBILE_QUERY = "(max-width: 768px)";

const positionStyles = {
  "bottom-right": styles.bottomRight,
  "bottom-left": styles.bottomLeft,
  "top-right": styles.topRight,
  "top-left": styles.topLeft,
} as const;

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

const socialLinks: readonly {
  key: string;
  label: string;
  href: string;
  external: boolean;
  Icon: SocialIcon;
}[] = [
  { key: "website", label: "Website", href: creditProfile.links.website, external: true, Icon: GlobeIcon },
  { key: "github", label: "GitHub", href: creditProfile.links.github, external: true, Icon: GitHubIcon },
  { key: "linkedin", label: "LinkedIn", href: creditProfile.links.linkedin, external: true, Icon: LinkedInIcon },
  { key: "twitter", label: "Twitter / X", href: creditProfile.links.twitter, external: true, Icon: XIcon },
  { key: "devto", label: "Dev.to", href: creditProfile.links.devto, external: true, Icon: DevtoIcon },
  { key: "email", label: "Email", href: creditProfile.links.emailTo, external: false, Icon: MailIcon },
];

function CreditBody(): ReactElement {
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="label" color="accent" display="block">
        {creditProfile.brand}
      </Text>
      <Text type="body" display="block">
        {creditProfile.description}
      </Text>
      <Text type="supporting" color="secondary" display="block">
        {creditProfile.locationLabel} {creditProfile.location}
      </Text>

      <Stack direction="horizontal" gap={1} wrap="wrap" hAlign="start">
        {socialLinks.map((link) => (
          <Button
            key={link.key}
            label={link.label}
            tooltip={link.label}
            variant="secondary"
            size="sm"
            isIconOnly
            icon={<Icon icon={link.Icon} />}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            data-test={`tigawanna-credit-link-${link.key}`}
          />
        ))}
      </Stack>

      <Button
        label="Visit portfolio"
        variant="primary"
        width="100%"
        href={creditProfile.links.website}
        target="_blank"
        rel="noopener noreferrer"
        data-test="tigawanna-credit-cta"
      />
    </Stack>
  );
}

/**
 * Floating “tigawanna” credit badge.
 * Dialog on desktop; bottom sheet on mobile viewports.
 */
export function TigawannaCredit({
  position = "bottom-right",
  label = DEFAULT_CREDIT_LABEL,
  defaultOpen = false,
  surface = "auto",
}: TigawannaCreditProps): ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobileViewport = useMediaQuery(MOBILE_QUERY);
  const useSheet = surface === "sheet" || (surface === "auto" && isMobileViewport);

  return (
    <Theme theme={creditTheme} mode="system">
      <Stack
        direction="horizontal"
        xstyle={[styles.anchor, positionStyles[position]]}
        data-test="tigawanna-credit"
      >
        <Button
          label={label}
          tooltip={label}
          variant="secondary"
          size="sm"
          elevation="high"
          icon={<TigawannaMark size={16} />}
          data-test="tigawanna-credit-trigger"
          onClick={() => setIsOpen(true)}
        />
      </Stack>

      {useSheet ? (
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label={creditProfile.name}
          purpose="info"
          height="hug"
          data-test="tigawanna-credit-sheet"
        >
          <Stack direction="vertical" gap={3} padding={4}>
            <Heading level={3}>{creditProfile.name}</Heading>
            <Text type="supporting" color="secondary" display="block">
              {creditProfile.role}
            </Text>
            <CreditBody />
          </Stack>
        </BottomSheet>
      ) : (
        <Dialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          purpose="info"
          width={400}
          data-test="tigawanna-credit-dialog"
        >
          <Layout
            header={
              <DialogHeader
                title={creditProfile.name}
                subtitle={creditProfile.role}
                onOpenChange={setIsOpen}
              />
            }
            content={
              <LayoutContent>
                <CreditBody />
              </LayoutContent>
            }
          />
        </Dialog>
      )}
    </Theme>
  );
}
