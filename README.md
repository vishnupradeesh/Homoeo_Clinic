# Arokya Homoeo Clinic

Web application for managing clinic and patient data.

## Google Sign-In

1. Create an OAuth 2.0 **Web application** client in Google Cloud.
2. Add these authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
3. Copy `backend/.env.example` to `backend/.env` and set:

   ```env
   GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```

4. Restart the backend. The login page discovers the public client ID from
   `/api/auth/providers`, while the backend verifies each Google ID token.

New verified Google accounts are created as active patient accounts. An
existing account with the same verified email is linked instead.

## Touchpad navigation

On pages with browser history, swipe right with two fingers to return to the
previous page. Native horizontal scrolling remains enabled inside elements
marked with `data-horizontal-scroll`.
