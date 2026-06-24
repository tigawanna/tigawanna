import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    "apps/site/**": "pnpm --filter site exec vp check --fix",
  },
  lint: {"options":{"typeAware":true,"typeCheck":true}},
});
