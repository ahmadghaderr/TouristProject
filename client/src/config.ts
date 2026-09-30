// In production the API is reached through the Netlify proxy on the same origin
// (see public/_redirects), so the auth cookie is first-party.
export const API_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : process.env.REACT_APP_API_URL || "http://localhost:5050";
