import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Loading from "../src/Components/Loading.jsx";

describe("Loading component", () => {
  test("renders loading text", () => {
    render(<Loading />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("renders loader circle", () => {
    render(<Loading />);
    const loaderCircle = document.querySelector(".loader-circle");
    expect(loaderCircle).toBeInTheDocument();
  });

  test("renders three dots with correct classes", () => {
    render(<Loading />);
    const dots = document.querySelectorAll(".dot");
    expect(dots.length).toBe(3);
    expect(dots[0]).toHaveClass("blue");
    expect(dots[1]).toHaveClass("purple");
    expect(dots[2]).toHaveClass("indigo");
  });
});
