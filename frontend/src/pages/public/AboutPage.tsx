import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/core";

export default function AboutPage() {

  const MILESTONES: { year: string; text: string }[] = [
    {
      year: "2021",
      text: "Arokya Homoeo Clinic was founded by Dr. Vilasini Veeraraghavan with a vision of gentle, root-cause healing.",
    },
    {
      year: "2022",
      text: "Introduced dedicated cosmetology consultations for skin and hair wellness.",
    },
    {
      year: "2023",
      text: "Expanded chronic-care programmes and began community wellness camps.",
    },
    {
      year: "2024",
      text: "Grew into a trusted neighbourhood clinic serving families across the region.",
    },
    {
      year: "2025",
      text: "Launched online consultations, bringing personalised homoeopathic care to patients everywhere.",
    },
  ];

  const VALUES: { icon: IconName; title: string; text: string }[] = [
    {
      icon: "heart",
      title: "Compassion",
      text: "Every patient is treated with warmth, patience, and genuine care throughout their healing journey.",
    },
    {
      icon: "shield",
      title: "Safety First",
      text: "We use natural, non-toxic remedies that are gentle and safe for patients of all ages.",
    },
    {
      icon: "search-template",
      title: "Root-Cause Focus",
      text: "We look beyond symptoms to understand and treat the true source of illness.",
    },
    {
      icon: "learning",
      title: "Continuous Learning",
      text: "We stay updated with classical and modern homoeopathic practice to serve you better.",
    },
    {
      icon: "people",
      title: "Family-Centred",
      text: "From newborns to grandparents, we care for every generation under one roof.",
    },
    {
      icon: "endorsed",
      title: "Integrity",
      text: "Honest advice, transparent treatment plans, and no unnecessary medication - ever.",
    },
  ];

  const APPROACH: { no: string; icon: IconName; title: string; text: string }[] = [
    {
      no: "01",
      icon: "clipboard",
      title: "In-Depth Consultation",
      text: "We spend time understanding your complete history - physical, mental, and emotional - to see the whole picture.",
    },
    {
      no: "02",
      icon: "search-template",
      title: "Precise Case Analysis",
      text: "Using classical repertory, we carefully analyse your symptoms to find the most suitable constitutional remedy.",
    },
    {
      no: "03",
      icon: "prescription",
      title: "Individualised Remedy",
      text: "Each remedy is chosen to match you alone - never a one-size-fits-all prescription.",
    },
    {
      no: "04",
      icon: "pulse",
      title: "Ongoing Follow-Up",
      text: "We track your progress and gently adjust treatment to ensure lasting, long-term recovery.",
    },
  ];

  const WHY_US: { icon: IconName; title: string; text: string }[] = [
    {
      icon: "star",
      title: "Experienced Doctors",
      text: "A dedicated team with years of classical homoeopathic expertise across multiple specialties.",
    },
    {
      icon: "time",
      title: "Time for Every Patient",
      text: "Unhurried consultations that give your concerns the attention they truly deserve.",
    },
    {
      icon: "globe-network",
      title: "Online & Offline Care",
      text: "Visit us in person or consult from the comfort of your home - the choice is yours.",
    },
    {
      icon: "tick-circle",
      title: "Proven Results",
      text: "Thousands of satisfied patients and a track record of gentle, effective healing.",
    },
  ];

  const STATS: { value: string; label: string }[] = [
    { value: "25000+", label: "Cases Treated" },
    { value: "10+", label: "Years of Experience" },
    { value: "20+", label: "Wellness Camps Held" },
    { value: "98%", label: "Patient Satisfaction" },
  ];

  return (
    <>
      <section className="ah-hero ah-page-hero">
        <div className="ah-hero-inner ah-page-hero-inner">
          <div className="ah-hero-text">
            <span className="ah-eyebrow">About Us</span>
            <h1>Caring for Families, Naturally</h1>
            <p>
              Arokya Homoeo Clinic offers gentle, holistic homoeopathic care and
              cosmetology consultations in a warm, comfortable environment. We
              provide personalised treatment plans, chronic disease management,
              and wellness guidance to help you feel your best - naturally.
            </p>
          </div>
          <div className="ah-hero-visual about-hero-visual">
            <div className="ah-hero-card">
              <Icon icon="thumbs-up" size={18} />
              <div>
                <strong>98% Happy</strong>
                <span>Patient Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section about-section">
        <h2>
          <span className="about-heading-icon">
            <Icon icon="history" size={18} />
          </span>
          Our Story
        </h2>

        <p className="landing-lead">
          The clinic began in <strong>2021</strong>, born from <strong>Dr. Vilasini
          Veeraraghavan's</strong> belief that healing should be gentle,
          personalised, and focused on the root cause rather than just the
          symptoms. What started as a small practice has since grown into a
          trusted homoeopathic clinic for the whole family - one patient, one
          story, one recovery at a time.
        </p>

        <div className="timeline">
          {MILESTONES.map((item) => (
            <div key={item.year} className="timeline-item">
              <span className="timeline-year">{item.year}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="about-two-col">
          <div className="about-mv about-mv-mission">
            <h3 className="landing-subheading">
              <span className="about-heading-icon">
                <Icon icon="star" size={18} />
              </span>
              Our Mission
            </h3>
            <p>
              To make safe, natural, and affordable homoeopathic healthcare
              accessible to every family - restoring health by treating the whole
              person, not just the disease.
            </p>
          </div>

          <div className="about-mv about-mv-vision">
            <h3 className="landing-subheading">
              <span className="about-heading-icon">
                <Icon icon="eye-open" size={18} />
              </span>
              Our Vision
            </h3>
            <p>
              To be the most trusted homoeopathic clinic in the community, known
              for compassionate care, lasting results, and a genuine commitment to
              each patient's wellbeing.
            </p>
          </div>
        </div>
      </section>

      <section className="ah-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="ah-stat">
            <span className="ah-stat-value">{stat.value}</span>
            <span className="ah-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="ah-section ah-why">
        <div className="ah-section-head">
          <span className="ah-eyebrow ah-eyebrow-center">How We Work</span>
          <h2>Our Approach to Healing</h2>
          <p className="ah-section-sub">
            A careful, four-step process designed around you - because no two
            patients, and no two recoveries, are ever alike.
          </p>
        </div>
        <div className="ah-steps-grid">
          {APPROACH.map((step) => (
            <div key={step.no} className="ah-step-card">
              <span className="ah-step-no">{step.no}</span>
              <span className="ah-step-icon">
                <Icon icon={step.icon} size={22} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ah-section">
        <div className="ah-section-head">
          <span className="ah-eyebrow ah-eyebrow-center">Our Values</span>
          <h2>What We Stand For</h2>
          <p className="ah-section-sub">
            The principles that guide every consultation, every remedy, and every
            relationship we build with our patients.
          </p>
        </div>
        <div className="ah-services-grid">
          {VALUES.map((value) => (
            <div key={value.title} className="ah-service-card">
              <span className="ah-service-icon">
                <Icon icon={value.icon} size={24} />
              </span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ah-about">
        <div className="ah-about-inner">
          <div className="ah-about-visual about-page-visual" />
          <div className="ah-about-text">
            <span className="ah-eyebrow">Why Choose Arokya</span>
            <h2>Trusted Care That Puts You First</h2>
            <div className="about-whyus-grid">
              {WHY_US.map((item) => (
                <div key={item.title} className="about-whyus-item">
                  <span className="about-whyus-icon">
                    <Icon icon={item.icon} size={18} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ah-cta">
        <div className="ah-cta-inner">
          <h2>Your Journey to Better Health Starts Here</h2>
          <p>
            Whether it's a chronic condition or a wellness check, our team is
            ready to listen, understand, and help you heal - gently and naturally.
          </p>
        </div>
      </section>
    </>
  );
}
