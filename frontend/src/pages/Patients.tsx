import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Callout,
  Card,
  Checkbox,
  Drawer,
  DrawerSize,
  Elevation,
  H2,
  HTMLTable,
  Icon,
  InputGroup,
  Spinner,
  Tag,
} from "@blueprintjs/core";

import { useAuth } from "../auth/AuthContext";
import {
  deletePatientRecords,
  getPatients,
  type PatientProfile,
} from "../services/api";


function ageFromBirthDate(birthDate?: string): string {
  if (!birthDate) return "\u2014";
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return "\u2014";
  const diff = Date.now() - dob.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return `${years} yr`;
}


export default function Patients() {

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PatientProfile | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setPatients(await getPatients());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patients");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
    );
  }, [patients, query]);

  const visibleIds = useMemo(() => filtered.map((patient) => patient.id), [filtered]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  function togglePatient(patientId: number, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(patientId);
      else next.delete(patientId);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((patientId) => {
        if (checked) next.add(patientId);
        else next.delete(patientId);
      });
      return next;
    });
  }

  async function handleDeleteSelected() {
    const patientIds = Array.from(selectedIds);
    if (!isAdmin || patientIds.length === 0) return;

    try {
      setDeleting(true);
      setError(null);
      await deletePatientRecords(patientIds);
      setPatients((current) =>
        current.filter((patient) => !selectedIds.has(patient.id))
      );
      if (selected && selectedIds.has(selected.id)) setSelected(null);
      setSelectedIds(new Set());
      setDeleteOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patients");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dashboard">

      <div className="hero hero-settings">
        <div className="hero-content">
          <H2>Patients</H2>
          <p className="hero-subtitle">
            Browse registered patients and view their intake details.
          </p>
        </div>
        <div className="hero-badge">
          <Icon icon="people" size={28} />
        </div>
      </div>

      <Card elevation={Elevation.TWO} className="contact-card">

        {error && (
          <Callout intent="danger" icon="error" className="form-error">
            {error}
          </Callout>
        )}

        <div className="patients-toolbar">
          <InputGroup
            leftIcon="search"
            placeholder="Search by name, phone, or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="records-toolbar-actions">
            {isAdmin && (
              <Button
                icon="trash"
                intent="danger"
                text={
                  selectedIds.size > 0
                    ? `Delete selected (${selectedIds.size})`
                    : "Delete selected"
                }
                disabled={selectedIds.size === 0}
                onClick={() => setDeleteOpen(true)}
              />
            )}
            <Tag minimal round>
              {filtered.length} patient{filtered.length === 1 ? "" : "s"}
            </Tag>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <Callout icon="inbox" title="No patients found" />
        ) : (
          <HTMLTable striped interactive className="users-table">
            <thead>
              <tr>
                {isAdmin && (
                  <th className="record-select-cell">
                    <Checkbox
                      className="record-checkbox"
                      aria-label="Select all visible patients"
                      checked={allVisibleSelected}
                      indeterminate={someVisibleSelected}
                      onChange={(event) =>
                        toggleAllVisible(
                          (event.target as HTMLInputElement).checked
                        )
                      }
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Occupation</th>
                <th>Registered</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={selectedIds.has(p.id) ? "record-row-selected" : undefined}
                >
                  {isAdmin && (
                    <td className="record-select-cell">
                      <Checkbox
                        className="record-checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={selectedIds.has(p.id)}
                        onChange={(event) =>
                          togglePatient(
                            p.id,
                            (event.target as HTMLInputElement).checked
                          )
                        }
                      />
                    </td>
                  )}
                  <td>{p.name}</td>
                  <td>{ageFromBirthDate(p.birth_date)}</td>
                  <td>{p.gender || "\u2014"}</td>
                  <td>{p.phone}</td>
                  <td>{p.occupation || "\u2014"}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      minimal
                      small
                      icon="eye-open"
                      text="View"
                      onClick={() => setSelected(p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        )}
      </Card>

      <Drawer
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name}
        icon="person"
        size={DrawerSize.SMALL}
      >
        {selected && <PatientDetail patient={selected} />}
      </Drawer>

      <Alert
        isOpen={deleteOpen}
        icon="trash"
        intent="danger"
        cancelButtonText="Cancel"
        confirmButtonText="Delete records"
        canEscapeKeyCancel
        canOutsideClickCancel
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteSelected}
      >
        <p>
          Permanently delete {selectedIds.size} selected patient
          {selectedIds.size === 1 ? " record" : " records"}? This cannot be
          undone. Their login accounts will remain available under Settings.
        </p>
      </Alert>

    </div>
  );
}


function PatientDetail({ patient }: { patient: PatientProfile }) {

  const mapUrl =
    patient.latitude != null && patient.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${patient.latitude}&mlon=${patient.longitude}#map=15/${patient.latitude}/${patient.longitude}`
      : null;

  return (
    <div className="patient-detail">
      <Section title="Basic Details">
        <Row label="Parent / Guardian" value={patient.parent_name} />
        <Row label="Birth Date" value={patient.birth_date} />
        <Row label="Gender" value={patient.gender} />
        <Row label="Blood Group" value={patient.blood_group} />
        <Row label="Phone" value={patient.phone} />
        <Row label="Email" value={patient.email} />
        <Row label="Occupation" value={patient.occupation} />
        <Row label="Marital Status" value={patient.marital_status} />
        <Row label="Address" value={patient.address} />
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noreferrer" className="map-link">
            <Icon icon="map-marker" /> View location on map
          </a>
        )}
      </Section>

      <Section title="Current Health Issues">
        <Pre value={patient.current_health_issues} />
      </Section>

      <Section title="Previous History">
        <Pre value={patient.previous_history} />
      </Section>

      <Section title="Patient Character">
        <Pre value={patient.character_notes} />
      </Section>
    </div>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="patient-section">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value || "\u2014"}</span>
    </div>
  );
}

function Pre({ value }: { value?: string }) {
  return <div className="patient-pre">{value?.trim() || "\u2014"}</div>;
}
