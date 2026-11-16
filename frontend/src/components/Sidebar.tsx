import { Button } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/core";

import { canAccess, type NavKey } from "../auth/AuthContext";
import type { Role } from "../services/api";


interface Props {
  collapsed: boolean;
  page: NavKey;
  role: Role;
  onNavigate: (page: NavKey) => void;
}

interface NavItem {
  key: NavKey;
  icon: IconName;
  label: string;
}

const MENU_ITEMS: NavItem[] = [
  { key: "home", icon: "home", label: "Home" },
  { key: "patients", icon: "people", label: "Patients" },
  { key: "appointments", icon: "calendar", label: "Appointments" },
  { key: "prescriptions", icon: "prescription", label: "Prescriptions" },
  { key: "tasks", icon: "tick", label: "Tasks" },
];

const SYSTEM_ITEMS: NavItem[] = [
  { key: "settings", icon: "cog", label: "Settings" },
];


export default function Sidebar({ collapsed, page, role, onNavigate }: Props) {

  const menu = MENU_ITEMS.filter((item) => canAccess(role, item.key));
  const system = SYSTEM_ITEMS.filter((item) => canAccess(role, item.key));

  function renderButton(item: NavItem) {
    return (
      <Button
        key={item.key}
        icon={item.icon}
        text={collapsed ? undefined : item.label}
        minimal
        className={page === item.key ? "active" : undefined}
        onClick={() => onNavigate(item.key)}
      />
    );
  }

  return (
    <nav className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-title">Menu</div>

      {menu.map(renderButton)}

      {system.length > 0 && (
        <>
          <div className="sidebar-title" style={{ marginTop: 16 }}>
            System
          </div>

          {system.map(renderButton)}
        </>
      )}
    </nav>
  );
}
