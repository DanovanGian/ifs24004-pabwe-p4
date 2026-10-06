import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  getImageUrl,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import DetailPage from "./DetailPage";

vi.mock("../api/lostFoundApi", () => ({
  default: { getLostFound: vi.fn(), deleteLostFound: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
    showErrorDialog: vi.fn(),
    showSuccessDialog: vi.fn(),
  };
});
vi.mock("../modals/ChangeModal", () => ({
  default: ({ lostFound, onClose, onSuccess }) => (
    <div data-testid="change-modal">
      <span>Ubah: {lostFound.title}</span>
      <button onClick={onClose}>Tutup Ubah</button>
      <button onClick={onSuccess}>Sukses Ubah</button>
    </div>
  ),
}));
vi.mock("../modals/ChangeCoverModal", () => ({
  default: ({ lostFoundId, onClose, onSuccess }) => (
    <div data-testid="cover-modal">
      <span>Cover: {lostFoundId}</span>
      <button onClick={onClose}>Tutup Cover</button>
      <button onClick={onSuccess}>Sukses Cover</button>
    </div>
  ),
}));

const lostItem = {
  id: 5,
  title: "Dompet",
  description: "Warna hitam",
  status: "lost",
  is_completed: 0,
  cover: "img/dompet.png",
  author: { name: "Alice" },
  created_at: "2024-01-15T10:00:00Z",
};

const foundItem = {
  ...lostItem,
  title: "Kunci",
  status: "found",
  is_completed: 1,
  cover: null,
};

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route: "/lost-founds/5" }
  );
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lostFoundApi.getLostFound.mockResolvedValue(lostItem);
  });

  it("menampilkan status memuat sebelum data tiba", () => {
    lostFoundApi.getLostFound.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText("Memuat laporan...")).toBeInTheDocument();
  });

  it("memuat laporan berdasarkan id dari alamat", async () => {
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    expect(lostFoundApi.getLostFound).toHaveBeenCalledWith("5");
  });

  it("menampilkan rincian laporan hilang yang belum selesai", async () => {
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    expect(screen.getByRole("img", { name: "Dompet" })).toHaveAttribute(
      "src",
      getImageUrl("img/dompet.png")
    );
    expect(screen.getByText("Barang hilang")).toBeInTheDocument();
    expect(screen.getByText("Dalam proses")).toBeInTheDocument();
    expect(screen.getByText("Warna hitam")).toBeInTheDocument();
    expect(screen.getByText(/Dilaporkan oleh Alice/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali/ })).toHaveAttribute("href", "/");
  });

  it("menampilkan rincian laporan temuan yang sudah selesai tanpa cover", async () => {
    lostFoundApi.getLostFound.mockResolvedValue(foundItem);
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Kunci" });

    expect(screen.getByText("Tidak ada foto")).toBeInTheDocument();
    expect(screen.getByText("Barang ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
  });

  it("menampilkan pesan dan dialog error jika laporan tidak ditemukan", async () => {
    lostFoundApi.getLostFound.mockRejectedValue(new Error("Tidak ada"));
    renderPage();

    expect(await screen.findByText("Laporan tidak ditemukan.")).toBeInTheDocument();
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ada");
    expect(screen.getByRole("link", { name: "Kembali ke beranda" })).toHaveAttribute("href", "/");
  });

  it("membuka dan menutup modal ubah data", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    expect(screen.queryByTestId("change-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ubah data" }));
    expect(screen.getByText("Ubah: Dompet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tutup Ubah" }));
    expect(screen.queryByTestId("change-modal")).not.toBeInTheDocument();
  });

  it("memuat ulang laporan setelah modal ubah data berhasil", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    await user.click(screen.getByRole("button", { name: "Ubah data" }));
    await user.click(screen.getByRole("button", { name: "Sukses Ubah" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFound).toHaveBeenCalledTimes(2)
    );
  });

  it("membuka dan menutup modal ganti cover", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    expect(screen.queryByTestId("cover-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ganti cover" }));
    expect(screen.getByText("Cover: 5")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tutup Cover" }));
    expect(screen.queryByTestId("cover-modal")).not.toBeInTheDocument();
  });

  it("memuat ulang laporan setelah modal ganti cover berhasil", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    await user.click(screen.getByRole("button", { name: "Ganti cover" }));
    await user.click(screen.getByRole("button", { name: "Sukses Cover" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFound).toHaveBeenCalledTimes(2)
    );
  });

  it("menghapus laporan setelah dikonfirmasi lalu kembali ke beranda", async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.deleteLostFound.mockResolvedValue("Laporan dihapus");
    const { store } = renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    await user.click(screen.getByRole("button", { name: "Hapus" }));

    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith("5");
    expect(store.getState().isLostFoundDeleted).toBe(false);
  });

  it("tidak menghapus jika konfirmasi dibatalkan", async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue({ isConfirmed: false });
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Dompet" });

    await user.click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(screen.queryByText("Beranda")).not.toBeInTheDocument();
  });
});