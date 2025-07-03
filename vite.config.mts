import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default () => {
  return defineConfig({
    base: "",
    plugins: [zaloMiniApp(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
    define: {
      // Replace import.meta.env với process.env để tương thích
      'import.meta.env': 'process.env',
    },
    build: {
      outDir: "www",
      assetsDir: "assets",
      target: ["es2015", "safari11"], // Tương thích với Zalo WebView cũ
      rollupOptions: {
        output: {
          format: "iife", // IIFE để tránh module issues
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          // Đảm bảo polyfill cho các features mới
          manualChunks: undefined,
        },
      },
      // Đảm bảo minification an toàn
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Giữ console để debug
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
    },
  });
};