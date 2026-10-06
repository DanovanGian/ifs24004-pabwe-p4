import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout";

function renderLayout(preloadedState = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<p>Halaman Login</p>} />
      </Route>
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route: "/auth/login", preloadedState }
  );
}

describe("AuthLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("menampilkan banner dan halaman anak untuk pengguna yang belum masuk", () => {
    renderLayout();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Barangmu hilang/
    );
    expect(screen.getByText("Delcom Open API")).toBeInTheDocument();
    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika state login aktif", () => {
    renderLayout({ isAuthLogin: true });

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika token sudah tersimpan", () => {
    localStorage.setItem("accessToken", "abc");
    renderLayout();

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
  });
});