import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import LeagueModal from "../src/Components/leagueModal.jsx";

describe("LeagueModal", () => {
  const leagues = [
    { id: 1, name: "Premier League", flag: "🏴" },
    { id: 2, name: "La Liga", flag: "🇪🇸" },
  ];

  test("does not render when isOpen=false", () => {
    render(
      <LeagueModal
        isOpen={false}
        sport="football"
        leagues={leagues}
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    );
    expect(screen.queryByText(/Select Football League/i)).not.toBeInTheDocument();
  });

  test("renders when isOpen=true", () => {
    render(
      <LeagueModal
        isOpen={true}
        sport="football"
        leagues={leagues}
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText(/Select Football League/i)).toBeInTheDocument();
    expect(screen.getByText("Premier League")).toBeInTheDocument();
    expect(screen.getByText("La Liga")).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <LeagueModal
        isOpen={true}
        sport="football"
        leagues={leagues}
        onClose={onClose}
        onSelect={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onSelect with league id when a league is clicked", () => {
    const onSelect = jest.fn();
    render(
      <LeagueModal
        isOpen={true}
        sport="football"
        leagues={leagues}
        onClose={jest.fn()}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText("Premier League"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
