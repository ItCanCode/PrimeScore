import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Navbar from "../src/Components/Navbar";

// mock navigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("Navbar", () => {
  it("renders PrimeScore logo", () => {
    render(<Navbar role="viewer" isMobile={false} showForm={false} setShowForm={jest.fn()} />);
    expect(screen.getByText(/PrimeScore/i)).toBeInTheDocument();
  });

  it("renders Manager links when role=manager", () => {
    render(<Navbar role="manager" isMobile={false} showForm={false} setShowForm={jest.fn()} />);
    expect(screen.getByText(/Manage Team/i)).toBeInTheDocument();
  });

  it("calls setShowForm when Create Match clicked", () => {
    const setShowForm = jest.fn();
    render(<Navbar role="admin" isMobile={false} showForm={false} setShowForm={setShowForm} />);
    fireEvent.click(screen.getByText(/Create Match/i));
    expect(setShowForm).toHaveBeenCalledWith(true);
  });

  it("toggles dropdown menu", () => {
    render(<Navbar role="viewer" isMobile={false} showForm={false} setShowForm={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("navigates when Profile clicked", () => {
    render(<Navbar role="viewer" isMobile={false} showForm={false} setShowForm={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Profile/i }));
    expect(mockedNavigate).toHaveBeenCalledWith("/profile");
  });
});
