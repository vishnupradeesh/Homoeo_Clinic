import { Icon } from "@blueprintjs/core";

const EVENTS: {
  date: string;
  type: string;
  title: string;
  text: string;
  details: string;
  time: string;
  mode: string;
}[] = [
  {
    date: "Sep 12",
    type: "Community event",
    title: "Free Wellness Camp",
    text: "Complimentary consultations and health screening for the community.",
    details: "Meet the clinic team, discuss general wellness questions, and learn about simple ways to support healthier routines.",
    time: "Morning session",
    mode: "In person",
  },
  {
    date: "Oct 05",
    type: "Interactive workshop",
    title: "Skin & Hair Care Workshop",
    text: "Learn natural routines for healthy skin and hair.",
    details: "Explore everyday care routines, common triggers, and practical questions to discuss during a skin or hair consultation.",
    time: "Afternoon session",
    mode: "In person",
  },
  {
    date: "Nov 20",
    type: "Wellness session",
    title: "Seasonal Immunity Drive",
    text: "Homoeopathic guidance to stay healthy through the season.",
    details: "Receive seasonal wellness education and guidance on preparing for changing weather, routines, and common health concerns.",
    time: "Morning session",
    mode: "Clinic event",
  },
];


export default function EventsPage() {
  return (
    <section className="landing-section">
      <h2>Events</h2>
      <p className="landing-lead">
        Join our community events, camps, and workshops for practical health
        education, helpful conversations, and supportive wellness guidance.
      </p>

      <div className="events-intro-card">
        <span className="events-intro-icon">
          <Icon icon="calendar" size={22} />
        </span>
        <div>
          <h3>Learn, connect, and take the next step</h3>
          <p>
            Our events are designed to make trusted health information easier
            to understand and apply in everyday life.
          </p>
        </div>
      </div>

      <div className="landing-grid">
        {EVENTS.map((event) => (
          <article key={event.title} className="landing-card landing-event">
            <div className="landing-event-topline">
              <span className="landing-event-date">{event.date}</span>
              <span className="landing-event-type">{event.type}</span>
            </div>
            <h3>{event.title}</h3>
            <p>{event.text}</p>
            <div className="landing-event-meta">
              <span><Icon icon="time" size={14} /> {event.time}</span>
              <span><Icon icon="map-marker" size={14} /> {event.mode}</span>
            </div>
            <p className="landing-event-details">
              <strong>What to expect:</strong> {event.details}
            </p>
          </article>
        ))}
      </div>

      <p className="events-note">
        Event dates and availability may change. Please contact the clinic to
        confirm the latest details before attending.
      </p>
    </section>
  );
}
