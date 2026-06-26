export function isTursoRemote(url: string) {
  return url.startsWith("libsql://") && !url.includes("127.0.0.1") && !url.includes("localhost");
}
