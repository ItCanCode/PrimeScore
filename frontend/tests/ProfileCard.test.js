import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfileCard from "../src/Components/ProfileCard";

jest.mock("../src/Components/Loading", () => () => <div>Loading...</div>);

describe("ProfileCard", () => {
  const fakeUser = {
    username: "JohnDoe",
    picture: "avatar.png",
    profile: { bio: "Hello world", location: "NYC" },
    createdAt: { _seconds: 1609459200 },
  };

  beforeEach(() => {
    
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");

    global.fetch = jest.fn((url, options) => {

      if (url.endsWith("/api/users/me") && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: fakeUser }),
        });
      }

      if (url.endsWith("/api/users/me") && options?.method === "PUT") {
        const body = JSON.parse(options.body);
        const updatedUser = {
          ...fakeUser,
          username: body.username || fakeUser.username,
          picture: body.picture || fakeUser.picture,
          profile: { ...fakeUser.profile, ...body.profile },
        };
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: updatedUser }),
        });
      }

      if (url.endsWith("/api/users/upload")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: "uploaded.png" }),
        });
      }

      return Promise.reject(new Error("Unknown endpoint"));
    });

    global.URL.createObjectURL = jest.fn(() => "blob:image");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it("renders loading first and then user info", async () => {
    render(<ProfileCard />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("JohnDoe")).toBeInTheDocument();
      expect(screen.getByText("Hello world")).toBeInTheDocument();
      expect(screen.getByText("NYC")).toBeInTheDocument();
      expect(screen.getByText("Member since: 2021")).toBeInTheDocument();
    });
  });

  it("toggles edit mode and updates input fields", async () => {
    render(<ProfileCard />);
    await waitFor(() => screen.getByText("JohnDoe"));

    fireEvent.click(screen.getByText("Edit Profile"));

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "JaneDoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("bio"), {
      target: { value: "New bio" },
    });
    fireEvent.change(screen.getByPlaceholderText("Location"), {
      target: { value: "LA" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("JaneDoe")).toBeInTheDocument();
      expect(screen.getByText("New bio")).toBeInTheDocument();
      expect(screen.getByText("LA")).toBeInTheDocument();
    });
  });

  it("handles image upload and sets preview URL", async () => {
    render(<ProfileCard />);
    await waitFor(() => screen.getByText("JohnDoe"));

    fireEvent.click(screen.getByText("Edit Profile"));

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const inputFile = screen.getByTestId("profile-file-input");

    fireEvent.change(inputFile, { target: { files: [file] } });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img.src).toBe("blob:image");
    });
  });
});
