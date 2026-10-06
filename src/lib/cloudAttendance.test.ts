import { describe, expect, it, vi } from "vitest";
import { supabase } from "./supabaseClient";
import { makeChain } from "./test-supabase-mock";
import {
  addAttendance,
  bulkAddAttendance,
  bulkRemoveAttendance,
  fetchAttendance,
  removeAttendance,
} from "./cloudAttendance";

vi.mock("./supabaseClient", () => ({ supabase: { from: vi.fn() } }));

describe("fetchAttendance", () => {
  it("returns the match IDs from the attendance table, relying on RLS to scope by user", () => {
    const chain = makeChain({ data: [{ match_id: "M0001" }, { match_id: "M0002" }], error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    return fetchAttendance().then((ids) => {
      expect(supabase.from).toHaveBeenCalledWith("attendance");
      expect(chain.select).toHaveBeenCalledWith("match_id");
      expect(ids).toEqual(["M0001", "M0002"]);
    });
  });

  it("throws when the query errors", async () => {
    const chain = makeChain({ data: null, error: { message: "boom" } });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await expect(fetchAttendance()).rejects.toEqual({ message: "boom" });
  });
});

describe("addAttendance / removeAttendance", () => {
  it("upserts a single row keyed on the composite primary key", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await addAttendance("user-1", "M0001");

    expect(chain.upsert).toHaveBeenCalledWith(
      { user_id: "user-1", match_id: "M0001" },
      { onConflict: "user_id,match_id" },
    );
  });

  it("deletes a single row scoped to user and match", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await removeAttendance("user-1", "M0001");

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.eq).toHaveBeenCalledWith("match_id", "M0001");
  });
});

describe("bulkAddAttendance / bulkRemoveAttendance", () => {
  it("upserts one row per match ID", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await bulkAddAttendance("user-1", ["M0001", "M0002"]);

    expect(chain.upsert).toHaveBeenCalledWith(
      [
        { user_id: "user-1", match_id: "M0001" },
        { user_id: "user-1", match_id: "M0002" },
      ],
      { onConflict: "user_id,match_id" },
    );
  });

  it("does nothing for an empty list, rather than sending a pointless request", async () => {
    await bulkAddAttendance("user-1", []);
    await bulkRemoveAttendance("user-1", []);

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("deletes with an `in` filter for bulk removal", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await bulkRemoveAttendance("user-1", ["M0001", "M0002"]);

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.in).toHaveBeenCalledWith("match_id", ["M0001", "M0002"]);
  });
});
