import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '../../../frontend-web/node_modules/vite/dist/node/index.js';
import react from '../../../frontend-web/node_modules/@vitejs/plugin-react/dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shimPath = path.resolve(__dirname, 'rn-shim.jsx');
const webNodeModules = path.resolve(__dirname, '../../../frontend-web/node_modules');
const mobileAppPath = path.resolve(__dirname, '../../../frontend-mobile/App.js');
const targetJsxPath = path.resolve(__dirname, 'MobileApp.jsx');

// Sao chép nguyên bản 100% frontend-mobile/App.js sang đuôi .jsx để Vite 8 OXC biên dịch JSX
fs.copyFileSync(mobileAppPath, targetJsxPath);

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': shimPath,
      'expo-status-bar': shimPath,
      react: path.join(webNodeModules, 'react'),
      'react-dom': path.join(webNodeModules, 'react-dom'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '../../..')],
    },
  },
});
