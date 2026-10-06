import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiHelper from "./apiHelper";

describe("apiHelper", () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn().mockResolvedValue("response");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("token", () => {
    it("getAccessToken mengembalikan null jika belum ada token", () => {
      expect(apiHelper.getAccessToken()).toBeNull();
    });

    it("putAccessToken menyimpan token", () => {
      apiHelper.putAccessToken("abc");
      expect(apiHelper.getAccessToken()).toBe("abc");
    });

    it("putAccessToken(null) menghapus token", () => {
      apiHelper.putAccessToken("abc");
      apiHelper.putAccessToken(null);
      expect(apiHelper.getAccessToken()).toBeNull();
    });
  });

  describe("fetchData", () => {
    it("memanggil fetch tanpa header Authorization jika tidak ada token", async () => {
      const result = await apiHelper.fetchData("https://api.test/users");

      expect(result).toBe("response");
      expect(fetchMock).toHaveBeenCalledWith("https://api.test/users", {
        mode: "cors",
        headers: {},
      });
    });

    it("menambahkan header Authorization jika ada token", async () => {
      apiHelper.putAccessToken("abc");
      await apiHelper.fetchData("https://api.test/users");

      expect(fetchMock.mock.calls[0][1].headers).toEqual({
        Authorization: "Bearer abc",
      });
    });

    it("menggabungkan header dan opsi dari pemanggil", async () => {
      await apiHelper.fetchData("https://api.test/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(fetchMock).toHaveBeenCalledWith("https://api.test/users", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("membuang garis miring di akhir URL", async () => {
      await apiHelper.fetchData("https://api.test/users/");
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/users");
    });

    it("mempertahankan query dan membuang garis miring sebelum query", async () => {
      await apiHelper.fetchData("https://api.test/users/?page=2");
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/users?page=2");
    });
  });

  describe("buildQuery", () => {
    it("mengembalikan string kosong tanpa argumen", () => {
      expect(apiHelper.buildQuery()).toBe("");
    });

    it("mengembalikan string kosong jika semua nilai kosong", () => {
      expect(
        apiHelper.buildQuery({ a: undefined, b: null, c: "" })
      ).toBe("");
    });

    it("membuat query dan mempertahankan angka 0", () => {
      expect(
        apiHelper.buildQuery({ status: "lost", is_completed: 0, skip: "" })
      ).toBe("?status=lost&is_completed=0");
    });
  });
});