import os
import smtplib
from email.message import EmailMessage


class NotificationService:
    """Delivers messages over email, SMS, and WhatsApp.

    Real delivery is enabled by environment variables (e.g. in backend/.env).
    When the relevant variables are absent, delivery is simulated and reported
    so the app keeps working in development.

    Email (SMTP):
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
    SMS / WhatsApp (Twilio):
      TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
      TWILIO_SMS_FROM            e.g. +14155551234
      TWILIO_WHATSAPP_FROM       e.g. whatsapp:+14155238886
    """

    # ----- Email -----

    def send_email(
        self, to: str, subject: str, message: str
    ) -> tuple[bool, bool, str]:
        host = os.environ.get("SMTP_HOST")
        user = os.environ.get("SMTP_USER")
        password = os.environ.get("SMTP_PASSWORD")
        sender = os.environ.get(
            "SMTP_FROM", user or "no-reply@arokyaclinic.local"
        )

        if not host:
            return (
                True,
                True,
                f"Email simulated to {to} (set SMTP_* env vars to send for real).",
            )

        try:
            email = EmailMessage()
            email["From"] = sender
            email["To"] = to
            email["Subject"] = subject
            email.set_content(message)

            port = int(os.environ.get("SMTP_PORT", "587"))

            with smtplib.SMTP(host, port, timeout=15) as server:
                server.starttls()
                if user and password:
                    server.login(user, password)
                server.send_message(email)

            return True, False, f"Email sent to {to}."
        except Exception as exc:  # noqa: BLE001 - report any delivery failure
            return False, False, f"Failed to send email: {exc}"

    # ----- SMS (Twilio) -----

    def send_sms(self, to: str, message: str) -> tuple[bool, bool, str]:
        sid = os.environ.get("TWILIO_ACCOUNT_SID")
        token = os.environ.get("TWILIO_AUTH_TOKEN")
        sender = os.environ.get("TWILIO_SMS_FROM")

        if not (sid and token and sender):
            return (
                True,
                True,
                f"SMS simulated to {to} (set TWILIO_* env vars to send for real).",
            )

        return self._twilio_send(sid, token, sender, to, message, "SMS")

    # ----- WhatsApp (Twilio) -----

    def send_whatsapp(self, to: str, message: str) -> tuple[bool, bool, str]:
        sid = os.environ.get("TWILIO_ACCOUNT_SID")
        token = os.environ.get("TWILIO_AUTH_TOKEN")
        sender = os.environ.get("TWILIO_WHATSAPP_FROM")

        if not (sid and token and sender):
            return (
                True,
                True,
                (
                    f"WhatsApp simulated to {to} "
                    "(set TWILIO_* env vars to send for real)."
                ),
            )

        from_addr = (
            sender if sender.startswith("whatsapp:") else f"whatsapp:{sender}"
        )
        to_addr = to if to.startswith("whatsapp:") else f"whatsapp:{to}"

        return self._twilio_send(
            sid, token, from_addr, to_addr, message, "WhatsApp"
        )

    def _twilio_send(
        self,
        sid: str,
        token: str,
        sender: str,
        to: str,
        message: str,
        channel: str,
    ) -> tuple[bool, bool, str]:
        try:
            from twilio.rest import Client

            client = Client(sid, token)
            client.messages.create(body=message, from_=sender, to=to)
            return True, False, f"{channel} sent to {to}."
        except Exception as exc:  # noqa: BLE001 - report any delivery failure
            return False, False, f"Failed to send {channel}: {exc}"
