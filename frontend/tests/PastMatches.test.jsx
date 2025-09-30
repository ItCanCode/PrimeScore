// tests/PastMatches.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import '@testing-library/jest-dom';
import PastMatches from "../src/Pages/PastMatches.jsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

const mockMatches = [
  {
    id: 1,
    homeTeam: "Team A",
    awayTeam: "Team B",
    homeScore: 2,
    awayScore: 1,
    status: "Finished",
    sportType: "Football",
    venue: "Stadium X",
    startTime: "2025-09-10T18:00:00Z",
  },
  {
    id: 2,
    homeTeam: "Team C",
    awayTeam: "Team D",
    homeScore: 3,
    awayScore: 3,
    status: "Finished",
    sportType: "Basketball",
    venue: "Arena Y",
    startTime: "2025-09-11T15:30:00Z",
  },
  {
    id: 3,
    homeTeam: "Team E",
    awayTeam: "Team F",
    homeScore: null,
    awayScore: null,
    status: "Ongoing",
    sportType: "Football",
    venue: "Stadium Z",
    startTime: "2025-09-12T20:00:00Z",
  },
];

test("renders loading state initially", async () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => [],
  });

  render(
    <MemoryRouter>
      <PastMatches />
    </MemoryRouter>
  );

  expect(screen.getByText(/Loading past matches/i)).toBeInTheDocument();
});

test("renders past matches correctly", async () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => mockMatches,
  });

  render(
    <MemoryRouter>
      <PastMatches />
    </MemoryRouter>
  );

  // Wait for match cards to appear
  const matchCards = await screen.findAllByRole("article");
  expect(matchCards).toHaveLength(2); // Only finished matches

  // Check first match details
  expect(within(matchCards[0]).getByText("Team A")).toBeInTheDocument();
  expect(within(matchCards[0]).getByText("Team B")).toBeInTheDocument();
  expect(within(matchCards[0]).getByText(/Final Score/i)).toBeInTheDocument();

  // Check second match details
  expect(within(matchCards[1]).getByText("Team C")).toBeInTheDocument();
  expect(within(matchCards[1]).getByText("Team D")).toBeInTheDocument();

  // Should not show ongoing match
  expect(screen.queryByText(/Team E/)).not.toBeInTheDocument();
});

test("shows 'No past matches found' if none exist", async () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => [
      { ...mockMatches[2] }, // Only ongoing match
    ],
  });

  render(
    <MemoryRouter>
      <PastMatches />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/No past matches found/i)).toBeInTheDocument();
  });
});

// test("Back button works", async () => {
//   global.fetch.mockResolvedValueOnce({
//     json: async () => mockMatches,
//   });

//   render(
//     <MemoryRouter initialEntries={["/past-matches"]}>
//       <Routes>
//         <Route path="/past-matches" element={<PastMatches />} />
//         <Route path="/home" element={<div>Home Page</div>} />
//       </Routes>
//     </MemoryRouter>
//   );

//   // Wait for match cards to render
//   await screen.findAllByRole("article");

//   const backBtn = screen.getByRole("button", { name: /Back/i });
//   fireEvent.click(backBtn);

//   // Check that Home Page is rendered after click
//   await waitFor(() => {
//     expect(screen.getByText("Home Page")).toBeInTheDocument();
//   });
// });
