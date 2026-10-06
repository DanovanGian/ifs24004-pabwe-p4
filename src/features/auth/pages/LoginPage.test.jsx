import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import LoginPage from "./LoginPage";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("menampilkan formulir login dan tautan ke halaman daftar", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/auth/register"
    );
  });

  it("menampilkan pesan validasi jika formulir kosong", async () => {
    renderWithProviders(<LoginPage />);

    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("menampilkan pesan jika format email tidak valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata sandi"), "rahasia");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.queryByText("Kata sandi wajib diisi")).not.toBeInTheDocument();
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("masuk dan menyimpan token jika data valid", async () => {
    const user = userEvent.setup();
    authApi.postLogin.mockResolvedValue({ token: "abc" });
    const { store } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "g@mail.com");
    await user.type(screen.getByLabelText("Kata sandi"), "rahasia");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(store.getState().isAuthLogin).toBe(true));
    expect(authApi.postLogin).toHaveBeenCalledWith("g@mail.com", "rahasia");
    expect(localStorage.getItem("accessToken")).toBe("abc");
  });

  it("menampilkan dialog error jika login gagal", async () => {
    const user = userEvent.setup();
    authApi.postLogin.mockRejectedValue(new Error("Kata sandi salah"));
    const { store } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "g@mail.com");
    await user.type(screen.getByLabelText("Kata sandi"), "salah");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi salah")
    );
    expect(store.getState().isAuthLogin).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});