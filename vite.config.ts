import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Split large, stable vendors into their own long-cacheable chunks.
        codeSplitting: {
          groups: [
            { name: 'antd', test: /node_modules\/(antd|@ant-design|rc-[^/]+|@rc-component)\// },
            { name: 'react', test: /node_modules\/(react|react-dom|scheduler)\// },
          ],
        },
      },
    },
  },
})
