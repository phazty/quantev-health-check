import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { useUIStore } from "@/stores/uiStore";
import { Toaster } from "@/components/ui/toaster";
import { WindowManager } from "@/floating-windows/WindowManager";
import { wsSimulator } from "@/services/websocketSimulator";

function ThemeSync() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

export default function App() {
  useEffect(() => {
    wsSimulator.start();
    return () => wsSimulator.stop();
  }, []);

  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
      <WindowManager />
      <Toaster />
    </>
  );
}
