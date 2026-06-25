interface SiteIconProps {
  className?: string;
  size?: number;
}

export function SiteIcon({ className, size = 24 }: SiteIconProps) {
  return (
    <img
      src="/icon.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}
