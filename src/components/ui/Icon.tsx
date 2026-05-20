export type IconName =
  | 'leaf'      // brand mark, on-track badge
  | 'city'      // directory cards, admin home
  | 'gauge'     // progress KPI
  | 'sprout'    // empty states (e.g. zero cities)
  | 'sun'       // light theme toggle
  | 'moon'      // dark theme toggle
  | 'cloud'     // import flow
  | 'history'   // imports history nav
  | 'check'     // success toast
  | 'alert'     // warning toast
  | 'x';        // close / dismiss

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

const iconPaths: Record<IconName, React.ReactNode> = {
  leaf: (
    <path
      d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c4 0 8.5-3 10-8 1.5-5 1-8-1-10z"
      fill="currentColor"
    />
  ),
  city: (
    <>
      <path d="M3 21h18v-2H3v2zM5 19V9h4v10H5zM11 19V5h4v14h-4zM17 19V11h4v8h-4z" fill="currentColor" />
    </>
  ),
  gauge: (
    <>
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
        fill="currentColor"
      />
      <path d="M12 6v6l4.24 2.54.76-1.27-3.5-2.1V6h-1.5z" fill="currentColor" />
    </>
  ),
  sprout: (
    <path
      d="M12 22c-1 0-2-.5-2.5-1.5C8 18 8 15 8 15s3 0 5.5 1.5c1 .6 1.5 1.5 1.5 2.5h-1c0-.5-.3-1-.8-1.3C11.5 16.5 10 16 9.5 15.9c.1 1 .5 2.5 1.5 3.6.5.5 1 .5 1 .5s.5 0 1-.5c1-1.1 1.4-2.6 1.5-3.6-.5.1-2 .6-3.7 1.7M12 2C9 2 7 4.5 7 7c0 3 2 5 5 5s5-2 5-5c0-2.5-2-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
      fill="currentColor"
    />
  ),
  sun: (
    <path
      d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
      fill="currentColor"
    />
  ),
  moon: (
    <path
      d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
      fill="currentColor"
    />
  ),
  cloud: (
    <path
      d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      fill="currentColor"
    />
  ),
  history: (
    <>
      <path
        d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7a6.93 6.93 0 0 1-4.95-2.05l-1.41 1.41A8.96 8.96 0 0 0 13 21a9 9 0 0 0 0-18z"
        fill="currentColor"
      />
      <path d="M12.5 8H11v5l4.28 2.54.72-1.21-3.5-2.08V8z" fill="currentColor" />
    </>
  ),
  check: (
    <path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
      fill="currentColor"
    />
  ),
  alert: (
    <path
      d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
      fill="currentColor"
    />
  ),
  x: (
    <path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      fill="currentColor"
    />
  ),
};

export function Icon({ name, size = 24, className, ariaLabel }: IconProps) {
  const accessibilityProps = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...accessibilityProps}
    >
      {iconPaths[name]}
    </svg>
  );
}
