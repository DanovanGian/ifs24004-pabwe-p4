import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { postCover: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const file = new File(["x"], "cover.png", { type: "image/png" });

function setup(preloadedState = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const utils = renderWithProviders(
    <ChangeCoverModal lostFoundId={5} onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState }
  );
  return { onClose, onSuccess, ...utils };
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("menampilkan dialog tanpa pratinjau di awal", () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Ganti Cover" })).toBeInTheDocument();
    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
  });

  it("menampilkan pesan error jika dikirim tanpa memilih gambar", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Unggah" }));

    expect(screen.getByText("Pilih gambar terlebih dahulu")).toBeInTheDocument();
    expect(lostFoundApi.postCover).not.toHaveBeenCalled();
  });

  it("menampilkan pratinjau setelah gambar dipilih", async () => {
    setup();

    await userEvent.upload(screen.getByLabelText("Pilih gambar"), file);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute("src", "blob:preview");
  });

  it("menghapus pratinjau dan melepas URL saat pilihan dikosongkan", async () => {
    setup();
    const input = screen.getByLabelText("Pilih gambar");

    await userEvent.upload(input, file);
    fireEvent.change(input, { target: { files: [] } });

    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("melepas URL pratinjau saat modal dilepas", async () => {
    const { unmount } = setup();

    await userEvent.upload(screen.getByLabelText("Pilih gambar"), file);
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("tidak melepas URL jika modal dilepas tanpa pratinjau", () => {
    const { unmount } = setup();

    unmount();

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("mengunggah cover, lalu menutup modal dan memanggil onSuccess", async () => {
    const user = userEvent.setup();
    lostFoundApi.postCover.mockResolvedValue("Cover diperbarui");
    const { onClose, onSuccess } = setup();

    await user.upload(screen.getByLabelText("Pilih gambar"), file);
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.postCover).toHaveBeenCalledWith(5, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover diperbarui");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan error dan tidak memanggil onSuccess jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.postCover.mockRejectedValue(new Error("Gagal mengunggah"));
    const { onSuccess } = setup();

    await user.upload(screen.getByLabelText("Pilih gambar"), file);
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengunggah"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses unggah berjalan", () => {
    setup({ isLostFoundChangeCover: true });

    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();
  });

  it("memanggil onClose lewat tombol Batal dan tombol Tutup", async () => {
    const user = userEvent.setup();
    const { onClose } = setup();

    await user.click(screen.getByRole("button", { name: "Batal" }));
    await user.click(screen.getByRole("button", { name: "Tutup" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});