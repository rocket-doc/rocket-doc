import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcss from "tailwindcss";
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// The `standalone` mode bundles React & ReactDOM in a single self contained UMD file,
// so that the browser usage does not require any additional script tag.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'lib'),
      },
    },
    build: {
      // The standalone bundle is built after the regular one, it must not wipe it
      emptyOutDir: !standalone,
      rollupOptions: standalone ? {} : {
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
        formats: standalone ? ['umd'] : ['es', 'umd'],
        fileName: (format) => (standalone ? 'index.standalone.umd.js' : `index.${format}.js`),
      },
      minify: "esbuild",
      cssMinify: "esbuild",
    },
    define: {
      'process.env.NODE_ENV': `"${standalone ? 'production' : process.env.NODE_ENV}"`,
    },
    plugins: [
      react(),
      libInjectCss(),
      ...(standalone ? [] : [dts({ include: ['lib'], rollupTypes: true, tsconfigPath: resolve(__dirname, 'tsconfig.build.json') })]),
      // Uncomment this line to visualize the bundle size
      // visualizer({ open: true, filename: 'bundle-visualization.html' })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
  };
})
