import {
  parseDateTime,
  getSessionStatus,
  getEventStatus,
  getMonthStatus,
  getNextTransitionBoundary,
  STATUS,
} from "./timeStatusUtils";

describe("timeStatusUtils - Live Automatic Status Transitions", () => {
  describe("parseDateTime", () => {
    it("correctly parses date and time into exact timestamp", () => {
      const dt = parseDateTime("2026-09-22", "10:00:00", false);
      expect(dt.getFullYear()).toBe(2026);
      expect(dt.getMonth()).toBe(8); // 0-indexed September
      expect(dt.getDate()).toBe(22);
      expect(dt.getHours()).toBe(10);
      expect(dt.getMinutes()).toBe(0);
      expect(dt.getSeconds()).toBe(0);
    });

    it("parses 12-hour AM/PM time correctly", () => {
      const amDt = parseDateTime("2026-09-22", "10:30 AM", false);
      expect(amDt.getHours()).toBe(10);
      expect(amDt.getMinutes()).toBe(30);

      const pmDt = parseDateTime("2026-09-22", "02:30 PM", false);
      expect(pmDt.getHours()).toBe(14);
      expect(pmDt.getMinutes()).toBe(30);
    });

    it("defaults start time to 00:00:00.000 and end time to 23:59:59.999 when time is omitted", () => {
      const start = parseDateTime("2026-09-22", null, false);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);

      const end = parseDateTime("2026-09-22", null, true);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
    });
  });

  describe("getSessionStatus - Boundary Rules", () => {
    const session = {
      session_date: "2026-09-22",
      start_time: "10:00:00",
      end_time: "11:30:00",
    };

    it("returns UPCOMING before start_at (09:59:59)", () => {
      const now = new Date(2026, 8, 22, 9, 59, 59);
      expect(getSessionStatus(session, now)).toBe(STATUS.UPCOMING);
    });

    it("returns ONGOING at exact start_at (10:00:00)", () => {
      const now = new Date(2026, 8, 22, 10, 0, 0);
      expect(getSessionStatus(session, now)).toBe(STATUS.ONGOING);
    });

    it("returns ONGOING during session (10:45:00)", () => {
      const now = new Date(2026, 8, 22, 10, 45, 0);
      expect(getSessionStatus(session, now)).toBe(STATUS.ONGOING);
    });

    it("returns ONGOING at 11:29:59", () => {
      const now = new Date(2026, 8, 22, 11, 29, 59);
      expect(getSessionStatus(session, now)).toBe(STATUS.ONGOING);
    });

    it("returns COMPLETED at exact end_at (11:30:00)", () => {
      const now = new Date(2026, 8, 22, 11, 30, 0);
      expect(getSessionStatus(session, now)).toBe(STATUS.COMPLETED);
    });

    it("returns COMPLETED after end_at (11:30:01)", () => {
      const now = new Date(2026, 8, 22, 11, 30, 1);
      expect(getSessionStatus(session, now)).toBe(STATUS.COMPLETED);
    });
  });

  describe("getEventStatus - Multiple Sessions Hierarchy", () => {
    const multiSessionEvent = {
      id: "event-1",
      title: "Assembly Day",
      sessions: [
        {
          id: "s1",
          session_date: "2026-09-22",
          start_time: "09:00:00",
          end_time: "10:00:00",
        },
        {
          id: "s2",
          session_date: "2026-09-22",
          start_time: "10:30:00",
          end_time: "12:00:00",
        },
        {
          id: "s3",
          session_date: "2026-09-22",
          start_time: "14:00:00",
          end_time: "15:00:00",
        },
      ],
    };

    it("shows UPCOMING when all sessions are in the future (08:30)", () => {
      const now = new Date(2026, 8, 22, 8, 30, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.UPCOMING);
    });

    it("shows ONGOING when session 1 is running (09:30)", () => {
      const now = new Date(2026, 8, 22, 9, 30, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.ONGOING);
    });

    it("shows UPCOMING in gap between session 1 and session 2 (10:15)", () => {
      // s1 is COMPLETED, s2 is UPCOMING, s3 is UPCOMING -> Event is UPCOMING
      const now = new Date(2026, 8, 22, 10, 15, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.UPCOMING);
    });

    it("shows ONGOING when session 2 is running (11:00)", () => {
      const now = new Date(2026, 8, 22, 11, 0, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.ONGOING);
    });

    it("shows UPCOMING in gap between session 2 and session 3 (13:00)", () => {
      const now = new Date(2026, 8, 22, 13, 0, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.UPCOMING);
    });

    it("shows ONGOING when session 3 is running (14:30)", () => {
      const now = new Date(2026, 8, 22, 14, 30, 0);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.ONGOING);
    });

    it("shows COMPLETED when all sessions have finished (15:00:01)", () => {
      const now = new Date(2026, 8, 22, 15, 0, 1);
      expect(getEventStatus(multiSessionEvent, now)).toBe(STATUS.COMPLETED);
    });
  });

  describe("getMonthStatus", () => {
    it("returns ONGOING when any event/session in month is active", () => {
      const events = [
        {
          sessions: [
            {
              session_date: "2026-09-22",
              start_time: "10:00:00",
              end_time: "11:30:00",
            },
          ],
        },
      ];
      const now = new Date(2026, 8, 22, 10, 30, 0);
      expect(getMonthStatus(events, now)).toBe(STATUS.ONGOING);
    });

    it("returns UPCOMING when upcoming events exist and none ongoing", () => {
      const events = [
        {
          sessions: [
            {
              session_date: "2026-09-22",
              start_time: "14:00:00",
              end_time: "15:30:00",
            },
          ],
        },
      ];
      const now = new Date(2026, 8, 22, 10, 0, 0);
      expect(getMonthStatus(events, now)).toBe(STATUS.UPCOMING);
    });

    it("returns COMPLETED when all events in month are finished", () => {
      const events = [
        {
          sessions: [
            {
              session_date: "2026-09-22",
              start_time: "08:00:00",
              end_time: "09:00:00",
            },
          ],
        },
      ];
      const now = new Date(2026, 8, 22, 12, 0, 0);
      expect(getMonthStatus(events, now)).toBe(STATUS.COMPLETED);
    });
  });

  describe("getNextTransitionBoundary", () => {
    it("discovers the closest upcoming transition timestamp", () => {
      const events = [
        {
          sessions: [
            {
              session_date: "2026-09-22",
              start_time: "10:00:00",
              end_time: "11:30:00",
            },
            {
              session_date: "2026-09-22",
              start_time: "14:00:00",
              end_time: "15:30:00",
            },
          ],
        },
      ];

      // At 09:45: next boundary is 10:00:00 start
      const now1 = new Date(2026, 8, 22, 9, 45, 0);
      const boundary1 = getNextTransitionBoundary(events, now1);
      expect(boundary1).toBe(new Date(2026, 8, 22, 10, 0, 0).getTime());

      // At 10:15 (ongoing): next boundary is 11:30:00 end
      const now2 = new Date(2026, 8, 22, 10, 15, 0);
      const boundary2 = getNextTransitionBoundary(events, now2);
      expect(boundary2).toBe(new Date(2026, 8, 22, 11, 30, 0).getTime());
    });
  });
});
