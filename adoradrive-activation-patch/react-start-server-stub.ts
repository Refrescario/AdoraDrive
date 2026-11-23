// Stub para @tanstack/react-start/server no build SPA
// No APK não existe SSR — funções server retornam vazio
export const getRequest = () => null;
export const getEvent = () => null;
export const createMiddleware = () => ({
  server: (_fn: unknown) => ({}),
});
export default {};
