import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import App from "./App";

vi.mock("./features/auth/layouts/AuthLayout", async () => {
  const { Outlet } = await import("react-router-dom");
  return {
    default: () => (
      <div>
        <p>Layout Auth</p>
        <Outlet />
      </div>
    ),
  };
});
vi.mock("./features/lost-founds/layouts/LostFoundLayout", async () => {
  const { Outlet } = await import("react-router-dom");
  return {
    default: () => (
      <div>
        <p>Layout Dashboard</p>
        <Outlet />
      </div>
    ),
  };
});
vi.mock("./features/auth/pages/LoginPage", () => ({
  default: () => <p>Halaman Login</p>,
}));
vi.mock("./features/auth/pages/RegisterPage", () => ({
  default: () => <p>Halaman Register</p>,
}));
vi.mock("./features/lost-founds/pages/HomePage", () => ({
  default: () => <p>Halaman Beranda</p>,
}));
vi.mock("./features/lost-founds/pages/DetailPage", () => ({
  default: () => <p>Halaman Detail</p>,
}));
vi.mock("./features/users/pages/UsersPage", () => ({
  default: () => <p>Halaman Pengguna</p>,
}));
vi.mock("./features/users/pages/ProfilePage", () => ({
  default: () => <p>Halaman Profil</p>,
}));

describe("App", () => {
  it.each([
    ["/auth/login", "Layout Auth", "Halaman Login"],
    ["/auth/register", "Layout Auth", "Halaman Register"],
    ["/", "Layout Dashboard", "Halaman Beranda"],
    ["/lost-founds/1", "Layout Dashboard", "Halaman Detail"],
    ["/users", "Layout Dashboard", "Halaman Pengguna"],
    ["/profile", "Layout Dashboard", "Halaman Profil"],
  ])("rute %s menampilkan %s dan %s", (route, layout, page) => {
    renderWithProviders(<App />, { route });

    expect(screen.getByText(layout)).toBeInTheDocument();
    expect(screen.getByText(page)).toBeInTheDocument();
  });

  it("rute auth tidak memakai layout dashboard", () => {
    renderWithProviders(<App />, { route: "/auth/login" });

    expect(screen.queryByText("Layout Dashboard")).not.toBeInTheDocument();
  });
});
