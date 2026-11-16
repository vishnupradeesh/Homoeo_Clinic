import {
  Navbar,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
  Button,
  Tag,
  Alignment,
} from "@blueprintjs/core";

import { useAuth } from "../auth/AuthContext";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
}

export default function AppNavbar({ dark, onToggleDark, onToggleSidebar }: Props) {

  const { user, logout } = useAuth();

  return (
    <Navbar>
      <NavbarGroup align={Alignment.LEFT}>
        <Button
          icon="menu"
          minimal
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        />

        <NavbarDivider />

        <NavbarHeading>
          Arokya Homoeo Clinic
        </NavbarHeading>

        <NavbarDivider />
      </NavbarGroup>

      <NavbarGroup align={Alignment.RIGHT}>
        <Button
          icon={dark ? "flash" : "moon"}
          text={dark ? "Light" : "Dark"}
          minimal
          onClick={onToggleDark}
        />

        <NavbarDivider />

        {user && (
          <>
            <Button icon="user" text={user.username} minimal />
            <Tag minimal round className="role-tag">
              {user.role}
            </Tag>

            <NavbarDivider />

            <Button
              icon="log-out"
              text="Logout"
              minimal
              onClick={logout}
            />
          </>
        )}
      </NavbarGroup>
    </Navbar>
  );
}