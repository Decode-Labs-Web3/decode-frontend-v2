import notificationReducer, {
  setNotification,
  setOldNotification,
  setReadAll,
  setReadOne,
  setNewNotification,
  resetNotifications,
} from "../notificationSlice";
import {
  NotificationReceived,
  NotificationSocketEvent,
} from "@/interfaces/notification.interfaces";

const mockNotification: NotificationReceived = {
  _id: "1",
  user_id: "user1",
  type: "info",
  title: "Test Title",
  message: "Test Message",
  delivered: true,
  delivered_at: null,
  read: false,
  read_at: null,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

const mockSocketEvent: NotificationSocketEvent = {
  id: "2",
  user_id: "user1",
  type: "info",
  title: "New Title",
  message: "New Message",
  delivered: true,
  delivered_at: null,
  read: false,
  read_at: null,
  createdAt: "2023-01-02T00:00:00.000Z",
  updatedAt: "2023-01-02T00:00:00.000Z",
};

describe("notificationSlice", () => {
  const initialState: NotificationReceived[] = [];

  it("should return the initial state", () => {
    expect(notificationReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  it("should handle setNotification", () => {
    const notifications = [mockNotification];
    const actual = notificationReducer(
      initialState,
      setNotification(notifications)
    );
    expect(actual).toEqual(notifications);
  });

  it("should handle setOldNotification", () => {
    const state = [mockNotification];
    const oldNotifications = [
      { ...mockNotification, _id: "3" },
      { ...mockNotification, _id: "1" }, // duplicate
    ];
    const actual = notificationReducer(
      state,
      setOldNotification(oldNotifications)
    );
    expect(actual).toHaveLength(2);
    expect(actual[1]._id).toBe("3");
  });

  it("should handle setReadAll", () => {
    const state = [
      { ...mockNotification, read: false },
      { ...mockNotification, _id: "2", read: false },
    ];
    const actual = notificationReducer(state, setReadAll());
    expect(actual.every((n) => n.read)).toBe(true);
  });

  it("should handle setReadOne", () => {
    const state = [
      { ...mockNotification, read: false },
      { ...mockNotification, _id: "2", read: false },
    ];
    const actual = notificationReducer(state, setReadOne({ id: "1" }));
    expect(actual[0].read).toBe(true);
    expect(actual[1].read).toBe(false);
  });

  it("should handle setNewNotification", () => {
    const state = [mockNotification];
    const actual = notificationReducer(
      state,
      setNewNotification(mockSocketEvent)
    );
    expect(actual).toHaveLength(2);
    expect(actual[0]._id).toBe("2");
  });

  it("should not add duplicate in setNewNotification", () => {
    const state = [mockNotification];
    const duplicateEvent = { ...mockSocketEvent, id: "1" };
    const actual = notificationReducer(
      state,
      setNewNotification(duplicateEvent)
    );
    expect(actual).toHaveLength(1);
  });

  it("should handle resetNotifications", () => {
    const state = [mockNotification];
    const actual = notificationReducer(state, resetNotifications());
    expect(actual).toEqual([]);
  });
});
