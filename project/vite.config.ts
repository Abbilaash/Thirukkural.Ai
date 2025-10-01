import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keeping TS config temporarily; a JS version will be added for pure React usage
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
