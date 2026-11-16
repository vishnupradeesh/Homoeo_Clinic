import { Button, Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/core";

const COLLEGE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Sarada+Krishna+Homoeopathic+Medical+College+Kulasekharam";

const SPECIALTIES: { icon: IconName; label: string }[] = [
  { icon: "pulse", label: "Chronic Care" },
  { icon: "clean", label: "Cosmetology" },
  { icon: "heart", label: "Holistic Wellness" },
  { icon: "people", label: "Family Homoeopathy" },
];

const CARE_FOCUS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "pulse",
    title: "Chronic and lifestyle care",
    text: "Long-term support for recurring health concerns, with regular reviews and practical lifestyle guidance.",
  },
  {
    icon: "clean",
    title: "Skin, hair, and cosmetology",
    text: "Personalised consultations for skin and hair concerns, supported by healthy daily-care routines.",
  },
  {
    icon: "people",
    title: "Family-centred consultations",
    text: "Approachable care for children and adults, with clear guidance that families can follow with confidence.",
  },
  {
    icon: "heart",
    title: "Whole-person wellbeing",
    text: "A compassionate view of health that considers symptoms, history, habits, and individual wellness goals.",
  },
];

const CONSULTATION_STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "clipboard",
    title: "Share your health story",
    text: "We discuss your current concerns, health history, routines, and the outcomes you hope to achieve.",
  },
  {
    icon: "user",
    title: "Build a personal plan",
    text: "Your consultation is shaped around your needs, with clear next steps and supportive care guidance.",
  },
  {
    icon: "calendar",
    title: "Review your progress",
    text: "Follow-up conversations help monitor changes, answer questions, and refine the plan when needed.",
  },
];

const STATS: { value: string; label: string }[] = [
  { value: "5+", label: "Years Experience" },
  { value: "1000+", label: "Patients Cared" },
  { value: "B.H.M.S.", label: "Qualified" },
];

export default function ConsultantsPage() {
  return (
    <section className="landing-section">
      <h2>Consultants</h2>
      <p className="landing-lead">
        Meet the expert behind Arokya Homoeo Clinic.
      </p>

      <div className="consultant-card">
        <div className="consultant-banner">
          <div className="consultant-avatar-lg">
            <Icon icon="person" size={52} />
          </div>
        </div>

        <div className="consultant-body">
          <div className="consultant-head">
            <div>
              <h3>Dr. Vilasini Veeraraghavan</h3>
              <p className="consultant-role">B.H.M.S., Cosmetologist</p>
            </div>
            <span className="consultant-exp-badge">
              <Icon icon="star" size={14} />
              5 Years Experience
            </span>
          </div>

          <p className="consultant-bio">
            Dr. Vilasini offers compassionate, patient-centred homoeopathic care
            and cosmetology consultations, focusing on treating the root cause of
            illness. She designs personalised treatment plans for chronic and
            lifestyle conditions.
          </p>

          <div className="consultant-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="consultant-stat">
                <span className="consultant-stat-value">{stat.value}</span>
                <span className="consultant-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <h4 className="consultant-subtitle">Specialties</h4>
          <div className="consultant-chips">
            {SPECIALTIES.map((item) => (
              <span key={item.label} className="consultant-chip">
                <Icon icon={item.icon} size={14} />
                {item.label}
              </span>
            ))}
          </div>

          <h4 className="consultant-subtitle">Education</h4>
          <div className="consultant-education-card">
            <span className="consultant-education-icon">
              <Icon icon="book" size={22} />
            </span>
            <div className="consultant-education-info">
              <strong>Sarada Krishna Homoeopathic Medical College</strong>
              <span className="consultant-education-meta">
                B.H.M.S. (Under-graduation) &middot; 2013 - 2019
              </span>
              <span className="consultant-education-meta">
                Kulasekharam, Kanyakumari District, Tamil Nadu
              </span>
              <Button
                className="btn-theme consultant-map-btn"
                icon="map-marker"
                text="View on Map"
                small
                onClick={() =>
                  window.open(COLLEGE_MAP_URL, "_blank", "noopener,noreferrer")
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="consultant-details-grid">
        <article className="consultant-info-panel">
          <div className="consultant-panel-heading">
            <span className="consultant-panel-icon">
              <Icon icon="heart" size={20} />
            </span>
            <div>
              <h3>Care philosophy</h3>
              <p>Thoughtful consultations, clear communication, and care that respects each patient’s individual journey.</p>
            </div>
          </div>
          <ul className="consultant-principles">
            <li><Icon icon="tick" size={15} /> Patient-centred conversations</li>
            <li><Icon icon="tick" size={15} /> Personalised wellness guidance</li>
            <li><Icon icon="tick" size={15} /> Supportive follow-up care</li>
          </ul>
        </article>

        <article className="consultant-info-panel">
          <div className="consultant-panel-heading">
            <span className="consultant-panel-icon consultant-panel-icon-alt">
              <Icon icon="shield" size={20} />
            </span>
            <div>
              <h3>What patients can expect</h3>
              <p>A welcoming experience designed to help you feel heard, informed, and supported at every stage.</p>
            </div>
          </div>
          <div className="consultant-expectations">
            <span>Private and attentive consultations</span>
            <span>Simple explanations and next steps</span>
            <span>Online and in-person follow-up options</span>
          </div>
        </article>
      </div>

      <section className="consultant-focus-section">
        <div className="consultant-section-heading">
          <span className="ah-eyebrow">Areas of Focus</span>
          <h3>Support shaped around your needs</h3>
          <p>Explore the main areas where Dr. Vilasini provides personalised homoeopathic and cosmetology consultations.</p>
        </div>
        <div className="landing-grid consultant-focus-grid">
          {CARE_FOCUS.map((item) => (
            <article key={item.title} className="landing-card consultant-focus-card">
              <span className="landing-card-icon">
                <Icon icon={item.icon} size={22} />
              </span>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="consultant-process-section">
        <div className="consultant-section-heading">
          <span className="ah-eyebrow">Your Consultation Journey</span>
          <h3>From first conversation to ongoing care</h3>
        </div>
        <div className="landing-grid consultant-process-grid">
          {CONSULTATION_STEPS.map((step, index) => (
            <article key={step.title} className="landing-card consultant-process-card">
              <span className="consultant-step-number">0{index + 1}</span>
              <span className="landing-card-icon">
                <Icon icon={step.icon} size={22} />
              </span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
