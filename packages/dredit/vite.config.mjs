import stylexPlugin from "unplugin-stylex/vite";

/**
 * Vite config used by Ladle for StyleX during story previews.
 * @see https://ladle.dev/docs/config/
 * @see https://github.com/eryue0220/unplugin-stylex
 */
export default {
  plugins: [
    stylexPlugin({
      stylex: {
        filename: "stylex.css",
        useCSSLayers: true,
        treeshakeCompensation: true,
      },
    }),
  ],
};
