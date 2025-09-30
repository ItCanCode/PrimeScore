// tests/SportsSelector.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import SportsSelector from "../src/Pages/SportsSelector.jsx";
import { AuthContext } from "../src/context/authContext.jsx";

// Mock services
jest.mock("../src/services/sportService", () => ({
  getSports: () => [
    { id: "football", name: "Football", description: "Beautiful game", icon: "⚽" },
    { id: "rugby", name: "Rugby", description: "Strong game", icon: "🏉" },
  ],
  getFootballLeagues: () => ["EPL", "La Liga"],
  getLeaguesForSport: () => [{ id: "league1", name: "League One" }],
  getMatchTypeNavigation: jest.fn(() => ({ path: "/match-path", state: { test: true } })),
}));

// Mock LeagueModal & MatchTypeModal to simplify DOM
jest.mock("../src/Components/leagueModal.jsx", () => (props) => (
  props.isOpen ? (
    <div data-testid="league-modal">
      League Modal
      <button onClick={() => props.onSelect("league1")}>Select League</button>
      <button onClick={props.onClose}>Close</button>
    </div>
  ) : null
));
jest.mock("../src/Components/MatchType.jsx", () => (props) => (
  props.isOpen ? (
    <div data-testid="matchtype-modal">
      MatchType Modal
      <button onClick={() => props.onSelect("friendly")}>Select Match Type</button>
      <button onClick={props.onClose}>Close</button>
    </div>
  ) : null
));

const renderWithContext = (role = "manager", initialRoute = "/") => {
  const user = { role };
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<SportsSelector />} />
          <Route path="/home" element={<div>Home Page</div>} />
          <Route path="/sports" element={<div>Sports Page</div>} />
          <Route path="/management" element={<div>Management Page</div>} />
          <Route path="/match-admin" element={<div>Match Admin Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/match-path" element={<div>Match Path Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("SportsSelector Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders homepage with sports grid", () => {
    renderWithContext("manager");
    expect(screen.getByText("Choose Your Sport")).toBeInTheDocument();
    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.getByText("Rugby")).toBeInTheDocument();
  });

  test("opens and closes dropdown menu", () => {
    renderWithContext("manager");
    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /profile/i }));
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
  });

  test("logout clears token and navigates home", async () => {
    localStorage.setItem("authToken", "123");
    renderWithContext("manager");
    fireEvent.click(screen.getByRole("button", { name: /menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /logout/i }));
    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  test("manager sees Manage Team link and navigates", () => {
    renderWithContext("manager");
    fireEvent.click(screen.getByText(/manage team/i));
    expect(screen.getByText("Management Page")).toBeInTheDocument();
  });

  test("admin sees Manage Matches link and navigates", () => {
    renderWithContext("admin");
    fireEvent.click(screen.getByText(/manage matches/i));
    expect(screen.getByText("Match Admin Page")).toBeInTheDocument();
  });

  test("clicking a sport opens league modal and navigates after selection", async () => {
    renderWithContext("manager");
    fireEvent.click(screen.getByText("Football"));
    expect(await screen.findByTestId("league-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Select League"));
    expect(await screen.findByTestId("matchtype-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Select Match Type"));
    expect(await screen.findByText("Match Path Page")).toBeInTheDocument();
  });
});
