import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DesktopLayout } from "@/layouts/DesktopLayout";
import { FullPageSpinner } from "@/components/primitives/LoadingState";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const AutomationPage = lazy(() =>
  import("@/pages/AutomationPage").then((m) => ({ default: m.AutomationPage }))
);
const ProtocolAdminPage = lazy(() =>
  import("@/pages/ProtocolAdminPage").then((m) => ({ default: m.ProtocolAdminPage }))
);
const AccessControlPage = lazy(() =>
  import("@/pages/AccessControlPage").then((m) => ({ default: m.AccessControlPage }))
);
const ObservabilityPage = lazy(() =>
  import("@/pages/ObservabilityPage").then((m) => ({ default: m.ObservabilityPage }))
);

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <DesktopLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Page><DashboardPage /></Page> },
      { path: "/automation", element: <Page><AutomationPage /></Page> },
      { path: "/protocol", element: <Page><ProtocolAdminPage /></Page> },
      { path: "/access", element: <Page><AccessControlPage /></Page> },
      { path: "/observability", element: <Page><ObservabilityPage /></Page> },
    ],
  },
]);
