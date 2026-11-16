import {
  Card,
  Elevation,
  H2,
  Icon,
  type IconName,
} from "@blueprintjs/core";


const EXPERTISE: { label: string; icon: IconName }[] = [
  { label: "Kidney Stones", icon: "lab-test" },
  { label: "Thyroid Disorder", icon: "pulse" },
  { label: "Gall Stones", icon: "lab-test" },
  { label: "PCOD", icon: "heart" },
  { label: "OCD", icon: "flash" },
  { label: "Child Health", icon: "person" },
  { label: "Life Style Disorder", icon: "walk" },
  { label: "Infectious Diseases", icon: "shield" },
  { label: "Other Chronic Diseases", icon: "pulse" },
];


export default function Dashboard() {

  return (
    <div className="dashboard">

      <div className="hero">
        <div className="hero-content">
          <H2>
            Arokya Homoeo Clinic
          </H2>

          <p className="hero-subtitle">
            Gentle, holistic homoeopathic care focused on the root cause of illness.
          </p>
        </div>
        <div className="hero-badge">
          <Icon icon="heart" size={28} />
        </div>
      </div>


      <Card
        elevation={Elevation.TWO}
        className="about-card"
      >
        <h3>About the Clinic</h3>

        <p>
          Arokya Homoeo Clinic offers gentle, holistic homoeopathic care
          focused on treating the root cause of illness. We provide
          personalised treatment plans, chronic disease management, and
          cosmetology consultations in a caring and comfortable environment.
        </p>

        <div className="doctor-info">
          <Icon icon="badge" />
          <div>
            <strong>Dr. Vilasini Veeraraghavan</strong>
            <div className="doctor-qualification">
              B.H.M.S., Cosmetologist
            </div>
          </div>
        </div>
      </Card>


      <Card
        elevation={Elevation.TWO}
        className="doctor-card"
      >
        <div className="doctor-avatar">
          <Icon icon="person" size={32} />
        </div>

        <div className="doctor-details">
          <h3>Meet the Doctor</h3>

          <p>
            <strong>Dr. Vilasini Veeraraghavan</strong> (B.H.M.S.,
            Cosmetologist) brings <strong>5 years of experience</strong> in
            medicine, offering compassionate, patient-centred homoeopathic
            care. With a focus on treating the root cause of illness, she
            provides personalised treatment plans for chronic and lifestyle
            conditions.
          </p>

          <div className="doctor-stats">
            <div className="doctor-stat">
              <span className="doctor-stat-value">5+</span>
              <span className="doctor-stat-label">Years of Experience</span>
            </div>
          </div>
        </div>
      </Card>


      <h3 className="section-heading">Expertise in curing</h3>

      <div className="expertise-grid">
        {EXPERTISE.map((item, index) => (
          <div
            key={item.label}
            className={`expertise-tile tile-${(index % 9) + 1}`}
          >
            <div className="tile-icon">
              <Icon icon={item.icon} size={22} />
            </div>
            <span className="tile-label">{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}