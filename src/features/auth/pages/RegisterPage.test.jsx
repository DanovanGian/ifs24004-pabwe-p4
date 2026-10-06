import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi", () => ({
  default: { postRegister: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
    </Routes>,
    { route: "/auth/register" }
  );
}

async function fillForm(user, { name, email, password, confirm }) {
  if (name) await user.type(screen.getByLabelText("Nama"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Kata sandi"), password);
  if (confirm) {
    await user.type(screen.getByLabelText("Konfirmasi kata sandi"), confirm);
  }
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan formulir dan tautan ke halaman masuk", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("menampilkan pesan validasi untuk isian wajib yang kosong", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("menampilkan pesan jika format email tidak valid", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillForm(user, {
      name: "Gian",
      email: "bukan-email",
      password: "rahasia",
      confirm: "rahasia",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("menampilkan pesan jika konfirmasi kata sandi tidak sama", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillForm(user, {
      name: "Gian",
      email: "g@mail.com",
      password: "rahasia",
      confirm: "beda",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(
      screen.getByText("Konfirmasi kata sandi tidak sama")
    ).toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("mendaftar lalu berpindah ke halaman masuk", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockResolvedValue("Berhasil daftar");
    const { store } = renderPage();

    await fillForm(user, {
      name: "Gian",
      email: "g@mail.com",
      password: "rahasia",
      confirm: "rahasia",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(authApi.postRegister).toHaveBeenCalledWith("Gian", "g@mail.com", "rahasia");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil daftar");
    expect(store.getState().isAuthRegister).toBe(false);
  });

  it("menampilkan dialog error dan tetap di halaman jika pendaftaran gagal", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockRejectedValue(new Error("Email dipakai"));
    renderPage();

    await fillForm(user, {
      name: "Gian",
      email: "g@mail.com",
      password: "rahasia",
      confirm: "rahasia",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai")
    );
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
  });
});