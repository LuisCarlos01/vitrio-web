import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './src/mocks/server';

// next/image reescreve `src` pra passar pelo otimizador (/_next/image?url=...), que só
// existe rodando dentro do Next.js — nos testes isso quebraria as asserções de `src` exato
// dos componentes. Troca por um <img> passthrough, mesmo padrão usado no ecossistema Next.
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: Record<string, unknown>) => {
    delete rest.fill;
    delete rest.priority;
    return createElement('img', {
      src: typeof src === 'string' ? src : (src as { src: string })?.src,
      alt,
      ...rest,
    });
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
