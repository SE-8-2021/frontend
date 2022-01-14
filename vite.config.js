import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {minifyHtml} from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    react(),
    minifyHtml({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true
    })],
  define: {
    'process.env': {}
  },
  build: {
    minify: 'terser',
    brotliSize: true,
    cssCodeSplit: true,
    terserOptions: {
      sourceMap: false,
      ecma: 2020,
      keep_classnames: false,
      keep_fnames: false,
      compress: true,
      format: {
        preserve_annotations: false,
        comments: false
      }
    },
    chunkSizeWarningLimit: 100000,
    rollupOptions: {
      output: {
        preferConst: true,
        freeze: true,
      }
    }
  },
})
