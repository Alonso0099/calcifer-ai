// Configuración de Vite, la herramienta que corre la app mientras se programa
// (npm run dev) y que la empaqueta para publicarla (npm run build).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El plugin de React le enseña a Vite a entender los archivos .jsx.
export default defineConfig({
  plugins: [react()],
});
