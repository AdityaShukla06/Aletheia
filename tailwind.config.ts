import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        "surface-raised": "var(--bg-surface-raised)",

        hairline: "var(--border-hairline)",
        "hairline-subtle": "var(--border-hairline-subtle)",

        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",

        brass: "var(--accent-brass)",
        "brass-bright": "var(--accent-brass-bright)",
        oxblood: "var(--accent-oxblood)",
        "oxblood-bright": "var(--accent-oxblood-bright)",
        forest: "var(--accent-forest)",
        "forest-bright": "var(--accent-forest-bright)",

        success: "var(--status-success)",
        warning: "var(--status-warning)",
        error: "var(--status-error)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        reading: ["var(--font-reading)"],
        ui: ["var(--font-ui)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
};

export default config;
