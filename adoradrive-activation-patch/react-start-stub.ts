// Stub para @tanstack/react-start no build SPA
// useServerFn vira uma chamada fetch direta no cliente
export const useServerFn = (fn: (...args: unknown[]) => unknown) => fn;
export const createServerFn = (_method: string) => ({
  handler: (fn: (...args: unknown[]) => unknown) => fn,
  validator: (_v: unknown) => ({ handler: (fn: (...args: unknown[]) => unknown) => fn }),
});
export const createMiddleware = (_opts?: unknown) => ({
  server: (_fn: unknown) => ({}),
  client: (_fn: unknown) => ({}),
  middleware: (_fn: unknown) => ({}),
});
export default {};
