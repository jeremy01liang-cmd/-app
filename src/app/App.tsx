import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GameProvider } from "./context/GameContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <GameProvider>
      {/* 确保 iPad 尺寸的容器适配，这里使用全屏高度 */}
      <div className="w-full h-screen overflow-hidden text-gray-800 bg-gray-100 font-sans select-none antialiased">
        <RouterProvider router={router} />
        {/* 配置全局提示组件，放大字体和图标，使其适合儿童使用 */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "18px",
              padding: "16px",
              borderRadius: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            },
            className: "font-bold",
          }}
        />
      </div>
    </GameProvider>
  );
}
