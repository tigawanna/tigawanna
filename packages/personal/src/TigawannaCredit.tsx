"use client";

import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Theme } from "@astryxdesign/core/theme";
import type { ComponentType, SVGProps } from "react";
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

export type TigawannaCreditProps = {
  /** Corner placement for the floating badge. */
  position?: CreditPosition;
  /** Accessible name for the trigger button. */
  label?: string;
  /** Start with the profile dialog open. */
  defaultOpen?: boolean;
};

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

/**
 * Floating “made by tigawanna” credit badge.
 * Uses Astryx primitives + a theme that prefers host shadcn CSS variables.
 */
export function TigawannaCredit({
  position = "bottom-right",
  label = `Made by ${creditProfile.brand}`,
  defaultOpen = false,
}: TigawannaCreditProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Theme theme={creditTheme} mode="system">
      <Stack
        direction="horizontal"
        xstyle={[styles.anchor, positionStyles[position]]}
        data-test="tigawanna-credit"
      >
        <IconButton
          label={label}
          tooltip={label}
          variant="secondary"
          elevation="high"
          icon={<TigawannaMark size={18} />}
          data-test="tigawanna-credit-trigger"
          onClick={() => setIsOpen(true)}
        />
      </Stack>

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
            </LayoutContent>
          }
        />
      </Dialog>
    </Theme>
  );
}
