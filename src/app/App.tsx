import React from "react";
import { Capacitor } from "@capacitor/core";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GameProvider } from "./context/GameContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export default function App() {
  const isNativeShell = Capacitor.isNativePlatform();

  return (
    <AuthProvider>
      <GameProvider>
        <div
          className={`min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#fef3c7_100%)] font-sans text-gray-800 select-none antialiased ${
            isNativeShell ? "native-app-shell" : ""
          }`}
        >
          <div className={isNativeShell ? "native-app-frame" : "flex min-h-dvh items-center justify-center p-4"}>
            <div
              className={`ipad-stage overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(56,189,248,0.2)] backdrop-blur-md ${
                isNativeShell ? "native-app-stage rounded-none border-0 bg-white shadow-none backdrop-blur-none" : ""
              }`}
            >
              <div className={`h-full w-full overflow-hidden bg-white ${isNativeShell ? "native-app-content" : ""}`}>
                <RouterProvider router={router} />
              </div>
            </div>
          </div>
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
    </AuthProvider>
  );
}
