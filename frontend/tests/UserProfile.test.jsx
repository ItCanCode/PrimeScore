import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserProfile from "../src/Pages/UserProfile";
import "@testing-library/jest-dom";

jest.mock("../src/Components/ProfileCard", () => () => <div>Mocked ProfileCard</div>);
jest.mock("../src/Components/ProfileDetails", () => () => <div>Mocked ProfileDetails</div>);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("UserProfile", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders back button and child components", () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByText("← Back")).toBeInTheDocument();
    expect(screen.getByText("Mocked ProfileCard")).toBeInTheDocument();
    expect(screen.getByText("Mocked ProfileDetails")).toBeInTheDocument();
  });

  it("calls navigate when back button is clicked", () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("← Back"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
