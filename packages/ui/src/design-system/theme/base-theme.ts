import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  theme: {
    // 👇🏻 Define your tokens here
    extend: {
      tokens: {
        colors: {
          primary: { value: '#0FEE0F' },
          secondary: { value: '#EE0F0F' },
        },
        fonts: {
          body: { value: 'system-ui, sans-serif' },
        },
      },
    },
  },
});
