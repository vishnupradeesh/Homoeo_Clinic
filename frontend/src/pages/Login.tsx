import { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  Callout,
  Card,
  Elevation,
  FormGroup,
  H3,
  Icon,
  InputGroup,
  TextArea,
} from "@blueprintjs/core";

import { useAuth } from "../auth/AuthContext";
import { getAuthProviders, register } from "../services/api";
import PatientMembership from "./PatientMembership";


export type LoginMode = "login" | "choose" | "doctor" | "patient";

interface Props {
  initialMode?: LoginMode;
  onModeChange?: (mode: LoginMode) => void;
}

const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;
const BUNDLED_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme: string; size: string; width: number }
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}


export default function Login({ initialMode = "login", onModeChange }: Props) {

  const { login, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<LoginMode>(initialMode);

  // Shared / login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Doctor membership fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [interview, setInterview] = useState("");
  // Track whether the user has manually edited the username.
  const [usernameTouched, setUsernameTouched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const preserveInfoOnRouteRef = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState(
    BUNDLED_GOOGLE_CLIENT_ID
  );

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  function switchMode(next: LoginMode) {
    resetMessages();
    setMode(next);
    onModeChange?.(next);
  }

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    if (preserveInfoOnRouteRef.current) {
      preserveInfoOnRouteRef.current = false;
    } else {
      setInfo(null);
    }
  }, [initialMode]);

  useEffect(() => {
    if (BUNDLED_GOOGLE_CLIENT_ID) {
      return;
    }

    let active = true;

    getAuthProviders()
      .then((providers) => {
        if (active && providers.google.enabled && providers.google.client_id) {
          setGoogleClientId(providers.google.client_id);
        }
      })
      .catch(() => {
        // Password login remains available when optional provider discovery
        // cannot reach the backend.
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    resetMessages();
    setSubmitting(true);

    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }, [loginWithGoogle]);

  useEffect(() => {
    if (mode !== "login" || !googleClientId || !googleButtonRef.current) {
      return;
    }

    let active = true;
    const googleScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    function renderGoogleButton() {
      if (!active || !window.google || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void handleGoogleCredential(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 316,
      });
    }

    if (window.google) {
      renderGoogleButton();
    } else {
      googleScript?.addEventListener("load", renderGoogleButton);
    }

    return () => {
      active = false;
      googleScript?.removeEventListener("load", renderGoogleButton);
    };
  }, [mode, googleClientId, handleGoogleCredential]);

  function handlePhoneChange(value: string) {
    setPhone(value);
    // Couple the username to the phone number unless it was edited manually.
    if (!usernameTouched) {
      setUsername(value.replace(/[^0-9]/g, ""));
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    resetMessages();
    setSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    resetMessages();

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!PHONE_PATTERN.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!username.trim()) {
      setError("Please choose a username.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (!license.trim()) {
      setError("A medical license number is required for doctors.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({
        full_name: fullName.trim(),
        phone: phone.trim(),
        username: username.trim(),
        password,
        role: "DOCTOR",
        license_number: license.trim(),
        interview: interview.trim() || undefined,
      });

      preserveInfoOnRouteRef.current = true;
      setInfo(result.message);
      setMode("login");
      onModeChange?.("login");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const passwordField = (
    <FormGroup className="login-field" label="Password" labelInfo="Required">
      <InputGroup
        className="login-input"
        leftIcon="lock"
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        large
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <Button
            className="login-visibility-toggle"
            minimal
            icon={showPassword ? "eye-off" : "eye-open"}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          />
        }
      />
    </FormGroup>
  );

  const modeCopy = {
    login: {
      overline: "SECURE CARE PORTAL",
      title: "Welcome back",
      tagline: "Sign in to continue your care journey.",
    },
    choose: {
      overline: "JOIN AROKYA",
      title: "Choose your journey",
      tagline: "Tell us how you would like to experience Arokya.",
    },
    doctor: {
      overline: "DOCTOR MEMBERSHIP",
      title: "Grow with Arokya",
      tagline: "Share your details to join our care team.",
    },
    patient: {
      overline: "PATIENT MEMBERSHIP",
      title: "Begin your care journey",
      tagline: "Create your secure patient profile.",
    },
  }[mode];

  if (mode === "patient") {
    return <PatientMembership onBackToLogin={() => switchMode("login")} />;
  }

  return (
    <div className="login-screen">
      <span className="login-ambient login-ambient-one" aria-hidden="true" />
      <span className="login-ambient login-ambient-two" aria-hidden="true" />

      <div className={`login-shell ${mode === "doctor" ? "login-shell-wide" : ""}`}>
        <aside className="login-story" aria-label="About Arokya Homoeo Clinic">
          <div className="login-story-shine" aria-hidden="true" />

          <div className="login-story-brand">
            <span className="login-story-logo">
              <img src="/logo.png" alt="" />
            </span>
            <span>
              <strong>Arokya Homoeo Clinic</strong>
              <small>Advanced multispeciality homoeopathy</small>
            </span>
          </div>

          <div className="login-story-copy">
            <span className="login-story-eyebrow">
              <Icon icon="heart" size={13} /> PERSON-CENTRED CARE
            </span>
            <h1>
              Care that sees the <em>whole you.</em>
            </h1>
            <p>
              Personalised homoeopathic care, trusted specialists, and every
              part of your wellness journey together in one secure place.
            </p>

            <div className="login-story-features" aria-label="Portal features">
              <span><Icon icon="calendar" size={15} /> Easy appointments</span>
              <span><Icon icon="shield" size={15} /> Private &amp; secure</span>
              <span><Icon icon="people" size={15} /> Family-friendly care</span>
            </div>
          </div>

          <div className="login-story-proof">
            <div className="login-proof-avatars" aria-hidden="true">
              <span>A</span>
              <span>S</span>
              <span>R</span>
            </div>
            <div>
              <div className="login-proof-stars" aria-label="4.8 out of 5 stars">
                ★★★★★
              </div>
              <strong>Trusted by 25,000+ patients</strong>
              <small>Compassionate care for every generation</small>
            </div>
          </div>
        </aside>

      <Card
        elevation={Elevation.THREE}
        className={mode === "doctor" ? "login-card login-card-wide" : "login-card"}
      >

        <div className="login-brand">
          <div className="login-logo">
            <Icon icon="heart" size={28} />
          </div>
          <span className="login-overline">{modeCopy.overline}</span>
          <H3>{modeCopy.title}</H3>
          <p className="login-tagline">{modeCopy.tagline}</p>
        </div>

        {error && (
          <Callout intent="danger" icon="error" className="login-error">
            {error}
          </Callout>
        )}

        {info && (
          <Callout intent="success" icon="tick-circle" className="login-error">
            {info}
          </Callout>
        )}

        {mode === "login" && (

          <form onSubmit={handleLogin} noValidate>

            <FormGroup className="login-field" label="Username or mobile number">
              <InputGroup
                className="login-input"
                leftIcon="user"
                placeholder="Enter your username or mobile number"
                value={username}
                autoComplete="username"
                autoFocus
                large
                onChange={(e) => {
                  setUsernameTouched(true);
                  setUsername(e.target.value);
                }}
              />
            </FormGroup>

            {passwordField}

            <Button
              type="submit"
              className="login-primary-action"
              intent="primary"
              icon="log-in"
              text="Sign in securely"
              fill
              large
              loading={submitting}
              disabled={!username || !password}
            />

            <div className="login-switch">
              <span>New to Arokya?</span>
              <Button
                className="login-membership-action"
                minimal
                intent="primary"
                icon="add"
                text="Create a membership"
                onClick={() => switchMode("choose")}
              />
            </div>

          </form>

        )}

        {mode === "login" && googleClientId && (
          <div className="google-signin-section">
            <div className="google-signin-divider">
              <span>or continue with</span>
            </div>
            <div
              ref={googleButtonRef}
              className="google-signin-button"
              aria-label="Sign in with Google"
            />
          </div>
        )}

        {mode === "login" && (
          <div className="login-trust-row" aria-label="Clinic benefits">
            <span className="login-trust-item">
              <Icon icon="shield" size={14} /> Privacy first
            </span>
            <span className="login-trust-item">
              <Icon icon="heart" size={14} /> Personal care
            </span>
            <span className="login-trust-item">
              <Icon icon="lock" size={14} /> Secure portal
            </span>
          </div>
        )}

        {mode === "choose" && (
          <div className="choose-roles">
            <Button
              className="login-role-button login-role-patient"
              large
              fill
              icon="person"
              intent="primary"
              text="I'm a Patient"
              onClick={() => switchMode("patient")}
            />
            <Button
              className="login-role-button login-role-doctor"
              large
              fill
              icon="badge"
              text="I'm a Doctor"
              onClick={() => switchMode("doctor")}
            />
            <div className="login-switch">
              <Button
                minimal
                intent="primary"
                icon="log-in"
                text="Back to Sign In"
                onClick={() => switchMode("login")}
              />
            </div>
          </div>
        )}

        {mode === "doctor" && (

          <form onSubmit={handleRegister} noValidate>

            <FormGroup className="login-field" label="Full name" labelInfo="Required">
              <InputGroup
                className="login-input"
                leftIcon="person"
                placeholder="Your full name"
                value={fullName}
                autoComplete="name"
                large
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              className="login-field"
              label="Phone number"
              labelInfo="Required"
              helperText="Your username is linked to your phone number."
            >
              <InputGroup
                className="login-input"
                leftIcon="phone"
                placeholder="Contact number"
                value={phone}
                autoComplete="tel"
                large
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </FormGroup>

            <FormGroup className="login-field" label="Username" labelInfo="Required">
              <InputGroup
                className="login-input"
                leftIcon="user"
                placeholder="Unique username"
                value={username}
                autoComplete="username"
                large
                onChange={(e) => {
                  setUsernameTouched(true);
                  setUsername(e.target.value);
                }}
              />
            </FormGroup>

            {passwordField}

            <FormGroup className="login-field" label="Medical license number" labelInfo="Required">
              <InputGroup
                className="login-input"
                leftIcon="id-number"
                placeholder="License / registration number"
                value={license}
                large
                onChange={(e) => setLicense(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              className="login-field"
              label="Professional introduction"
              helperText="Tell us about your specialization and experience."
            >
              <TextArea
                fill
                rows={4}
                placeholder="Years of experience, specialization, and why you want to join."
                value={interview}
                onChange={(e) => setInterview(e.target.value)}
              />
            </FormGroup>

            <Callout intent="warning" icon="info-sign" className="login-error">
              Doctor accounts require administrator approval before sign in.
            </Callout>

            <Button
              type="submit"
              className="login-primary-action"
              intent="primary"
              text="Create Membership"
              fill
              large
              loading={submitting}
            />

            <div className="login-switch">
              <span>Already a member?</span>
              <Button
                minimal
                intent="primary"
                icon="log-in"
                text="Back to Sign In"
                onClick={() => switchMode("login")}
              />
            </div>

          </form>

        )}

      </Card>
      </div>
    </div>
  );
}
