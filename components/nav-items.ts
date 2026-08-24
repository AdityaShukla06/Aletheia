export type NavItem = {
  label: string;
  href: string;
};

export const primaryNavItems: NavItem[] = [
  { label: "Library", href: "/library" },
  { label: "Search", href: "/search" },
  { label: "Upload", href: "/upload" },
  { label: "Cross-Paper", href: "/cross-paper" },
  { label: "Claim Verification", href: "/claim-verification" },
  { label: "Reproducibility", href: "/reproducibility" },
];

export const secondaryNavItems: NavItem[] = [
  { label: "Settings", href: "/settings" },
];
