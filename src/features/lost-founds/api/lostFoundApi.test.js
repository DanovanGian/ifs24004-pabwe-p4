import { beforeEach, describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import lostFoundApi from "./lostFoundApi";

// buildQuery tetap asli, hanya fetchData yang di-mock
vi.mock("../../../helpers/apiHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { default: { ...actual.default, fetchData: vi.fn() } };
});

const BASE = `${DELCOM_BASEURL}/lost-founds`;
const mockResponse = (body) =>
  apiHelper.fetchData.mockResolvedValue({ json: async () => body });
const JSON_HEADERS = { "Content-Type": "application/json" };

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLostFounds", () => {
    it("mengambil daftar tanpa filter", async () => {
      mockResponse({ status: "success", data: { lost_founds: [{ id: 1 }] } });

      expect(await lostFoundApi.getLostFounds()).toEqual([{ id: 1 }]);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(BASE, {});
    });

    it("menambahkan filter ke query dan membuang yang kosong", async () => {
      mockResponse({ status: "success", data: { lost_founds: [] } });

      await lostFoundApi.getLostFounds({
        status: "lost",
        is_completed: 0,
        is_me: "",
      });

      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        `${BASE}?status=lost&is_completed=0`,
        {}
      );
    });

    it("melempar pesan server saat gagal", async () => {
      mockResponse({ status: "fail", message: "Gagal memuat" });

      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Gagal memuat");
    });
  });

  it("getLostFound mengambil detail berdasarkan id", async () => {
    mockResponse({ status: "success", data: { lost_found: { id: 5 } } });

    expect(await lostFoundApi.getLostFound(5)).toEqual({ id: 5 });
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/5`, {});
  });

  it("postLostFound mengirim laporan baru", async () => {
    mockResponse({ status: "success", message: "Ditambahkan" });

    expect(await lostFoundApi.postLostFound("Dompet", "Warna hitam", "lost")).toBe(
      "Ditambahkan"
    );
    expect(apiHelper.fetchData).toHaveBeenCalledWith(BASE, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        title: "Dompet",
        description: "Warna hitam",
        status: "lost",
      }),
    });
  });

  it("putLostFound mengirim perubahan beserta status selesai", async () => {
    mockResponse({ status: "success", message: "Diubah" });

    expect(
      await lostFoundApi.putLostFound(5, "Dompet", "Hitam", "found", 1)
    ).toBe("Diubah");
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/5`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        title: "Dompet",
        description: "Hitam",
        status: "found",
        is_completed: 1,
      }),
    });
  });

  it("postCover mengunggah cover lewat FormData", async () => {
    mockResponse({ status: "success", message: "Cover diubah" });
    const file = new File(["x"], "cover.png", { type: "image/png" });

    expect(await lostFoundApi.postCover(5, file)).toBe("Cover diubah");

    const [url, options] = apiHelper.fetchData.mock.calls[0];
    expect(url).toBe(`${BASE}/5/cover`);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("cover")).toBe(file);
  });

  it("deleteLostFound menghapus laporan", async () => {
    mockResponse({ status: "success", message: "Dihapus" });

    expect(await lostFoundApi.deleteLostFound(5)).toBe("Dihapus");
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/5`, {
      method: "DELETE",
    });
  });

  describe("statistik", () => {
    it("getStatsDaily tanpa parameter", async () => {
      mockResponse({ status: "success", data: { total: 3 } });

      expect(await lostFoundApi.getStatsDaily()).toEqual({ total: 3 });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/stats/daily`, {});
    });

    it("getStatsDaily dengan parameter", async () => {
      mockResponse({ status: "success", data: {} });

      await lostFoundApi.getStatsDaily({ total_data: 7 });

      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        `${BASE}/stats/daily?total_data=7`,
        {}
      );
    });

    it("getStatsMonthly tanpa parameter", async () => {
      mockResponse({ status: "success", data: { total: 9 } });

      expect(await lostFoundApi.getStatsMonthly()).toEqual({ total: 9 });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/stats/monthly`, {});
    });

    it("getStatsMonthly dengan parameter", async () => {
      mockResponse({ status: "success", data: {} });

      await lostFoundApi.getStatsMonthly({ total_data: 6 });

      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        `${BASE}/stats/monthly?total_data=6`,
        {}
      );
    });
  });
});