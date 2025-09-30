import { handleAddMatchEvent } from "../src/services/addMatchEventHandler"; // ✅ updated path
import { addMatchEventService } from "../src/services/matchService";

jest.mock("../src/services/matchService", () => ({
  addMatchEventService: jest.fn(),
}));

describe("handleAddMatchEvent", () => {
  let setMatchEvents;
  let setMessage;
  let resetEventForm;
  const selectedMatch = { id: 1 };
  const eventData = { eventType: "Goal", team: "home", time: "10", player: "John" };

  beforeEach(() => {
    setMatchEvents = jest.fn();
    setMessage = jest.fn();
    resetEventForm = jest.fn();
    addMatchEventService.mockClear();
  });

  it("adds a new event and updates state on success", async () => {
    const fakeEvent = { ...eventData, id: 123, timestamp: "2025-09-29T00:00:00Z" };
    addMatchEventService.mockResolvedValueOnce(fakeEvent);

    await handleAddMatchEvent(selectedMatch, eventData, setMatchEvents, setMessage, resetEventForm);

    expect(addMatchEventService).toHaveBeenCalledWith(selectedMatch, eventData);
    expect(setMessage).toHaveBeenCalledWith({ type: "success", text: "Event added successfully" });
    expect(setMatchEvents).toHaveBeenCalledWith(expect.any(Function));
    expect(resetEventForm).toHaveBeenCalled();
  });

  it("sorts events by time when adding a new event", async () => {
    addMatchEventService.mockResolvedValueOnce({ ...eventData, time: "5", id: 456, timestamp: "2025-09-29T00:01:00Z" });

    const prevState = { 1: [{ ...eventData, time: "10", id: 123 }] };
    setMatchEvents.mockImplementation(cb => {
      const newState = cb(prevState);
      expect(newState[1][0].time).toBe("5");
      expect(newState[1][1].time).toBe("10");
    });

    await handleAddMatchEvent(selectedMatch, eventData, setMatchEvents, setMessage, resetEventForm);
  });

  it("sets error message on service failure", async () => {
    const error = new Error("Network error");
    addMatchEventService.mockRejectedValueOnce(error);

    await handleAddMatchEvent(selectedMatch, eventData, setMatchEvents, setMessage, resetEventForm);

    expect(setMessage).toHaveBeenCalledWith({ type: "error", text: "Network error" });
    expect(resetEventForm).toHaveBeenCalled();
  });
});
