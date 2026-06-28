/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      "colors": {
              "tertiary-fixed": "#ffdcc6",
              "inverse-on-surface": "#313032",
              "on-tertiary-fixed-variant": "#723600",
              "on-primary-fixed-variant": "#004395",
              "primary-fixed-dim": "#adc6ff",
              "on-primary": "#002e6a",
              "error-container": "#93000a",
              "secondary": "#c0c1ff",
              "on-background": "#e5e1e4",
              "tertiary-fixed-dim": "#ffb786",
              "surface-container": "#201f21",
              "surface-bright": "#39393b",
              "on-primary-fixed": "#001a42",
              "on-secondary-fixed-variant": "#2f2ebe",
              "primary": "#adc6ff",
              "on-secondary-container": "#b0b2ff",
              "on-secondary-fixed": "#07006c",
              "primary-fixed": "#d8e2ff",
              "surface-dim": "#131315",
              "inverse-primary": "#005ac2",
              "surface-container-high": "#2a2a2c",
              "on-secondary": "#1000a9",
              "on-error": "#690005",
              "surface-container-low": "#1c1b1d",
              "on-tertiary-container": "#461f00",
              "surface-variant": "#353437",
              "tertiary": "#ffb786",
              "outline": "#8c909f",
              "surface-container-highest": "#353437",
              "on-error-container": "#ffdad6",
              "on-surface": "#e5e1e4",
              "surface-tint": "#adc6ff",
              "primary-container": "#4d8eff",
              "on-surface-variant": "#c2c6d6",
              "on-primary-container": "#00285d",
              "outline-variant": "#424754",
              "secondary-fixed-dim": "#c0c1ff",
              "on-tertiary": "#502400",
              "tertiary-container": "#df7412",
              "background": "#131315",
              "surface": "#131315",
              "error": "#ffb4ab",
              "secondary-container": "#3131c0",
              "inverse-surface": "#e5e1e4",
              "secondary-fixed": "#e1e0ff",
              "on-tertiary-fixed": "#311400",
              "surface-container-lowest": "#0e0e10"
      },
      "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
      },
      "spacing": {
              "panel-padding": "1.25rem",
              "sidebar-ai-width": "320px",
              "gutter": "1rem",
              "container-margin": "1.5rem",
              "sidebar-nav-width": "240px"
      },
      "fontFamily": {
              "label-caps": ["JetBrains Mono"],
              "body-md": ["Inter"],
              "headline-md": ["Geist"],
              "body-sm": ["Inter"],
              "headline-lg": ["Geist"],
              "data-mono": ["JetBrains Mono"]
      },
      "fontSize": {
              "label-caps": ["10px", {"lineHeight": "12px", "letterSpacing": "0.05em", "fontWeight": "700"}],
              "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
              "headline-md": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
              "body-sm": ["12px", {"lineHeight": "18px", "fontWeight": "400"}],
              "headline-lg": ["30px", {"lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
              "data-mono": ["12px", {"lineHeight": "16px", "fontWeight": "500"}]
      }
    }
  },
  plugins: [],
}
