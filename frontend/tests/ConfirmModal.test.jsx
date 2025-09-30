import React from "react";
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../src/Components/ConfirmModal.jsx";

describe("ConfirmModal", () => {
  const mockOnClose = jest.fn();
  const mockConfirmAction = jest.fn();

  const eventData = {
    type: "event",
    eventType: "Goal",
    team: "Home",
    player: "Player 1",
    time: "10:00",
  };

  const matchData = {
    type: "match",
    action: "create",
    sportType: "Football",
    homeTeam: "Team A",
    awayTeam: "Team B",
    venue: "Main Stadium",
    startTime: "2025-09-29T10:00:00Z",
  };

  const selectedMatch = {
    homeTeam: "Team A",
    awayTeam: "Team B",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when show=false", () => {
    const { container } = render(
      <ConfirmModal show={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders event confirmation details", () => {
    render(
      <ConfirmModal
        show={true}
        onClose={mockOnClose}
        confirmData={eventData}
        selectedMatch={selectedMatch}
      />
    );

    expect(screen.getByText(/Confirm Action/i)).toBeInTheDocument();

    // Use closest <p> to get label + value
    const eventTypeEl = screen.getByText(/Event Type:/i).closest("p");
    expect(eventTypeEl).toHaveTextContent("Goal");

    const teamEl = screen.getByText(/Team:/i).closest("p");
    expect(teamEl).toHaveTextContent("Home");

    const playerEl = screen.getByText(/Player:/i).closest("p");
    expect(playerEl).toHaveTextContent("Player 1");

    const matchEl = screen.getByText(/Match:/i).closest("p");
    expect(matchEl).toHaveTextContent("Team A vs Team B");

    const timeEl = screen.getByText(/Time:/i).closest("p");
    expect(timeEl).toHaveTextContent("10:00");
  });

  test("renders match confirmation details", () => {
    render(
      <ConfirmModal
        show={true}
        onClose={mockOnClose}
        confirmData={matchData}
      />
    );

    expect(screen.getByText(/Confirm Action/i)).toBeInTheDocument();

    const actionEl = screen.getByText(/Action:/i).closest("p");
    expect(actionEl).toHaveTextContent("Create Match");

    const sportEl = screen.getByText(/Sport:/i).closest("p");
    expect(sportEl).toHaveTextContent("Football");

    const matchEl = screen.getByText(/Match:/i).closest("p");
    expect(matchEl).toHaveTextContent("Team A vs Team B");

    const venueEl = screen.getByText(/Venue:/i).closest("p");
    expect(venueEl).toHaveTextContent("Main Stadium");

    const startTimeEl = screen.getByText(/Start Time:/i).closest("p");
    expect(startTimeEl).toHaveTextContent(
      new Date(matchData.startTime).toLocaleString()
    );
  });

  test("calls onClose when Cancel is clicked", () => {
    render(
      <ConfirmModal
        show={true}
        onClose={mockOnClose}
        confirmData={eventData}
        selectedMatch={selectedMatch}
      />
    );

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose and confirmAction when Confirm is clicked", () => {
    render(
      <ConfirmModal
        show={true}
        onClose={mockOnClose}
        confirmData={eventData}
        confirmAction={mockConfirmAction}
        selectedMatch={selectedMatch}
      />
    );

    // Use getAllByText because "Confirm" appears twice: header and button
    const confirmBtn = screen.getAllByText(/Confirm/i).find(
      (el) => el.tagName.toLowerCase() === "button"
    );

    fireEvent.click(confirmBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockConfirmAction).toHaveBeenCalledTimes(1);
  });
});
