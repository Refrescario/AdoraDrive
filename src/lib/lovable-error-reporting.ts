// Standalone error reporting — sem dependência de plataforma externa.
export function reportRuntimeError(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('[AdoraDrive] Runtime error', context ?? {}, error);
  }
}

// Alias para compatibilidade com imports existentes
export const reportLovableError = reportRuntimeError;
