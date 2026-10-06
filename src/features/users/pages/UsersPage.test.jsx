import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import { getImageUrl, showErrorDialog } from "../../../helpers/toolsHelper";
import UsersPage from "./UsersPage";

vi.mock("../api/userApi", () => ({
  default: { getUsers: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showErrorDialog: vi.fn() };
});

const users = [
  { id: 1, name: "Alice", email: "alice@mail.com", photo: "img/alice.png" },
  { id: 2, name: "Budi", email: "budi@mail.com", photo: null },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getUsers.mockResolvedValue(users);
  });

  it("memuat dan menampilkan daftar pengguna", async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@mail.com")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("budi@mail.com")).toBeInTheDocument();
  });

  it("menampilkan foto jika ada dan inisial jika tidak ada", async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByRole("img", { name: "Alice" })).toHaveAttribute(
      "src",
      getImageUrl("img/alice.png")
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("menyaring pengguna lewat kolom pencarian", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await screen.findByText("Alice");

    await user.type(screen.getByLabelText("Cari pengguna"), "bud");

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("menampilkan pesan jika tidak ada pengguna yang cocok", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await screen.findByText("Alice");

    await user.type(screen.getByLabelText("Cari pengguna"), "zzz");

    expect(screen.getByText("Tidak ada pengguna ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan dialog error jika pemuatan gagal", async () => {
    userApi.getUsers.mockRejectedValue(new Error("Gagal memuat"));
    renderWithProviders(<UsersPage />);

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat")
    );
    expect(screen.getByText("Tidak ada pengguna ditemukan.")).toBeInTheDocument();
  });
});