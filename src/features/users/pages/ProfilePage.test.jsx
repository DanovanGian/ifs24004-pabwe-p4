import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import {
  getImageUrl,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ProfilePage from "./ProfilePage";

vi.mock("../api/userApi", () => ({
  default: {
    getMe: vi.fn(),
    putMe: vi.fn(),
    postPhoto: vi.fn(),
    putPassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    showErrorDialog: vi.fn(),
    showSuccessDialog: vi.fn(),
  };
});

const profile = { id: 1, name: "Gian", email: "g@mail.com", photo: null };

function setup(currentProfile = profile) {
  return renderWithProviders(<ProfilePage />, {
    preloadedState: { profile: currentProfile, isProfile: true },
  });
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    userApi.getMe.mockResolvedValue(profile);
  });

  it("menampilkan inisial dan mengisi formulir dengan data profil", () => {
    setup();

    expect(screen.getByRole("heading", { name: "Profil Saya" })).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Gian");
    expect(screen.getByLabelText("Email")).toHaveValue("g@mail.com");
  });

  it("menampilkan foto jika profil punya foto", () => {
    setup({ ...profile, photo: "img/gian.png" });

    expect(screen.getByRole("img", { name: "Gian" })).toHaveAttribute(
      "src",
      getImageUrl("img/gian.png")
    );
  });

  it("menyimpan perubahan profil lalu memuat ulang profil", async () => {
    const user = userEvent.setup();
    userApi.putMe.mockResolvedValue("Profil diubah");
    setup();

    const nameInput = screen.getByLabelText("Nama");
    await user.clear(nameInput);
    await user.type(nameInput, "Gian D");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Profil diubah")
    );
    expect(userApi.putMe).toHaveBeenCalledWith("Gian D", "g@mail.com");
    await waitFor(() => expect(userApi.getMe).toHaveBeenCalledTimes(1));
  });

  it("menampilkan dialog error jika perubahan profil gagal", async () => {
    userApi.putMe.mockRejectedValue(new Error("Gagal menyimpan"));
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal menyimpan")
    );
  });

  it("mengunggah foto yang dipilih lalu memuat ulang profil", async () => {
    const user = userEvent.setup();
    userApi.postPhoto.mockResolvedValue("Foto diubah");
    const file = new File(["x"], "foto.png", { type: "image/png" });
    setup();

    await user.upload(screen.getByLabelText("Foto profil"), file);
    await user.click(screen.getByRole("button", { name: "Unggah foto" }));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Foto diubah")
    );
    expect(userApi.postPhoto).toHaveBeenCalledWith(file);
    await waitFor(() => expect(userApi.getMe).toHaveBeenCalledTimes(1));
  });

  it("tidak mengunggah jika belum ada foto yang dipilih", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Unggah foto" }));

    expect(userApi.postPhoto).not.toHaveBeenCalled();
  });

  it("mengganti kata sandi lalu mengosongkan isiannya", async () => {
    const user = userEvent.setup();
    userApi.putPassword.mockResolvedValue("Sandi diubah");
    setup();

    await user.type(screen.getByLabelText("Kata sandi lama"), "lama123");
    await user.type(screen.getByLabelText("Kata sandi baru"), "baru456");
    await user.click(screen.getByRole("button", { name: "Ganti kata sandi" }));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Sandi diubah")
    );
    expect(userApi.putPassword).toHaveBeenCalledWith("lama123", "baru456");
    await waitFor(() =>
      expect(screen.getByLabelText("Kata sandi lama")).toHaveValue("")
    );
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("");
  });

  it("menampilkan dialog error jika ganti kata sandi gagal", async () => {
    const user = userEvent.setup();
    userApi.putPassword.mockRejectedValue(new Error("Sandi lama salah"));
    setup();

    await user.type(screen.getByLabelText("Kata sandi lama"), "salah");
    await user.type(screen.getByLabelText("Kata sandi baru"), "baru456");
    await user.click(screen.getByRole("button", { name: "Ganti kata sandi" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah")
    );
    expect(screen.getByLabelText("Kata sandi lama")).toHaveValue("salah");
  });
});