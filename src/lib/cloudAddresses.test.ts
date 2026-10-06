import { describe, expect, it, vi } from "vitest";
import { supabase } from "./supabaseClient";
import { makeChain } from "./test-supabase-mock";
import { fetchAddresses, saveAddresses } from "./cloudAddresses";
import { makeAddress } from "./test-fixtures";

vi.mock("./supabaseClient", () => ({ supabase: { from: vi.fn() } }));

describe("fetchAddresses", () => {
  it("maps DB rows (postcode/lat/lng) back to the app's HomeAddress shape", async () => {
    const chain = makeChain({
      data: [
        {
          id: "addr-1",
          postcode: "N5 1BU",
          label: "Home",
          lat: 51.556,
          lng: -0.106,
          from_date: "2020-01-01",
          to_date: null,
        },
      ],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const addresses = await fetchAddresses();

    expect(addresses).toEqual([
      {
        id: "addr-1",
        label: "Home",
        query: "N5 1BU",
        latitude: 51.556,
        longitude: -0.106,
        fromDate: "2020-01-01",
        toDate: null,
      },
    ]);
  });

  it("falls back to an empty label when the DB has none", async () => {
    const chain = makeChain({
      data: [
        {
          id: "addr-1",
          postcode: "N5 1BU",
          label: null,
          lat: 51.556,
          lng: -0.106,
          from_date: "2020-01-01",
          to_date: null,
        },
      ],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const [address] = await fetchAddresses();
    expect(address.label).toBe("");
  });
});

describe("saveAddresses", () => {
  it("rounds coordinates to 3 decimal places and maps query -> postcode on upsert", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const address = makeAddress({
      id: "addr-1",
      label: "Home",
      query: "N5 1BU",
      latitude: 51.5556789,
      longitude: -0.1063456,
    });

    await saveAddresses("user-1", [address]);

    expect(chain.upsert).toHaveBeenCalledWith([
      {
        id: "addr-1",
        user_id: "user-1",
        postcode: "N5 1BU",
        label: "Home",
        lat: 51.556,
        lng: -0.106,
        from_date: address.fromDate,
        to_date: address.toDate,
      },
    ]);
  });

  it("deletes rows no longer present, scoped to the user and excluding the kept IDs", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const address = makeAddress({ id: "addr-1" });
    await saveAddresses("user-1", [address]);

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.not).toHaveBeenCalledWith("id", "in", "(addr-1)");
  });

  it("skips the upsert but still deletes everything when the new list is empty", async () => {
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await saveAddresses("user-1", []);

    expect(chain.upsert).not.toHaveBeenCalled();
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.not).not.toHaveBeenCalled();
  });
});
