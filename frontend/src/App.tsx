import { useCallback, useEffect, useRef, useState } from "react";

import { Spinner } from "@blueprintjs/core";

import AppNavbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatWidget from "./components/ChatWidget";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Patients from "./pages/Patients";
import Placeholder from "./pages/Placeholder";
import Login, { type LoginMode } from "./pages/Login";
import LandingPage, { type PublicPage } from "./pages/LandingPage";

import { canAccess, useAuth, type NavKey } from "./auth/AuthContext";

import "@blueprintjs/core/lib/css/blueprint.css";
import "./styles.css";


const PUBLIC_PATHS: Record<PublicPage, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  consultants: "/consultants",
  events: "/events",
  contacts: "/contacts",
};

const LOGIN_PATHS: Record<LoginMode, string> = {
  login: "/login",
  choose: "/register",
  doctor: "/register/doctor",
  patient: "/register/patient",
};

const WORKSPACE_PATHS: Record<NavKey, string> = {
  home: "/dashboard",
  appointments: "/appointments",
  patients: "/patients",
  prescriptions: "/prescriptions",
  tasks: "/tasks",
  settings: "/settings",
};

const ROUTE_TITLES: Record<string, string> = {
  "/": "Arokya Homoeo Clinic",
  "/about": "About | Arokya Homoeo Clinic",
  "/services": "Services | Arokya Homoeo Clinic",
  "/consultants": "Consultants | Arokya Homoeo Clinic",
  "/events": "Events | Arokya Homoeo Clinic",
  "/contacts": "Contact | Arokya Homoeo Clinic",
  "/login": "Sign in | Arokya Homoeo Clinic",
  "/register": "Membership | Arokya Homoeo Clinic",
  "/register/doctor": "Doctor membership | Arokya Homoeo Clinic",
  "/register/patient": "Patient membership | Arokya Homoeo Clinic",
  "/dashboard": "Dashboard | Arokya Homoeo Clinic",
  "/appointments": "Appointments | Arokya Homoeo Clinic",
  "/patients": "Patients | Arokya Homoeo Clinic",
  "/prescriptions": "Prescriptions | Arokya Homoeo Clinic",
  "/tasks": "Tasks | Arokya Homoeo Clinic",
  "/settings": "Settings | Arokya Homoeo Clinic",
};


function normalizePath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}


function routeKey<T extends string>(
  routes: Record<T, string>,
  pathname: string
): T | null {
  const match = (Object.entries(routes) as [T, string][]).find(
    ([, path]) => path === pathname
  );
  return match?.[0] ?? null;
}


function useTrackpadBackGesture() {
  const gesture = useRef({ distance: 0, lastEventAt: 0, lockedUntil: 0 });

  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    function resetDistance() {
      gesture.current.distance = 0;
    }

    function handleWheel(event: WheelEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      // Keep native horizontal scrolling inside intentional carousels/tables,
      // and avoid navigating while somebody is interacting with a form field.
      if (
        target.closest(
          "input, textarea, select, [contenteditable='true'], [data-horizontal-scroll]"
        )
      ) {
        return;
      }

      const horizontal = Math.abs(event.deltaX);
      const vertical = Math.abs(event.deltaY);

      // Precision touchpads report pixel-based, horizontally dominant wheel
      // deltas. Ignore ordinary vertical scrolling and mouse-wheel events.
      if (
        event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
        horizontal < 4 ||
        horizontal <= vertical * 1.25
      ) {
        return;
      }

      const now = Date.now();
      if (now < gesture.current.lockedUntil) {
        event.preventDefault();
        return;
      }

      if (now - gesture.current.lastEventAt > 220) {
        gesture.current.distance = 0;
      }

      gesture.current.lastEventAt = now;
      gesture.current.distance += event.deltaX;
      event.preventDefault();

      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(resetDistance, 220);

      // A two-finger swipe to the right emits negative horizontal deltas.
      if (gesture.current.distance <= -150 && window.history.length > 1) {
        gesture.current.distance = 0;
        gesture.current.lockedUntil = now + 700;
        window.history.back();
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, []);
}


function App() {

  const { user, loading } = useAuth();

  useTrackpadBackGesture();

  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname)
  );

  const publicPage = routeKey(PUBLIC_PATHS, pathname);
  const loginMode = routeKey(LOGIN_PATHS, pathname);
  const workspacePage = routeKey(WORKSPACE_PATHS, pathname);
  const page = workspacePage ?? "home";

  const navigate = useCallback((destination: string, replace = false) => {
    const nextPath = normalizePath(destination);
    const currentPath = normalizePath(window.location.pathname);

    if (nextPath !== currentPath) {
      if (replace) {
        window.history.replaceState({}, "", nextPath);
      } else {
        window.history.pushState({}, "", nextPath);
      }
    }

    setPathname(nextPath);
  }, []);

  useEffect(() => {
    function handlePopState() {
      setPathname(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? "Arokya Homoeo Clinic";
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  // Keep private routes protected and role-aware while preserving useful URLs.
  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      if (!workspacePage || !canAccess(user.role, workspacePage)) {
        navigate(WORKSPACE_PATHS.home, true);
      }
      return;
    }

    if (workspacePage) {
      navigate(LOGIN_PATHS.login, true);
    } else if (!publicPage && !loginMode) {
      navigate(PUBLIC_PATHS.home, true);
    }
  }, [loading, loginMode, navigate, publicPage, user, workspacePage]);

  if (loading) {
    return (
      <div className="app-loading">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    const showLogin = loginMode !== null || workspacePage !== null;

    return (
      <div className={dark ? "bp5-dark app-root" : "app-root"}>
        {showLogin ? (
          <div className="auth-screen">
            <Login
              initialMode={loginMode ?? "login"}
              onModeChange={(mode) => navigate(LOGIN_PATHS[mode])}
            />
          </div>
        ) : (
          <LandingPage
            page={publicPage ?? "home"}
            onLogin={() => navigate(LOGIN_PATHS.login)}
            onNavigate={(nextPage) => navigate(PUBLIC_PATHS[nextPage])}
          />
        )}
        <ChatWidget />
      </div>
    );
  }

  function renderPage() {
    switch (page) {
      case "appointments":
        return <Appointments />;
      case "settings":
        return <Settings />;
      case "tasks":
        return <Tasks />;
      case "patients":
        return <Patients />;
      case "prescriptions":
        return (
          <Placeholder
            title="Prescriptions"
            subtitle="View and issue prescriptions."
            icon="prescription"
          />
        );
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className={dark ? "bp5-dark app-root" : "app-root"}>

      <AppNavbar
        dark={dark}
        onToggleDark={() => setDark((value) => !value)}
        onToggleSidebar={() => setCollapsed((value) => !value)}
      />

      <div className="app-layout">

        <Sidebar
          collapsed={collapsed}
          page={page}
          role={user.role}
          onNavigate={(nextPage) => navigate(WORKSPACE_PATHS[nextPage])}
        />

        <main className="workspace-main">
          {renderPage()}
        </main>

      </div>

      <ChatWidget />

    </div>
  );
}


export default App;
