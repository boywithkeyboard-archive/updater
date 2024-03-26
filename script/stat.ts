export function stat(path: string) {
  try {
    return Deno.statSync(path)
  } catch (_err) {
    return null
  }
}
