import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import AddModal from "./AddModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { postLostFound: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

function setup(preloadedState = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const utils = renderWithProviders(
    <AddModal onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState }
  );
  return { onClose, onSuccess, ...utils };
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan formulir dengan jenis laporan bawaan 'hilang'", () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Tambah Laporan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Jenis laporan")).toHaveValue("lost");
  });

  it("menampilkan pesan validasi dan tidak mengirim jika formulir kosong", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(lostFoundApi.postLostFound).not.toHaveBeenCalled();
  });

  it("hanya menampilkan error deskripsi jika judul sudah diisi", async () => {
    const user = userEvent.setup();
    setup();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.queryByText("Judul wajib diisi")).not.toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
  });

  it("mengirim laporan, lalu menutup modal dan memanggil onSuccess", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFound.mockResolvedValue("Laporan ditambahkan");
    const { onClose, onSuccess } = setup();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.selectOptions(screen.getByLabelText("Jenis laporan"), "found");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.postLostFound).toHaveBeenCalledWith("Dompet", "Warna hitam", "found");
    expect(showSuccessDialog).toHaveBeenCalledWith("Laporan ditambahkan");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan error dan tidak memanggil onSuccess jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFound.mockRejectedValue(new Error("Gagal menyimpan"));
    const { onSuccess } = setup();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal menyimpan"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses penyimpanan berjalan", () => {
    setup({ isLostFoundAdd: true });

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