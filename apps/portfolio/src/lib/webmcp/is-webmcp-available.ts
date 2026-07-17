export function isWebMcpAvailable() {
  if (typeof document === "undefined") return false;

  const modelContext = document.modelContext;
  return typeof modelContext?.registerTool === "function";
}
