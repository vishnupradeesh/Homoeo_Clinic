import { useState } from "react";
import { useEffect } from "react";

import { Button, Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/core";

import AboutPage from "./public/AboutPage";
import ServicesPage from "./public/ServicesPage";
import ConsultantsPage from "./public/ConsultantsPage";
import EventsPage from "./public/EventsPage";
import ContactsPage from "./public/ContactsPage";


interface Props {
  onLogin: () => void;
  page: PublicPage;
  onNavigate: (page: PublicPage) => void;
}


export type PublicPage =
  | "home"
  | "about"
  | "services"
  | "consultants"
  | "events"
  | "contacts";


const NAV_LINKS: { label: string; page: PublicPage }[] = [
  { label: "About", page: "about" },
  { label: "Services", page: "services" },
  { label: "Consultants", page: "consultants" },
  { label: "Events", page: "events" },
  { label: "Contacts", page: "contacts" },
];


const SERVICES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "heart",
    title: "Allergy Management",
    text: "Tailored treatment plans for managing various allergies safely and effectively.",
  },
  {
    icon: "person",
    title: "Personalised Care",
    text: "One-on-one consultations to address your unique health and disease concerns.",
  },
  {
    icon: "people",
    title: "Child Treatments",
    text: "Dedicated services for diagnosing and treating a variety of cases in children.",
  },
  {
    icon: "clean",
    title: "Holistic Wellness",
    text: "Integrative treatments that consider your overall health and wellbeing.",
  },
  {
    icon: "shield",
    title: "Skin & Hair Care",
    text: "Safe, scientific homoeopathic care for skin disorders and hair problems.",
  },
  {
    icon: "pulse",
    title: "Chronic Conditions",
    text: "Long-term management for arthritis, thyroid, migraine and lifestyle disorders.",
  },
];


const STATS: { value: string; label: string }[] = [
  { value: "10+", label: "Years of Experience" },
  { value: "15+", label: "Expert Doctors" },
  { value: "100%", label: "Satisfied Patients" },
  { value: "25000+", label: "Cases Treated" },
];


const STEPS: { no: string; icon: IconName; title: string; text: string }[] = [
  {
    no: "01",
    icon: "endorsed",
    title: "Expert Care",
    text: "Receive treatment from experienced professionals who specialise in a wide range of conditions.",
  },
  {
    no: "02",
    icon: "user",
    title: "Personalised Treatment",
    text: "Each patient is unique, and we tailor our care strategies to meet your individual needs.",
  },
  {
    no: "03",
    icon: "heart",
    title: "Compassionate Staff",
    text: "Our friendly, attentive team is committed to making your visit comfortable and supportive.",
  },
  {
    no: "04",
    icon: "star",
    title: "Proven Results",
    text: "With a 4.9-star rating from satisfied patients, we have a track record of successful outcomes.",
  },
];


const TESTIMONIALS: { name: string; role: string; text: string }[] = [
  {
    name: "Shifa Fayiz",
    role: "Patient",
    text: "The staff at Arokya provides personalised care. My child's allergy symptoms have significantly improved since treatment began. Highly recommend!",
  },
  {
    name: "Rahul Nair",
    role: "Patient",
    text: "The doctors at Arokya are exceptional! The knowledge and care provided made a real difference in my allergy management. Thanks to the team!",
  },
  {
    name: "Anjali Menon",
    role: "Patient",
    text: "Gentle, effective treatment and a caring team. I finally found lasting relief from my chronic condition through their homoeopathic approach.",
  },
];


export default function LandingPage({ onLogin, page, onNavigate }: Props) {

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(next: PublicPage) {
    onNavigate(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage() {
    switch (page) {
      case "about":
        return <AboutPage />;
      case "services":
        return <ServicesPage />;
      case "consultants":
        return <ConsultantsPage />;
      case "events":
        return <EventsPage />;
      case "contacts":
        return <ContactsPage onLogin={onLogin} />;
      default:
        return (
          <>
            <section className="ah-hero">
              <div className="ah-hero-inner">
                <div className="ah-hero-text">
                  <span className="ah-eyebrow">Clinic for Advanced Homoeopathy</span>
                  <h1>Arokya Homoeo Clinic</h1>
                  <p>
                    Experience personalised treatment for allergies, chronic
                    diseases, lifestyle disorders, children's health, women's
                    wellness, skin &amp; hair problems and more - delivered by
                    trusted specialists dedicated to your healing through
                    homoeopathy, both online and offline.
                  </p>
                  <div className="ah-hero-actions">
                    <Button
                      large
                      className="btn-theme"
                      icon="log-in"
                      text="Get Started"
                      onClick={onLogin}
                    />
                    <Button
                      large
                      className="btn-outline"
                      icon="heart"
                      text="Our Services"
                      onClick={() => goTo("services")}
                    />
                  </div>
                </div>
                <div className="ah-hero-visual">
                  <div className="ah-hero-card">
                    <Icon icon="star" size={18} />
                    <div>
                      <strong>4.8 / 5</strong>
                      <span>Google Ratings</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="ah-section">
              <div className="ah-section-head">
                <span className="ah-eyebrow ah-eyebrow-center">Our Services</span>
                <h2>Comprehensive Treatment Solutions</h2>
                <p className="ah-section-sub">
                  Explore our range of specialised expert care across multiple
                  specialties including allergies, respiratory issues, digestive
                  problems, hormonal imbalance, paediatric care, and chronic
                  conditions - all with compassionate, personalised treatment.
                </p>
              </div>
              <div className="ah-services-grid">
                {SERVICES.map((service) => (
                  <div key={service.title} className="ah-service-card">
                    <span className="ah-service-icon">
                      <Icon icon={service.icon} size={24} />
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </div>
                ))}
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

            <section className="ah-about">
              <div className="ah-about-inner">
                <div className="ah-about-visual" />
                <div className="ah-about-text">
                  <span className="ah-eyebrow">About Us</span>
                  <h2>Arokya: Advanced Multispeciality Homoeopathy</h2>
                  <p>
                    Our experienced doctors provide tailored treatment for a
                    wide range of conditions - allergies, skin disorders,
                    arthritis, thyroid issues, migraine, women's health, child
                    care, stress management and more - using safe and scientific
                    homoeopathic methods across our branches.
                  </p>
                  <Button
                    large
                    className="btn-theme"
                    text="Read More"
                    onClick={() => goTo("about")}
                  />
                </div>
              </div>
            </section>

            <section className="ah-section ah-why">
              <div className="ah-section-head">
                <span className="ah-eyebrow ah-eyebrow-center">Why Choose Us</span>
                <h2>Start Your Journey To Wellness Today</h2>
              </div>
              <div className="ah-steps-grid">
                {STEPS.map((step) => (
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

            <section className="ah-testimonials">
              <div className="ah-section-head">
                <span className="ah-eyebrow ah-eyebrow-center">Hear From Patients</span>
                <h2>What Our Patients Say</h2>
                <p className="ah-section-sub">
                  5-star ratings from more than 2,000 happy patients across our
                  branches.
                </p>
              </div>
              <div className="ah-testimonials-grid">
                {TESTIMONIALS.map((item) => (
                  <div key={item.name} className="ah-testimonial-card">
                    <div className="ah-testimonial-stars">
                      <Icon icon="star" size={16} />
                      <Icon icon="star" size={16} />
                      <Icon icon="star" size={16} />
                      <Icon icon="star" size={16} />
                      <Icon icon="star" size={16} />
                    </div>
                    <p>"{item.text}"</p>
                    <div className="ah-testimonial-author">
                      <span className="ah-testimonial-avatar">
                        {item.name.charAt(0)}
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="ah-cta">
              <div className="ah-cta-inner">
                <h2>Take The First Step Towards Better Health</h2>
                <p>
                  Contact us now to schedule your appointment and begin your
                  journey to relief with our expert team.
                </p>
                <Button
                  large
                  className="btn-cta-light"
                  icon="calendar"
                  text="Get An Appointment"
                  onClick={() => goTo("contacts")}
                />
              </div>
            </section>
          </>
        );
    }
  }

  return (
    <div className="landing">

      <header className="landing-nav">
        <button
          type="button"
          className="landing-brand"
          onClick={() => goTo("home")}
        >
          <img src="/logo.png" alt="Arokya Homoeo Clinic" className="landing-logo-img" />
          <span>Arokya Homoeo Clinic</span>
        </button>

        <nav className="landing-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.page}
              type="button"
              className={
                page === link.page
                  ? "landing-link landing-link-active"
                  : "landing-link"
              }
              onClick={() => goTo(link.page)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <Button
          className="btn-theme landing-login-btn"
          icon="log-in"
          text="Login / Sign Up"
          onClick={onLogin}
        />
      </header>

      {renderPage()}

      <footer className="landing-footer">
        <span>
          © {new Date().getFullYear()} Arokya Homoeo Clinic. All rights reserved.
        </span>
      </footer>

      <button
        type="button"
        className={showTop ? "scroll-top scroll-top-show" : "scroll-top"}
        onClick={scrollTop}
        aria-label="Scroll to top"
      >
        <Icon icon="chevron-up" size={22} />
      </button>

    </div>
  );
}
