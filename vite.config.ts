import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcss from "tailwindcss";
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
    },
  },
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'RocketDoc',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    minify: "esbuild",
    cssMinify: "esbuild",
  },
  define: { 'process.env.NODE_ENV': `"${process.env.NODE_ENV}"` },
  plugins: [
    react(),
    libInjectCss(),
    dts({ include: ['lib'], rollupTypes: true, tsconfigPath: resolve(__dirname, 'tsconfig.build.json') }),
    // Uncomment this line to visualize the bundle size
    // visualizer({ open: true, filename: 'bundle-visualization.html' })
  ],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
})
