import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { asyncSetProfile } from "../../users/states/action";
import LostFoundLayout from "./LostFoundLayout";

vi.mock("../../users/states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    asyncSetProfile: vi.fn(() => ({ type: "TEST/LOAD_PROFILE" })),
  };
});
vi.mock("../components/NavbarComponent", () => ({
    default: ({ onMenuClick }) => (
        <button onClick={onMenuClick}>Buka Sidebar</button>
    ),
}));
vi.mock("../components/SidebarComponent", () => ({
    default: ({ isOpen, onClose }) => (
        <div data-testid="sidebar" data-open={String(isOpen)}>
            <button onClick={onClose}>Tutup Sidebar</button>
        </div>
    ),
}));

function renderLayout(preloadedState = {}) {
    return renderWithProviders(
        <Routes>
            <Route path="/auth/login" element={<p>Halaman Login</p>} />
            <Route path="/" element={<LostFoundLayout />}>
                <Route index element={<p>Isi Halaman</p>} />
            </Route>
        </Routes>,
        { route: "/", preloadedState }
    );
}

describe("LostFoundLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("mengalihkan ke login jika tidak ada token", () => {
        renderLayout();

        expect(screen.getByText("Halaman Login")).toBeInTheDocument();
        expect(asyncSetProfile).not.toHaveBeenCalled();
    });

    it("memuat profil dan menampilkan status memuat saat sesi belum siap", () => {
        localStorage.setItem("accessToken", "abc");
        renderLayout({ isProfile: false });

        expect(screen.getByText("Memuat sesi...")).toBeInTheDocument();
        expect(asyncSetProfile).toHaveBeenCalledTimes(1);
    });

    it("mengalihkan ke login jika profil gagal dimuat", () => {
        localStorage.setItem("accessToken", "abc");
        renderLayout({ isProfile: true, profile: null });

        expect(screen.getByText("Halaman Login")).toBeInTheDocument();
        expect(asyncSetProfile).not.toHaveBeenCalled();
    });

    it("menampilkan navbar, sidebar, dan konten saat sesi valid", () => {
        localStorage.setItem("accessToken", "abc");
        renderLayout({ isProfile: true, profile: { id: 1, name: "Gian" } });

        expect(screen.getByText("Isi Halaman")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Buka Sidebar" })).toBeInTheDocument();
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("membuka dan menutup sidebar", async () => {
        const user = userEvent.setup();
        localStorage.setItem("accessToken", "abc");
        renderLayout({ isProfile: true, profile: { id: 1, name: "Gian" } });

        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");

        await user.click(screen.getByRole("button", { name: "Buka Sidebar" }));
        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

        await user.click(screen.getByRole("button", { name: "Tutup Sidebar" }));
        expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
    });
});