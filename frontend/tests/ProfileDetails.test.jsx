import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfileDetails from "../src/Components/ProfileDetails";

describe("ProfileDetails", () => {
  const fakeUser = {
    profile: {
      favoriteSports: ["Football", "Tennis"],
      favoriteTeam: "Real Madrid",
      favoritePlayer: "Cristiano Ronaldo"
    }
  };

  beforeEach(() => {

    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");

    global.fetch = jest.fn((url, options) => {
      if (url.endsWith("/api/users/me") && !options?.method) {

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: fakeUser })
        });
      }

      if (url.endsWith("/api/users/me") && options?.method === "PUT") {

        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { profile: body.profile } })
        });
      }

      return Promise.reject(new Error("Unknown endpoint"));
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it("renders fetched user info", async () => {
    render(<ProfileDetails />);

    await waitFor(() => {
      expect(screen.getByText("Football, Tennis")).toBeInTheDocument();
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
      expect(screen.getByText("Cristiano Ronaldo")).toBeInTheDocument();
    });
  });

  it("toggles edit mode", async () => {
    render(<ProfileDetails />);

    await waitFor(() => screen.getByText("Football, Tennis"));

    fireEvent.click(screen.getByText("Edit Details"));

    expect(screen.getByPlaceholderText("e.g. Real Madrid")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Cristiano Ronaldo")).toBeInTheDocument();
  });

  it("updates input fields and saves", async () => {
    render(<ProfileDetails />);
    await waitFor(() => screen.getByText("Football, Tennis"));

    fireEvent.click(screen.getByText("Edit Details"));

    const teamInput = screen.getByPlaceholderText("e.g. Real Madrid");
    fireEvent.change(teamInput, { target: { value: "Barcelona" } });

    const playerInput = screen.getByPlaceholderText("e.g. Cristiano Ronaldo");
    fireEvent.change(playerInput, { target: { value: "Messi" } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
      expect(screen.getByText("Messi")).toBeInTheDocument();
    });
  });

  it("toggles favorite sports selection", async () => {
    render(<ProfileDetails />);
    await waitFor(() => screen.getByText("Football, Tennis"));

    fireEvent.click(screen.getByText("Edit Details"));

    const footballBtn = screen.getByText("Football");
    const basketballBtn = screen.getByText("Basketball");

    fireEvent.click(footballBtn);
    expect(footballBtn).not.toHaveClass("selected");

    fireEvent.click(basketballBtn);
    expect(basketballBtn).toHaveClass("selected");
  });
});
