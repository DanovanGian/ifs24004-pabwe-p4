import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  getImageUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(), close: vi.fn() },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.each([
    ["showErrorDialog", showErrorDialog, "error"],
    ["showWarningDialog", showWarningDialog, "warning"],
    ["showSuccessDialog", showSuccessDialog, "success"],
  ])("%s", (_name, dialog, icon) => {
    it("menampilkan dialog lalu menutupnya saat dikonfirmasi", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      const result = await dialog("pesan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: "pesan", icon })
      );
      expect(Swal.close).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ isConfirmed: true });
    });

    it("tidak memanggil Swal.close jika dialog ditutup tanpa konfirmasi", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });

      const result = await dialog("pesan");

      expect(Swal.close).not.toHaveBeenCalled();
      expect(result).toEqual({ isConfirmed: false });
    });
  });

  describe("showConfirmDialog", () => {
    it("menampilkan dialog konfirmasi dan mengembalikan hasilnya", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      const result = await showConfirmDialog("Yakin?");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Yakin?",
          icon: "question",
          showCancelButton: true,
        })
      );
      expect(result).toEqual({ isConfirmed: true });
    });
  });

  describe("formatDate", () => {
    it("mengembalikan tanda minus jika tanggal kosong", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
    });

    it("memformat tanggal yang valid ke bahasa Indonesia", () => {
      const result = formatDate(new Date(2024, 0, 15, 10, 30));

      expect(result).toContain("2024");
      expect(result).toContain("Januari");
    });
  });

  describe("getImageUrl", () => {
    it("mengembalikan null jika path kosong", () => {
      expect(getImageUrl(null)).toBeNull();
      expect(getImageUrl("")).toBeNull();
    });

    it("membentuk URL lengkap dari path relatif", () => {
      const origin = DELCOM_BASEURL.replace("/api/v1", "");
      expect(getImageUrl("img/foto.png")).toBe(`${origin}/img/foto.png`);
    });
  });
});