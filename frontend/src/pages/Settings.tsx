import { useEffect, useState } from "react";

import {
  Button,
  Callout,
  Card,
  Elevation,
  FormGroup,
  H2,
  HTMLSelect,
  HTMLTable,
  Icon,
  InputGroup,
  Spinner,
  Tag,
} from "@blueprintjs/core";

import {
  approveUser,
  createUser,
  deleteUser,
  getUsers,
  type AuthUser,
  type Role,
} from "../services/api";
import { useAuth } from "../auth/AuthContext";


const ROLE_OPTIONS: Role[] = ["ADMIN", "DOCTOR", "PATIENT"];

const ROLE_INTENT: Record<Role, "danger" | "primary" | "success"> = {
  ADMIN: "danger",
  DOCTOR: "primary",
  PATIENT: "success",
};


export default function Settings() {

  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PATIENT");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || password.length < 4) {
      setError("Enter a username and a password of at least 4 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await createUser({
        username: username.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        full_name: fullName.trim() || undefined,
      });
      setSuccess(`User "${username.trim()}" created as ${role}.`);
      setFullName("");
      setPhone("");
      setUsername("");
      setPassword("");
      setRole("PATIENT");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: number) {
    setError(null);
    setSuccess(null);

    try {
      await approveUser(id);
      setSuccess("Account approved.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user");
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    setSuccess(null);

    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div className="dashboard">

      <div className="hero hero-settings">
        <div className="hero-content">
          <H2>Roles &amp; Access</H2>
          <p className="hero-subtitle">
            Create user accounts and assign roles. Only administrators can
            manage users.
          </p>
        </div>
        <div className="hero-badge">
          <Icon icon="shield" size={28} />
        </div>
      </div>

      <Card elevation={Elevation.TWO} className="contact-card">
        <h3>Create User</h3>

        {error && (
          <Callout intent="danger" icon="error" className="form-error">
            {error}
          </Callout>
        )}

        {success && (
          <Callout intent="success" icon="tick-circle" className="form-error">
            {success}
          </Callout>
        )}

        <form onSubmit={handleCreate} noValidate>
          <div className="form-row">
            <FormGroup label="Full Name">
              <InputGroup
                leftIcon="person"
                placeholder="e.g. Dr. Anand"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Phone">
              <InputGroup
                leftIcon="phone"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Username" labelInfo="(required)">
              <InputGroup
                leftIcon="user"
                placeholder="e.g. dr.anand"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Password" labelInfo="(required)">
              <InputGroup
                leftIcon="lock"
                type="password"
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Role">
              <HTMLSelect
                fill
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                options={ROLE_OPTIONS}
              />
            </FormGroup>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              icon="new-person"
              intent="primary"
              text="Create User"
              loading={submitting}
            />
          </div>
        </form>
      </Card>

      <Card elevation={Elevation.ONE} className="contact-card">
        <h3>Existing Users</h3>

        {loading ? (
          <Spinner />
        ) : (
          <HTMLTable striped className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || "\u2014"}</td>
                  <td>{u.username}</td>
                  <td>{u.phone || "\u2014"}</td>
                  <td>
                    <Tag intent={ROLE_INTENT[u.role]} minimal round>
                      {u.role}
                    </Tag>
                  </td>
                  <td>
                    <Tag
                      intent={u.status === "ACTIVE" ? "success" : "warning"}
                      minimal
                      round
                    >
                      {u.status}
                    </Tag>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="users-actions">
                    {u.status === "PENDING" && (
                      <Button
                        minimal
                        small
                        icon="tick"
                        intent="success"
                        title="Approve account"
                        onClick={() => handleApprove(u.id)}
                      />
                    )}
                    <Button
                      minimal
                      small
                      icon="trash"
                      intent="danger"
                      disabled={u.id === currentUser?.id}
                      title={
                        u.id === currentUser?.id
                          ? "You cannot delete your own account"
                          : "Delete user"
                      }
                      onClick={() => handleDelete(u.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        )}
      </Card>

    </div>
  );
}
