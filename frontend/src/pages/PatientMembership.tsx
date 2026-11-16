import { useMemo, useState } from "react";

import {
  Button,
  Callout,
  Card,
  Elevation,
  FormGroup,
  H3,
  H4,
  HTMLSelect,
  Icon,
  InputGroup,
  ProgressBar,
  TextArea,
} from "@blueprintjs/core";

import { notifyEmail, notifySms, registerPatient } from "../services/api";


interface Props {
  onBackToLogin: () => void;
}


interface WizardState {
  // Step 1
  name: string;
  parentName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  occupation: string;
  maritalStatus: string;
  bloodGroup: string;
  // Step 2
  currentHealthIssues: string;
  // Step 3
  pastMedications: string;
  pastTreatments: string;
  surgeries: string;
  // Step 4
  temperament: string;
  appetite: string;
  thirst: string;
  sleep: string;
  reactionToStress: string;
  likesDislikes: string;
  // Step 5
  username: string;
  password: string;
  confirmPassword: string;
}

const INITIAL: WizardState = {
  name: "",
  parentName: "",
  birthDate: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  latitude: null,
  longitude: null,
  occupation: "",
  maritalStatus: "",
  bloodGroup: "",
  currentHealthIssues: "",
  pastMedications: "",
  pastTreatments: "",
  surgeries: "",
  temperament: "",
  appetite: "",
  thirst: "",
  sleep: "",
  reactionToStress: "",
  likesDislikes: "",
  username: "",
  password: "",
  confirmPassword: "",
};

const STEP_TITLES = [
  "Basic Details",
  "Current Health Issues",
  "Previous History",
  "Patient Character",
  "Account Credentials",
  "Review & Report",
];

const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function buildPreviousHistory(s: WizardState): string {
  const parts: string[] = [];
  if (s.pastMedications.trim()) parts.push(`Medications/Pills: ${s.pastMedications.trim()}`);
  if (s.pastTreatments.trim()) parts.push(`Treatments: ${s.pastTreatments.trim()}`);
  if (s.surgeries.trim()) parts.push(`Surgeries: ${s.surgeries.trim()}`);
  return parts.join("\n");
}

function buildCharacterNotes(s: WizardState): string {
  const parts: string[] = [];
  if (s.temperament) parts.push(`Temperament: ${s.temperament}`);
  if (s.appetite) parts.push(`Appetite: ${s.appetite}`);
  if (s.thirst) parts.push(`Thirst: ${s.thirst}`);
  if (s.sleep) parts.push(`Sleep: ${s.sleep}`);
  if (s.reactionToStress.trim()) parts.push(`Reaction to stress: ${s.reactionToStress.trim()}`);
  if (s.likesDislikes.trim()) parts.push(`Likes/Dislikes: ${s.likesDislikes.trim()}`);
  return parts.join("\n");
}


export default function PatientMembership({ onBackToLogin }: Props) {

  const [step, setStep] = useState(0);
  const [s, setS] = useState<WizardState>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhone(value: string) {
    setS((prev) => ({
      ...prev,
      phone: value,
      // Suggest a username from the phone digits until the user sets one.
      username: prev.username || value.replace(/[^0-9]/g, ""),
    }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", Number(pos.coords.latitude.toFixed(6)));
        set("longitude", Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => {
        setError("Unable to fetch your location. Please enter the address manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const mapUrl = useMemo(() => {
    if (s.latitude === null || s.longitude === null) return null;
    const d = 0.01;
    const bbox = [
      s.longitude - d,
      s.latitude - d,
      s.longitude + d,
      s.latitude + d,
    ].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${s.latitude}%2C${s.longitude}`;
  }, [s.latitude, s.longitude]);

  function validateStep(): string | null {
    if (step === 0) {
      if (!s.name.trim()) return "Please enter the patient's name.";
      if (!s.birthDate) return "Please enter the birth date.";
      if (!s.gender) return "Please select a gender.";
      if (!PHONE_PATTERN.test(s.phone.trim())) return "Please enter a valid phone number.";
      if (s.email.trim() && !EMAIL_PATTERN.test(s.email.trim())) {
        return "Please enter a valid email address or leave it blank.";
      }
    }
    if (step === 4) {
      if (!s.username.trim()) return "Please choose a username.";
      if (s.password.length < 4) return "Password must be at least 4 characters.";
      if (s.password !== s.confirmPassword) return "Passwords do not match.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((v) => Math.min(v + 1, STEP_TITLES.length - 1));
  }

  function back() {
    setError(null);
    setStep((v) => Math.max(v - 1, 0));
  }

  async function handleCreate() {
    setError(null);
    setSubmitting(true);

    try {
      await registerPatient({
        username: s.username.trim(),
        password: s.password,
        name: s.name.trim(),
        parent_name: s.parentName.trim() || undefined,
        birth_date: s.birthDate || undefined,
        gender: s.gender || undefined,
        phone: s.phone.trim(),
        email: s.email.trim() || undefined,
        address: s.address.trim() || undefined,
        latitude: s.latitude ?? undefined,
        longitude: s.longitude ?? undefined,
        occupation: s.occupation.trim() || undefined,
        marital_status: s.maritalStatus || undefined,
        blood_group: s.bloodGroup || undefined,
        current_health_issues: s.currentHealthIssues.trim() || undefined,
        previous_history: buildPreviousHistory(s) || undefined,
        character_notes: buildCharacterNotes(s) || undefined,
      });

      setCreated(true);
      setNotice("Membership created successfully. Share the credentials below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function credentialsMessage(): string {
    return (
      `Arokya Homoeo Clinic - Membership Credentials\n\n` +
      `Dear ${s.name},\n\n` +
      `Your patient account has been created.\n` +
      `Username: ${s.username}\n` +
      `Password: ${s.password}\n\n` +
      `You can sign in with your username or your mobile number (${s.phone}).\n\n` +
      `Regards,\nArokya Homoeo Clinic`
    );
  }

  function openReport() {
    const html = reportHtml(s);
    const win = window.open("", "_blank", "width=820,height=900");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  async function sendOverMail() {
    setNotice(null);
    setError(null);
    try {
      const res = await notifyEmail(
        s.email.trim(),
        "Your Arokya Homoeo Clinic membership credentials",
        credentialsMessage()
      );
      setNotice(
        res.simulated
          ? `${res.detail} (Email delivery is not configured on the server.)`
          : res.detail
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    }
  }

  function sendOverWhatsApp() {
    const digits = s.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(credentialsMessage())}`;
    window.open(url, "_blank");
    setNotice("WhatsApp opened with the credentials message.");
  }

  async function sendOverSms() {
    setNotice(null);
    setError(null);
    try {
      const res = await notifySms(s.phone.trim(), credentialsMessage());
      setNotice(
        res.simulated
          ? `${res.detail} (SMS delivery is not configured on the server.)`
          : res.detail
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SMS");
    }
  }

  return (
    <div className="wizard-screen">
      <span className="wizard-ambient wizard-ambient-one" aria-hidden="true" />
      <span className="wizard-ambient wizard-ambient-two" aria-hidden="true" />
      <Card elevation={Elevation.THREE} className="wizard-card">

        <div className="wizard-header">
          <div className="login-logo">
            <Icon icon="heart" size={24} />
          </div>
          <div>
            <H3>Patient Membership</H3>
            <p className="login-tagline">
              Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
            </p>
          </div>
        </div>

        <ProgressBar
          value={(step + 1) / STEP_TITLES.length}
          intent="primary"
          stripes={false}
          animate={false}
          className="wizard-progress"
        />

        {error && (
          <Callout intent="danger" icon="error" className="login-error">
            {error}
          </Callout>
        )}

        {notice && (
          <Callout intent="success" icon="tick-circle" className="login-error">
            {notice}
          </Callout>
        )}

        <div className="wizard-body">

          {step === 0 && (
            <>
              <div className="form-row">
                <FormGroup label="Full Name" labelInfo="(required)">
                  <InputGroup
                    leftIcon="person"
                    value={s.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Parent / Guardian Name">
                  <InputGroup
                    value={s.parentName}
                    onChange={(e) => set("parentName", e.target.value)}
                  />
                </FormGroup>
              </div>

              <div className="form-row">
                <FormGroup label="Birth Date" labelInfo="(required)">
                  <InputGroup
                    type="date"
                    value={s.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Gender" labelInfo="(required)">
                  <HTMLSelect
                    fill
                    value={s.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </HTMLSelect>
                </FormGroup>
                <FormGroup label="Blood Group">
                  <HTMLSelect
                    fill
                    value={s.bloodGroup}
                    onChange={(e) => set("bloodGroup", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </HTMLSelect>
                </FormGroup>
              </div>

              <div className="form-row">
                <FormGroup label="Phone Number" labelInfo="(required)">
                  <InputGroup
                    leftIcon="phone"
                    value={s.phone}
                    onChange={(e) => handlePhone(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Email" labelInfo="(optional)">
                  <InputGroup
                    leftIcon="envelope"
                    type="email"
                    value={s.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </FormGroup>
              </div>

              <div className="form-row">
                <FormGroup label="Occupation">
                  <InputGroup
                    leftIcon="briefcase"
                    value={s.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Marital Status">
                  <HTMLSelect
                    fill
                    value={s.maritalStatus}
                    onChange={(e) => set("maritalStatus", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Other</option>
                  </HTMLSelect>
                </FormGroup>
              </div>

              <FormGroup label="Address">
                <TextArea
                  fill
                  rows={2}
                  value={s.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </FormGroup>

              <div className="map-block">
                <Button
                  icon="map-marker"
                  text="Use my current location"
                  onClick={useMyLocation}
                  loading={locating}
                />
                {s.latitude !== null && s.longitude !== null && (
                  <span className="map-coords">
                    {s.latitude}, {s.longitude}
                  </span>
                )}
                {mapUrl && (
                  <iframe
                    title="Location map"
                    className="map-frame"
                    src={mapUrl}
                  />
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <FormGroup
              label="Describe the current health issues"
              helperText="Symptoms, duration, severity, and anything the doctor should know."
            >
              <TextArea
                fill
                rows={8}
                value={s.currentHealthIssues}
                onChange={(e) => set("currentHealthIssues", e.target.value)}
              />
            </FormGroup>
          )}

          {step === 2 && (
            <>
              <FormGroup label="Past Medications / Pills">
                <TextArea
                  fill
                  rows={4}
                  value={s.pastMedications}
                  onChange={(e) => set("pastMedications", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Past Treatments">
                <TextArea
                  fill
                  rows={4}
                  value={s.pastTreatments}
                  onChange={(e) => set("pastTreatments", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Surgeries">
                <TextArea
                  fill
                  rows={4}
                  value={s.surgeries}
                  onChange={(e) => set("surgeries", e.target.value)}
                />
              </FormGroup>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-row">
                <FormGroup label="Temperament">
                  <HTMLSelect
                    fill
                    value={s.temperament}
                    onChange={(e) => set("temperament", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Calm</option>
                    <option>Irritable</option>
                    <option>Anxious</option>
                    <option>Cheerful</option>
                    <option>Reserved</option>
                  </HTMLSelect>
                </FormGroup>
                <FormGroup label="Appetite">
                  <HTMLSelect
                    fill
                    value={s.appetite}
                    onChange={(e) => set("appetite", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Good</option>
                    <option>Moderate</option>
                    <option>Poor</option>
                  </HTMLSelect>
                </FormGroup>
              </div>
              <div className="form-row">
                <FormGroup label="Thirst">
                  <HTMLSelect
                    fill
                    value={s.thirst}
                    onChange={(e) => set("thirst", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </HTMLSelect>
                </FormGroup>
                <FormGroup label="Sleep">
                  <HTMLSelect
                    fill
                    value={s.sleep}
                    onChange={(e) => set("sleep", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Sound</option>
                    <option>Disturbed</option>
                    <option>Insomnia</option>
                  </HTMLSelect>
                </FormGroup>
              </div>
              <FormGroup label="Reaction to stress">
                <TextArea
                  fill
                  rows={3}
                  value={s.reactionToStress}
                  onChange={(e) => set("reactionToStress", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Likes & Dislikes (food, weather, etc.)">
                <TextArea
                  fill
                  rows={3}
                  value={s.likesDislikes}
                  onChange={(e) => set("likesDislikes", e.target.value)}
                />
              </FormGroup>
            </>
          )}

          {step === 4 && (
            <>
              <FormGroup
                label="Username"
                labelInfo="(required)"
                helperText="Suggested from your phone number; you may change it."
              >
                <InputGroup
                  leftIcon="user"
                  value={s.username}
                  onChange={(e) => set("username", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Password" labelInfo="(required)">
                <InputGroup
                  leftIcon="lock"
                  type="password"
                  value={s.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Confirm Password" labelInfo="(required)">
                <InputGroup
                  leftIcon="lock"
                  type="password"
                  value={s.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                />
              </FormGroup>
            </>
          )}

          {step === 5 && (
            <div className="report-preview">
              <H4>Membership Summary</H4>
              <SummaryRow label="Name" value={s.name} />
              <SummaryRow label="Parent / Guardian" value={s.parentName} />
              <SummaryRow label="Birth Date" value={s.birthDate} />
              <SummaryRow label="Gender" value={s.gender} />
              <SummaryRow label="Phone" value={s.phone} />
              <SummaryRow label="Email" value={s.email || "—"} />
              <SummaryRow label="Occupation" value={s.occupation} />
              <SummaryRow
                label="Location"
                value={
                  s.latitude !== null
                    ? `${s.latitude}, ${s.longitude}`
                    : s.address || "—"
                }
              />
              <SummaryRow label="Current Issues" value={s.currentHealthIssues} />
              <SummaryRow label="Previous History" value={buildPreviousHistory(s)} />
              <SummaryRow label="Character" value={buildCharacterNotes(s)} />
              <SummaryRow label="Username" value={s.username} />

              {!created ? (
                <Button
                  intent="success"
                  icon="tick"
                  text="Confirm & Create Membership"
                  large
                  loading={submitting}
                  onClick={handleCreate}
                  className="wizard-confirm"
                />
              ) : (
                <div className="report-actions">
                  <Button icon="document-open" text="Preview Report" onClick={openReport} />
                  {s.email.trim() ? (
                    <Button icon="envelope" intent="primary" text="Send over Mail" onClick={sendOverMail} />
                  ) : (
                    <Button icon="chat" intent="success" text="Send over WhatsApp" onClick={sendOverWhatsApp} />
                  )}
                  <Button icon="mobile-phone" text="Send over SMS" onClick={sendOverSms} />
                  <Button icon="log-in" text="Proceed to Login" onClick={onBackToLogin} />
                </div>
              )}
            </div>
          )}

        </div>

        {!created && (
          <div className="wizard-nav">
            <Button
              icon="chevron-left"
              text="Back"
              onClick={back}
              disabled={step === 0}
            />
            <Button minimal text="Cancel" onClick={onBackToLogin} />
            {step < STEP_TITLES.length - 1 ? (
              <Button
                rightIcon="chevron-right"
                intent="primary"
                text="Next"
                onClick={next}
              />
            ) : (
              <span />
            )}
          </div>
        )}

      </Card>
    </div>
  );
}


function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value || "—"}</span>
    </div>
  );
}


function reportHtml(s: WizardState): string {
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string) =>
    `<tr><th>${esc(label)}</th><td>${esc(value || "—").replace(/\n/g, "<br/>")}</td></tr>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Patient Report - ${esc(s.name)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #1e293b; margin: 40px; }
  .head { text-align: center; border-bottom: 3px solid #2d9c8f; padding-bottom: 16px; margin-bottom: 24px; }
  .head h1 { margin: 0; color: #158172; }
  .head p { margin: 4px 0 0; color: #64748b; }
  h2 { color: #158172; font-size: 16px; margin: 24px 0 8px; border-left: 4px solid #8b5cf6; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { width: 220px; color: #475569; font-weight: 600; }
  .foot { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  @media print { button { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <h1>Arokya Homoeo Clinic</h1>
    <p>Patient Membership Report</p>
  </div>

  <h2>Basic Details</h2>
  <table>
    ${row("Name", s.name)}
    ${row("Parent / Guardian", s.parentName)}
    ${row("Birth Date", s.birthDate)}
    ${row("Gender", s.gender)}
    ${row("Blood Group", s.bloodGroup)}
    ${row("Phone", s.phone)}
    ${row("Email", s.email)}
    ${row("Occupation", s.occupation)}
    ${row("Marital Status", s.maritalStatus)}
    ${row("Address", s.address)}
    ${row("Location", s.latitude !== null ? `${s.latitude}, ${s.longitude}` : "")}
  </table>

  <h2>Current Health Issues</h2>
  <table>${row("Details", s.currentHealthIssues)}</table>

  <h2>Previous History</h2>
  <table>
    ${row("Medications / Pills", s.pastMedications)}
    ${row("Treatments", s.pastTreatments)}
    ${row("Surgeries", s.surgeries)}
  </table>

  <h2>Patient Character</h2>
  <table>
    ${row("Temperament", s.temperament)}
    ${row("Appetite", s.appetite)}
    ${row("Thirst", s.thirst)}
    ${row("Sleep", s.sleep)}
    ${row("Reaction to stress", s.reactionToStress)}
    ${row("Likes / Dislikes", s.likesDislikes)}
  </table>

  <div class="foot">
    Generated on ${new Date().toLocaleString()} — Arokya Homoeo Clinic
  </div>

  <p style="text-align:center;margin-top:24px;">
    <button onclick="window.print()">Print / Save as PDF</button>
  </p>
</body>
</html>`;
}
