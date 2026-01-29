import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5185,
    host: '0.0.0.0'
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
          'analytics': ['./src/utils/technicalIndicators.js', './src/utils/backtesting.js', './src/utils/pricePredictor.js'],
          'components-advanced': ['./src/components/AdvancedChart.jsx', './src/components/BacktestingPanel.jsx', './src/components/PricePredictionPanel.jsx']
        }
      }
    }
  }
})
