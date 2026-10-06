import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  getImageUrl,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import HomePage from "./HomePage";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getStatsMonthly: vi.fn(),
    deleteLostFound: vi.fn(),
  },
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
vi.mock("../modals/AddModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="add-modal">
      <button onClick={onClose}>Tutup Modal</button>
      <button onClick={onSuccess}>Sukses Modal</button>
    </div>
  ),
}));

const items = [
  {
    id: 1,
    title: "Dompet",
    description: "Warna hitam",
    status: "lost",
    is_completed: 0,
    cover: "img/dompet.png",
    author: { name: "Alice" },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Kunci",
    description: "Kunci motor",
    status: "found",
    is_completed: 1,
    cover: null,
    author: { name: "Budi" },
    created_at: "2024-02-20T08:00:00Z",
  },
];

const stats = {
  stats_losts: { a: 2, b: 3 },
  stats_founds: { a: 1 },
  stats_losts_completed: { a: 1 },
  stats_founds_completed: { a: 1 },
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    lostFoundApi.getLostFounds.mockResolvedValue(items);
    lostFoundApi.getStatsMonthly.mockResolvedValue(stats);
  });

  it("menampilkan daftar laporan lengkap dengan badge, cover, dan pelapor", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");
    const list = screen.getByRole("list");

    expect(within(list).getByRole("img", { name: "Dompet" })).toHaveAttribute(
      "src",
      getImageUrl("img/dompet.png")
    );
    expect(within(list).getByText("Tidak ada foto")).toBeInTheDocument();
    expect(within(list).getByText("Hilang")).toBeInTheDocument();
    expect(within(list).getByText("Dalam proses")).toBeInTheDocument();
    expect(within(list).getByText("Ditemukan")).toBeInTheDocument();
    expect(within(list).getByText("Selesai")).toBeInTheDocument();
    expect(within(list).getByText("Warna hitam")).toBeInTheDocument();
    expect(within(list).getByText(/Alice •/)).toBeInTheDocument();
    expect(within(list).getByText(/Budi •/)).toBeInTheDocument();

    const links = within(list).getAllByRole("link", { name: "Lihat detail" });
    expect(links[0]).toHaveAttribute("href", "/lost-founds/1");
    expect(links[1]).toHaveAttribute("href", "/lost-founds/2");
  });

  it("memuat daftar dan statistik tanpa filter saat dibuka", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({
      status: "",
      is_completed: "",
      is_me: "",
    });
    expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledTimes(1);
  });

  it("menjumlahkan statistik menjadi empat kartu ringkasan", async () => {
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "Statistik" });

    await waitFor(() =>
      expect(within(section).getByText("Total").parentElement).toHaveTextContent(/^Total6$/)
    );
    expect(within(section).getByText("Barang Hilang").parentElement).toHaveTextContent(/^Barang Hilang5$/);
    expect(within(section).getByText("Barang Ditemukan").parentElement).toHaveTextContent(/^Barang Ditemukan1$/);
    expect(within(section).getByText("Selesai").parentElement).toHaveTextContent(/^Selesai2$/);
  });

  it("menampilkan angka nol dan dialog error jika statistik gagal dimuat", async () => {
    lostFoundApi.getStatsMonthly.mockRejectedValue(new Error("Statistik gagal"));
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "Statistik" });

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Statistik gagal")
    );
    expect(within(section).getByText("Total").parentElement).toHaveTextContent(/^Total0$/);
    expect(within(section).getByText("Selesai").parentElement).toHaveTextContent(/^Selesai0$/);
  });

  it("memfilter berdasarkan jenis laporan lewat API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.selectOptions(screen.getByLabelText("Filter jenis"), "lost");

    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "lost",
        is_completed: "",
        is_me: "",
      })
    );
  });

  it("memfilter berdasarkan status selesai lewat API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.selectOptions(screen.getByLabelText("Filter status selesai"), "1");

    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "",
        is_completed: "1",
        is_me: "",
      })
    );
  });

  it("memfilter laporan milik sendiri lewat API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.click(screen.getByLabelText("Laporan saya"));

    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: "",
        is_completed: "",
        is_me: 1,
      })
    );
  });

  it("mencari laporan berdasarkan judul", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.type(screen.getByLabelText("Cari laporan"), "kunci");

    expect(screen.queryByText("Dompet")).not.toBeInTheDocument();
    expect(screen.getByText("Kunci")).toBeInTheDocument();
  });

  it("mencari laporan berdasarkan deskripsi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.type(screen.getByLabelText("Cari laporan"), "hitam");

    expect(screen.getByText("Dompet")).toBeInTheDocument();
    expect(screen.queryByText("Kunci")).not.toBeInTheDocument();
  });

  it("menampilkan pesan jika tidak ada laporan yang cocok", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.type(screen.getByLabelText("Cari laporan"), "zzz");

    expect(screen.getByText("Belum ada laporan.")).toBeInTheDocument();
  });

  it("menampilkan dialog error dan daftar kosong jika pemuatan gagal", async () => {
    lostFoundApi.getLostFounds.mockRejectedValue(new Error("Gagal memuat"));
    renderWithProviders(<HomePage />);

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat")
    );
    expect(screen.getByText("Belum ada laporan.")).toBeInTheDocument();
  });

  it("menghapus laporan setelah dikonfirmasi lalu memuat ulang data", async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.deleteLostFound.mockResolvedValue("Laporan dihapus");
    const { store } = renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.click(screen.getByRole("button", { name: "Hapus Dompet" }));

    await waitFor(() =>
      expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith(1)
    );
    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(2)
    );
    expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledTimes(2);
    expect(store.getState().isLostFoundDeleted).toBe(false);
  });

  it("tidak menghapus jika konfirmasi dibatalkan", async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue({ isConfirmed: false });
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    await user.click(screen.getByRole("button", { name: "Hapus Dompet" }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
  });

  it("membuka, menutup, dan memuat ulang data dari modal tambah", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tambah Laporan" }));
    expect(screen.getByTestId("add-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tutup Modal" }));
    expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tambah Laporan" }));
    await user.click(screen.getByRole("button", { name: "Sukses Modal" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(2)
    );
    expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledTimes(2);
  });

  it("menggulir ke bagian statistik jika alamat memuat #statistik", async () => {
    renderWithProviders(<HomePage />, { route: "/#statistik" });
    await screen.findByText("Dompet");

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("tidak menggulir jika alamat tanpa #statistik", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet");

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});