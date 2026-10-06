import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent";

describe("SidebarComponent", () => {
  it("menampilkan seluruh menu navigasi", () => {
    renderWithProviders(<SidebarComponent isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Statistik" })).toHaveAttribute("href", "/#statistik");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Profil Saya" })).toHaveAttribute("href", "/profile");
  });

  it("tersembunyi dan tanpa overlay saat tertutup", () => {
    renderWithProviders(<SidebarComponent isOpen={false} onClose={vi.fn()} />);

    const sidebar = screen.getByRole("complementary", { name: "Menu utama" });
    expect(sidebar).toHaveClass("-translate-x-full");
    expect(sidebar).not.toHaveClass("translate-x-0");
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("tampil dengan overlay saat terbuka", () => {
    renderWithProviders(<SidebarComponent isOpen onClose={vi.fn()} />);

    const sidebar = screen.getByRole("complementary", { name: "Menu utama" });
    expect(sidebar).toHaveClass("translate-x-0");
    expect(sidebar).not.toHaveClass("-translate-x-full");
    expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
  });

  it("memanggil onClose saat overlay diklik", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent isOpen onClose={onClose} />);

    await userEvent.click(screen.getByTestId("sidebar-overlay"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose saat tombol tutup diklik", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent isOpen onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Tutup menu" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose saat sebuah menu dipilih", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent isOpen onClose={onClose} />);

    await userEvent.click(screen.getByRole("link", { name: "Pengguna" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});