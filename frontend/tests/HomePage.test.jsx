// HomePage.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../src/Pages/HomePage.jsx";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe("HomePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderHome = (role = "viewer", initialPath = "/home") => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: initialPath, state: { role } }]}>
        <HomePage />
      </MemoryRouter>
    );
  };

  test("renders PrimeScore logo and basic nav links", () => {
    renderHome("viewer");
    expect(screen.getByText(/PrimeScore/i)).toBeInTheDocument();
    expect(screen.getByText(/News/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  test("shows Sports link for viewer role", () => {
    renderHome("viewer");
    expect(screen.getByText(/Sports/i)).toBeInTheDocument();
  });

  test("shows Manage Team only for manager", () => {
    renderHome("manager");
    expect(screen.getByText(/Manage Team|Team/i)).toBeInTheDocument();

    renderHome("viewer");
    expect(screen.queryByText(/Manage Team|Team/i)).not.toBeInTheDocument();
  });

  test("shows Manage Matches only for admin", () => {
    renderHome("admin");
    expect(screen.getByText(/Manage Matches/i)).toBeInTheDocument();

    renderHome("viewer");
    expect(screen.queryByText(/Manage Matches/i)).not.toBeInTheDocument();
  });

  test("dropdown opens and closes", () => {
    renderHome("viewer");

    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /logout/i })).toBeInTheDocument();

    // Close dropdown by clicking Logout
    fireEvent.click(screen.getByRole("menuitem", { name: /logout/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to profile when profile clicked", () => {
    renderHome("viewer");
    fireEvent.click(screen.getByRole("button", { name: /menu/i }));

    const profileButton = screen.getByRole("menuitem", { name: /profile/i });
    fireEvent.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
