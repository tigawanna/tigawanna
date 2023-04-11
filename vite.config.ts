import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";


// `options` are passed to `@mdx-js/mdx`
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
    // E.g. `remark-frontmatter`
  ],
  rehypePlugins: [],
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    rakkas({
      adapter: "vercel", // or "vercel-edge"
    }),

  ],
  server: {
    host: true,
  },
});
