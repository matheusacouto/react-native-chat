import { buildNotificationPayload } from "@/src/utils/notificationPayload";

describe("buildNotificationPayload", () => {
  it("returns null when payload is empty", () => {
    expect(buildNotificationPayload("")).toBeNull();
    expect(buildNotificationPayload("   ")).toBeNull();
  });

  it("returns normalized raw payload when content exists", () => {
    expect(buildNotificationPayload("  hello world  ")).toEqual({
      raw: "hello world",
    });
  });
});
