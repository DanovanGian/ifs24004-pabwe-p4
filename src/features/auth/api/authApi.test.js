import { beforeEach, describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import authApi from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: { fetchData: vi.fn() },
}));

const BASE = `${DELCOM_BASEURL}/auth`;
const mockResponse = (body) =>
  apiHelper.fetchData.mockResolvedValue({ json: async () => body });

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postRegister", () => {
    it("mengirim data dan mengembalikan pesan saat sukses", async () => {
      mockResponse({ status: "success", message: "Berhasil daftar" });

      const message = await authApi.postRegister("Gian", "g@mail.com", "rahasia");

      expect(message).toBe("Berhasil daftar");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Gian",
          email: "g@mail.com",
          password: "rahasia",
        }),
      });
    });

    it("menambahkan detail validasi ke pesan error", async () => {
      mockResponse({
        status: "fail",
        message: "Validasi gagal",
        data: { email: ["Email dipakai"], password: ["Terlalu pendek"] },
      });

      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Validasi gagal: Email dipakai, Terlalu pendek"
      );
    });

    it("memakai pesan dasar jika data kosong", async () => {
      mockResponse({ status: "fail", message: "Validasi gagal", data: null });

      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Validasi gagal"
      );
    });

    it("memakai pesan dasar jika data bukan objek", async () => {
      mockResponse({ status: "fail", message: "Ditolak", data: "teks" });

      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Ditolak"
      );
    });

    it("memakai pesan bawaan jika server tidak mengirim pesan", async () => {
      mockResponse({ status: "fail" });

      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Gagal melakukan pendaftaran"
      );
    });
  });

  describe("postLogin", () => {
    it("mengembalikan data saat sukses", async () => {
      mockResponse({ status: "success", data: { token: "abc" } });

      const data = await authApi.postLogin("g@mail.com", "rahasia");

      expect(data).toEqual({ token: "abc" });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "g@mail.com", password: "rahasia" }),
      });
    });

    it("melempar pesan dari server saat gagal", async () => {
      mockResponse({ status: "fail", message: "Kata sandi salah" });

      await expect(authApi.postLogin("a", "b")).rejects.toThrow(
        "Kata sandi salah"
      );
    });

    it("memakai pesan bawaan jika server tidak mengirim pesan", async () => {
      mockResponse({ status: "fail" });

      await expect(authApi.postLogin("a", "b")).rejects.toThrow("Gagal login");
    });
  });
});