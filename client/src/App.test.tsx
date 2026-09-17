import { render, screen } from "@testing-library/react";
import App from "./App";

test("redirects to the login page and renders the sign-in form", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Tourist" })).toBeInTheDocument();
  expect(screen.getByText(/sign in to manage pickups and drop-offs/i)).toBeInTheDocument();
});
