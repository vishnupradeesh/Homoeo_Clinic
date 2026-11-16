import { useState } from "react";

import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/core";


const SERVICES: { icon: IconName; title: string; text: string; details: string }[] = [
  {
    icon: "pulse",
    title: "Chronic Care",
    text: "Long-term homoeopathic management for chronic and lifestyle conditions.",
    details: "Appointments include a detailed case review, progress tracking, and practical guidance for supporting long-term wellbeing.",
  },
  {
    icon: "clean",
    title: "Cosmetology",
    text: "Skin, hair, and beauty consultations tailored to your needs.",
    details: "Discuss skin and hair concerns with a personalised plan focused on healthy routines and consistent follow-up.",
  },
  {
    icon: "heart",
    title: "Holistic Wellness",
    text: "Gentle remedies that treat the root cause, not just symptoms.",
    details: "We look at your health history, daily habits, and goals to create a care plan that supports your whole-person wellbeing.",
  },
  {
    icon: "people",
    title: "Family Homoeopathy",
    text: "Safe, natural care for every member of the family.",
    details: "Receive coordinated guidance for different family members, with age-appropriate consultations and follow-up support.",
  },
  {
    icon: "pulse",
    title: "Respiratory & Allergy Care",
    text: "Personalised support for seasonal allergies, asthma, sinus concerns, and recurring respiratory symptoms.",
    details: "Care plans focus on symptom patterns, common triggers, and everyday habits that can support easier breathing and recovery.",
  },
  {
    icon: "heart",
    title: "Digestive Health",
    text: "Thoughtful consultations for acidity, bloating, constipation, and other digestive concerns.",
    details: "We review your symptoms, food habits, and daily routine to help build a clearer and more comfortable digestive-health plan.",
  },
  {
    icon: "person",
    title: "Women's Wellness",
    text: "Compassionate care for menstrual health, hormonal balance, and wellness through every stage of life.",
    details: "Private, supportive consultations help you discuss cycle-related concerns, lifestyle factors, and ongoing wellness goals.",
  },
  {
    icon: "people",
    title: "Paediatric Care",
    text: "Gentle consultations for children's common health concerns, immunity, and overall wellbeing.",
    details: "Parents receive clear guidance, age-sensitive care recommendations, and follow-up support for their child's changing needs.",
  },
  {
    icon: "shield",
    title: "Stress & Sleep Support",
    text: "Holistic guidance for stress, restlessness, fatigue, and healthier sleep routines.",
    details: "Explore manageable routines for rest, relaxation, and emotional wellbeing alongside your personalised consultation plan.",
  },
  {
    icon: "clean",
    title: "Preventive Wellness",
    text: "Regular health reviews and lifestyle guidance to help you stay balanced and proactive about your wellbeing.",
    details: "Periodic reviews can help you stay aware of changes in your health and make sustainable improvements to everyday habits.",
  },
  {
    icon: "flash",
    title: "Acute & Seasonal Care",
    text: "Timely consultations for common short-term and seasonal health concerns.",
    details: "Get prompt guidance for new symptoms, with advice on supportive care and when an in-person medical evaluation may be needed.",
  },
  {
    icon: "desktop",
    title: "Online Follow-up Consultations",
    text: "Convenient virtual reviews to keep your care plan moving forward.",
    details: "Connect online to discuss progress, share updates, and plan your next steps between clinic visits.",
  },
];


export default function ServicesPage() {
  const [openService, setOpenService] = useState<string | null>(null);

  return (
    <section className="landing-section">
      <h2>Services</h2>
      <p className="landing-lead">
        Comprehensive homoeopathic and cosmetology care designed around your
        individual needs.
      </p>

      <div className="landing-grid">
        {SERVICES.map((service, index) => {
          const isExpanded = openService === service.title;
          const detailsId = `service-details-${index}`;

          return (
          <div key={service.title} className="landing-card">
            <span className="landing-card-icon">
              <Icon icon={service.icon} size={22} />
            </span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <button
              type="button"
              className="landing-card-read-more"
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              onClick={() => setOpenService(isExpanded ? null : service.title)}
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
            <p id={detailsId} className="landing-card-details" hidden={!isExpanded}>
              {service.details}
            </p>
          </div>
          );
        })}
      </div>
    </section>
  );
}
