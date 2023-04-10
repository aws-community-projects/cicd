import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: ['**/*.spec.ts', 'cdk/cicd.awscommunitybuilders.org.ts'],
      include: ['cdk'],
    },
    deps: {
      inline: ['vitest-mock-process'],
    },
    setupFiles: './test/setup.ts',
    threads: false,
  },
});
