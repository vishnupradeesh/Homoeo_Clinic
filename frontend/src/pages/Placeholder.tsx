import { Card, Elevation, H2, Icon, NonIdealState } from "@blueprintjs/core";


interface Props {
  title: string;
  subtitle: string;
  icon: "people" | "prescription";
}


export default function Placeholder({ title, subtitle, icon }: Props) {
  return (
    <div className="dashboard">
      <div className="hero hero-settings">
        <div className="hero-content">
          <H2>{title}</H2>
          <p className="hero-subtitle">{subtitle}</p>
        </div>
        <div className="hero-badge">
          <Icon icon={icon} size={28} />
        </div>
      </div>

      <Card elevation={Elevation.TWO} className="contact-card">
        <NonIdealState
          icon={icon}
          title="Coming soon"
          description={`The ${title} module is under construction.`}
        />
      </Card>
    </div>
  );
}
