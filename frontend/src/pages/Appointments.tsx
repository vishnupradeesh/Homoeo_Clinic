import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Callout,
  Card,
  Checkbox,
  Elevation,
  FormGroup,
  H2,
  HTMLTable,
  Icon,
  InputGroup,
  NonIdealState,
  Spinner,
  TextArea,
} from "@blueprintjs/core";

import {
  createAppointment,
  deleteAppointments,
  getAppointments,
  getMyAppointments,
  type Appointment,
} from "../services/api";
import { useAuth } from "../auth/AuthContext";


interface FormState {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  date: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;


function AppointmentList({
  appointments,
  loading,
  showPatient,
  selection,
}: {
  appointments: Appointment[];
  loading: boolean;
  showPatient: boolean;
  selection?: {
    selectedIds: Set<number>;
    allSelected: boolean;
    someSelected: boolean;
    onToggleAll: (checked: boolean) => void;
    onToggle: (appointmentId: number, checked: boolean) => void;
  };
}) {

  if (loading) {
    return <Spinner />;
  }

  if (appointments.length === 0) {
    return (
      <NonIdealState
        icon="calendar"
        title="No appointments yet"
        description="Appointment requests will appear here."
      />
    );
  }

  return (
    <HTMLTable striped className="users-table">
      <thead>
        <tr>
          {selection && (
            <th className="record-select-cell">
              <Checkbox
                className="record-checkbox"
                aria-label="Select all appointments"
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                onChange={(event) =>
                  selection.onToggleAll(
                    (event.target as HTMLInputElement).checked
                  )
                }
              />
            </th>
          )}
          {showPatient && <th>Patient</th>}
          <th>Email</th>
          <th>Phone</th>
          <th>Preferred Date</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => (
          <tr
            key={a.id}
            className={
              selection?.selectedIds.has(a.id) ? "record-row-selected" : undefined
            }
          >
            {selection && (
              <td className="record-select-cell">
                <Checkbox
                  className="record-checkbox"
                  aria-label={`Select appointment for ${a.name}`}
                  checked={selection.selectedIds.has(a.id)}
                  onChange={(event) =>
                    selection.onToggle(
                      a.id,
                      (event.target as HTMLInputElement).checked
                    )
                  }
                />
              </td>
            )}
            {showPatient && <td>{a.name}</td>}
            <td>{a.email}</td>
            <td>{a.phone}</td>
            <td>{a.preferred_date}</td>
            <td>{a.message || "\u2014"}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
}


export default function Appointments() {

  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const isAdmin = user?.role === "ADMIN";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadAppointments() {
    try {
      setLoadingList(true);
      setListError(null);
      const data = isPatient
        ? await getMyAppointments()
        : await getAppointments();
      setAppointments(data);
      setSelectedIds(new Set());
    } catch (err) {
      setAppointments([]);
      setListError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPatient]);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};

    if (!form.name.trim()) {
      next.name = "Please enter your name.";
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (!PHONE_PATTERN.test(form.phone.trim())) {
      next.phone = "Please enter a valid phone number.";
    }

    if (!form.date) {
      next.date = "Please choose a preferred date.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createAppointment({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        preferred_date: form.date,
        message: form.message.trim() || undefined,
      });

      setSubmitted(true);
      await loadAppointments();
    } catch {
      setSubmitError(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  }

  const allAppointmentsSelected =
    appointments.length > 0 && selectedIds.size === appointments.length;
  const someAppointmentsSelected =
    selectedIds.size > 0 && !allAppointmentsSelected;

  function toggleAppointment(appointmentId: number, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(appointmentId);
      else next.delete(appointmentId);
      return next;
    });
  }

  function toggleAllAppointments(checked: boolean) {
    setSelectedIds(
      checked
        ? new Set(appointments.map((appointment) => appointment.id))
        : new Set()
    );
  }

  async function handleDeleteSelected() {
    const appointmentIds = Array.from(selectedIds);
    if (!isAdmin || appointmentIds.length === 0) return;

    try {
      setDeleting(true);
      setListError(null);
      await deleteAppointments(appointmentIds);
      setAppointments((current) =>
        current.filter((appointment) => !selectedIds.has(appointment.id))
      );
      setSelectedIds(new Set());
      setDeleteOpen(false);
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to delete appointments"
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  // Doctor / Admin view: read-only list of all appointments.
  if (!isPatient) {
    return (
      <div className="dashboard">
        <div className="hero hero-appointment">
          <div className="hero-content">
            <H2>Appointments</H2>
            <p className="hero-subtitle">
              All appointment requests submitted by patients.
            </p>
          </div>
          <div className="hero-badge">
            <Icon icon="calendar" size={28} />
          </div>
        </div>

        <Card elevation={Elevation.TWO} className="contact-card">
          {listError && (
            <Callout intent="danger" icon="error" className="form-error">
              {listError}
            </Callout>
          )}
          {isAdmin && !loadingList && appointments.length > 0 && (
            <div className="record-bulk-toolbar">
              <span className="record-selection-copy">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : "Select appointments using the checkboxes"}
              </span>
              <Button
                icon="trash"
                intent="danger"
                text="Delete selected"
                disabled={selectedIds.size === 0}
                onClick={() => setDeleteOpen(true)}
              />
            </div>
          )}
          <AppointmentList
            appointments={appointments}
            loading={loadingList}
            showPatient
            selection={
              isAdmin
                ? {
                    selectedIds,
                    allSelected: allAppointmentsSelected,
                    someSelected: someAppointmentsSelected,
                    onToggleAll: toggleAllAppointments,
                    onToggle: toggleAppointment,
                  }
                : undefined
            }
          />
        </Card>

        <Alert
          isOpen={deleteOpen}
          icon="trash"
          intent="danger"
          cancelButtonText="Cancel"
          confirmButtonText="Delete appointments"
          canEscapeKeyCancel
          canOutsideClickCancel
          loading={deleting}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteSelected}
        >
          <p>
            Permanently delete {selectedIds.size} selected appointment
            {selectedIds.size === 1 ? "" : "s"}? This cannot be undone.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="hero hero-appointment">
        <div className="hero-content">
          <H2>Book an Appointment</H2>
          <p className="hero-subtitle">
            Share your details and we will get back to you to confirm your visit.
          </p>
        </div>
        <div className="hero-badge">
          <Icon icon="calendar" size={28} />
        </div>
      </div>

      <Card elevation={Elevation.TWO} className="contact-card">

        {submitted ? (

          <Callout
            intent="success"
            icon="tick-circle"
            title="Appointment request received"
          >
            <p>
              Thank you, {form.name}. We have received your request and will
              contact you at {form.email} to confirm your appointment.
            </p>
            <Button
              text="Book another appointment"
              intent="primary"
              onClick={handleReset}
            />
          </Callout>

        ) : (

          <form onSubmit={handleSubmit} noValidate>

            {submitError && (
              <Callout intent="danger" icon="error" className="form-error">
                {submitError}
              </Callout>
            )}

            <div className="form-row">
              <FormGroup
                label="Full Name"
                labelInfo="(required)"
                intent={errors.name ? "danger" : "none"}
                helperText={errors.name}
              >
                <InputGroup
                  leftIcon="person"
                  placeholder="Your name"
                  value={form.name}
                  intent={errors.name ? "danger" : "none"}
                  onChange={(e) => update("name", e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label="Email"
                labelInfo="(required)"
                intent={errors.email ? "danger" : "none"}
                helperText={errors.email}
              >
                <InputGroup
                  leftIcon="envelope"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  intent={errors.email ? "danger" : "none"}
                  onChange={(e) => update("email", e.target.value)}
                />
              </FormGroup>
            </div>

            <div className="form-row">
              <FormGroup
                label="Phone"
                labelInfo="(required)"
                intent={errors.phone ? "danger" : "none"}
                helperText={errors.phone}
              >
                <InputGroup
                  leftIcon="phone"
                  placeholder="Contact number"
                  value={form.phone}
                  intent={errors.phone ? "danger" : "none"}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label="Preferred Date"
                labelInfo="(required)"
                intent={errors.date ? "danger" : "none"}
                helperText={errors.date}
              >
                <InputGroup
                  leftIcon="calendar"
                  type="date"
                  value={form.date}
                  intent={errors.date ? "danger" : "none"}
                  onChange={(e) => update("date", e.target.value)}
                />
              </FormGroup>
            </div>

            <FormGroup label="Message" labelInfo="(optional)">
              <TextArea
                fill
                rows={4}
                placeholder="Describe your concern or reason for the visit"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </FormGroup>

            <div className="form-actions">
              <Button
                type="submit"
                icon="tick"
                intent="primary"
                text="Request Appointment"
                large
                loading={submitting}
              />
              <Button
                type="button"
                icon="reset"
                text="Clear"
                onClick={handleReset}
                disabled={submitting}
              />
            </div>

          </form>

        )}

      </Card>

      <h3 className="section-heading">My Appointments</h3>

      <Card elevation={Elevation.ONE} className="contact-card">
        {listError && (
          <Callout intent="danger" icon="error" className="form-error">
            {listError}
          </Callout>
        )}
        <AppointmentList
          appointments={appointments}
          loading={loadingList}
          showPatient={false}
        />
      </Card>

    </div>
  );
}
