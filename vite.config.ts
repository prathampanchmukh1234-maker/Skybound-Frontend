import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const frontendEnv = loadEnv(mode, __dirname, '');
  const env = { ...rootEnv, ...frontendEnv };

  return {
    plugins: [react(), tailwindcss()],
    
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },

    build: {
      outDir: 'dist',   // ✅ now correct
      emptyOutDir: true,
    }
  };
});