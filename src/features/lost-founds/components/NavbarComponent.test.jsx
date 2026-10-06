import { useSelector } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import { getImageUrl, showConfirmDialog } from "../../../helpers/toolsHelper";
import NavbarComponent from "./NavbarComponent";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showConfirmDialog: vi.fn() };
});

const profile = { id: 1, name: "Gian", photo: null };

// meniru LostFoundLayout: navbar dilepas saat profil kosong
function NavbarWhileLoggedIn(props) {
  const currentProfile = useSelector((state) => state.profile);
  return currentProfile ? <NavbarComponent {...props} /> : null;
}

function setup(props = {}, currentProfile = profile) {
  return renderWithProviders(
    <NavbarWhileLoggedIn onMenuClick={vi.fn()} {...props} />,
    { preloadedState: { profile: currentProfile, isProfile: true } }
  );
}

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("menampilkan inisial dan status sesi jika belum ada foto", () => {
    setup();

    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("Gian")).toBeInTheDocument();
    expect(screen.getByText("Sesi aktif")).toBeInTheDocument();
  });

  it("menampilkan foto profil jika tersedia", () => {
    setup({}, { ...profile, photo: "img/gian.png" });

    expect(screen.getByRole("img", { name: "Gian" })).toHaveAttribute(
      "src",
      getImageUrl("img/gian.png")
    );
  });

  it("memanggil onMenuClick saat tombol menu ditekan", async () => {
    const onMenuClick = vi.fn();
    setup({ onMenuClick });

    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("membuka dan menutup dropdown profil", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: /Gian/ });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("menutup dropdown saat Profil Saya dipilih", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: /Gian/ }));
    await user.click(screen.getByRole("menuitem", { name: /Profil Saya/ }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keluar dan mengosongkan sesi setelah dikonfirmasi", async () => {
    const user = userEvent.setup();
    localStorage.setItem("accessToken", "abc");
    showConfirmDialog.mockResolvedValue({ isConfirmed: true });
    const { store } = setup();

    await user.click(screen.getByRole("button", { name: /Gian/ }));
    await user.click(screen.getByRole("menuitem", { name: /Keluar/ }));

    await waitFor(() => expect(store.getState().isAuthLogout).toBe(true));
    expect(store.getState().isAuthLogin).toBe(false);
    expect(store.getState().profile).toBeNull();
    expect(store.getState().isProfile).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("tidak keluar jika konfirmasi dibatalkan", async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue({ isConfirmed: false });
    const { store } = setup();

    await user.click(screen.getByRole("button", { name: /Gian/ }));
    await user.click(screen.getByRole("menuitem", { name: /Keluar/ }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(store.getState().isAuthLogout).toBe(false);
    expect(store.getState().profile).toEqual(profile);
  });
});