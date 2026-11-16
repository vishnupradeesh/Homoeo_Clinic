import { Button, Icon } from "@blueprintjs/core";


interface Props {
  onLogin: () => void;
}


export default function ContactsPage({ onLogin }: Props) {
  return (
    <section className="landing-section">
      <h2>Contacts</h2>
      <p className="landing-lead">
        Reach out to us with your questions, learn more about our consultation
        options, or sign in to book an appointment.
      </p>

      <div className="contact-page-grid">
        <div>
          <h3 className="contact-block-title">Get in touch</h3>
          <div className="landing-contacts">
            <div className="landing-contact">
              <Icon icon="map-marker" />
              <div>
                <strong>Clinic location</strong>
                <span>Arokya Homoeo Clinic, Main Road, Your City</span>
              </div>
            </div>
            <div className="landing-contact">
              <Icon icon="phone" />
              <div>
                <strong>Phone</strong>
                <span>+91 00000 00000</span>
              </div>
            </div>
            <div className="landing-contact">
              <Icon icon="envelope" />
              <div>
                <strong>Email</strong>
                <span>care@arokyaclinic.local</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-help-card">
          <span className="contact-help-icon">
            <Icon icon="help" size={22} />
          </span>
          <div>
            <h3>How we can help</h3>
            <p>
              Contact us about a new concern, an existing care plan, or the
              right consultation format for you and your family.
            </p>
            <ul>
              <li>Online and in-person consultations</li>
              <li>Personalised follow-up guidance</li>
              <li>Family and child-friendly care</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="contact-visit-card">
        <span className="contact-visit-icon">
          <Icon icon="calendar" size={22} />
        </span>
        <div>
          <h3>Before you book</h3>
          <p>
            Keep your main concerns, previous reports, and preferred
            consultation mode ready so the clinic team can guide you smoothly.
          </p>
        </div>
      </div>

      <Button
        className="btn-theme"
        icon="log-in"
        text="Login / Sign Up to Book"
        onClick={onLogin}
      />
    </section>
  );
}
