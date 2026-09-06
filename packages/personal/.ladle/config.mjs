/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",
  defaultStory: "tigawanna-credit--open-by-default",
  addons: {
    theme: {
      enabled: true,
      defaultState: "light",
    },
  },
  appendToHead: `<style>
    :root {
      --ladle-main-padding: 0;
      --ladle-main-padding-mobile: 0;
      --ladle-bg-color-primary: #ebe6dc;
    }
    .ladle-main {
      min-height: 100%;
      background:
        radial-gradient(circle at top left, rgba(196, 92, 38, 0.12), transparent 42%),
        linear-gradient(160deg, #f7f4ee 0%, #ebe6dc 100%);
    }
  </style>`,
};
