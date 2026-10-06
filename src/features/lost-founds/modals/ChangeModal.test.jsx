import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ChangeModal from "./ChangeModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { putLostFound: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const lostFound = {
  id: 5,
  title: "Dompet",
  description: "Hitam",
  status: "lost",
  is_completed: 0,
};

function setup(item = lostFound, preloadedState = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const utils = renderWithProviders(
    <ChangeModal lostFound={item} onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState }
  );
  return { onClose, onSuccess, ...utils };
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("terisi data laporan yang sedang diubah", () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Ubah Laporan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Dompet");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Hitam");
    expect(screen.getByLabelText("Jenis laporan")).toHaveValue("lost");
    expect(screen.getByLabelText("Tandai sudah selesai")).not.toBeChecked();
  });

  it("mencentang kotak selesai jika laporan sudah selesai", () => {
    setup({ ...lostFound, is_completed: 1 });

    expect(screen.getByLabelText("Tandai sudah selesai")).toBeChecked();
  });

  it("menampilkan pesan validasi jika judul dan deskripsi dikosongkan", async () => {
    const user = userEvent.setup();
    setup();

    await user.clear(screen.getByLabelText("Judul"));
    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(lostFoundApi.putLostFound).not.toHaveBeenCalled();
  });

  it("mengirim data tanpa perubahan dengan status selesai 0", async () => {
    const user = userEvent.setup();
    lostFoundApi.putLostFound.mockResolvedValue("Laporan diubah");
    const { onClose, onSuccess } = setup();

    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.putLostFound).toHaveBeenCalledWith(5, "Dompet", "Hitam", "lost", 0);
    expect(showSuccessDialog).toHaveBeenCalledWith("Laporan diubah");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mengirim perubahan dengan status selesai 1", async () => {
    const user = userEvent.setup();
    lostFoundApi.putLostFound.mockResolvedValue("Laporan diubah");
    const { onSuccess } = setup();

    await user.selectOptions(screen.getByLabelText("Jenis laporan"), "found");
    await user.click(screen.getByLabelText("Tandai sudah selesai"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.putLostFound).toHaveBeenCalledWith(5, "Dompet", "Hitam", "found", 1);
  });

  it("menampilkan error dan tidak memanggil onSuccess jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.putLostFound.mockRejectedValue(new Error("Gagal mengubah"));
    const { onSuccess } = setup();

    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengubah"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses perubahan berjalan", () => {
    setup(lostFound, { isLostFoundChange: true });

    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });

  it("memanggil onClose lewat tombol Batal dan tombol Tutup", async () => {
    const user = userEvent.setup();
    const { onClose } = setup();

    await user.click(screen.getByRole("button", { name: "Batal" }));
    await user.click(screen.getByRole("button", { name: "Tutup" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});