import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GameProvider } from "./context/GameContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#fef3c7_100%)] font-sans text-gray-800 select-none antialiased">
          <div className="flex min-h-dvh items-center justify-center p-4">
            <div className="ipad-stage overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(56,189,248,0.2)] backdrop-blur-md">
              <div className="h-full w-full overflow-hidden bg-white">
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
