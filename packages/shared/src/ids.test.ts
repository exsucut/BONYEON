import { describe, expect, it } from "vitest";
import { newId } from "./ids.js";

describe("newId", () => {
  it("returns a 26-character ULID string", () => {
    const id = newId();
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it("returns a different id on each call", () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
  });

  it("returns ids that sort by creation time", () => {
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      ids.push(newId());
    }
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });
});
