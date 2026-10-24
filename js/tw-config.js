tailwind.config = {
  theme: {
    extend: {
      colors: {
        sheet: 'var(--sheet)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        dim: 'var(--dim)',
        line: 'var(--line)',
        mark: 'var(--mark)',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
};
