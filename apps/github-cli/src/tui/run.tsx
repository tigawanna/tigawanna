import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app.js";

export async function runTui() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  await new Promise<void>((resolve) => {
    createRoot(renderer).render(
      <App
        onQuit={() => {
          renderer.destroy();
          resolve();
        }}
      />,
    );
  });
}
