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
        '/api': {
          target: 'https://zalo.kosmosdevelopment.com',
          changeOrigin: true,
          secure: true
        },
      },
    },
    build: {
      outDir: "www",
      assetsDir: "assets",
      target: "es2015", // Thêm dòng này
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          format: 'iife', // Thêm dòng này
        },
      },
    },
  });
};