import { beforeEach, describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import userApi from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: { fetchData: vi.fn() },
}));

const BASE = `${DELCOM_BASEURL}/users`;
const mockResponse = (body) =>
  apiHelper.fetchData.mockResolvedValue({ json: async () => body });

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getUsers mengembalikan daftar pengguna", async () => {
    mockResponse({ status: "success", data: { users: [{ id: 1 }] } });

    expect(await userApi.getUsers()).toEqual([{ id: 1 }]);
    expect(apiHelper.fetchData).toHaveBeenCalledWith(BASE, {});
  });

  it("getUsers melempar pesan server saat gagal", async () => {
    mockResponse({ status: "fail", message: "Tidak diizinkan" });

    await expect(userApi.getUsers()).rejects.toThrow("Tidak diizinkan");
  });

  it("getMe mengembalikan profil", async () => {
    mockResponse({ status: "success", data: { user: { id: 7 } } });

    expect(await userApi.getMe()).toEqual({ id: 7 });
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/me`, {});
  });

  it("putMe mengirim nama dan email", async () => {
    mockResponse({ status: "success", message: "Profil diubah" });

    expect(await userApi.putMe("Gian", "g@mail.com")).toBe("Profil diubah");
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Gian", email: "g@mail.com" }),
    });
  });

  it("postPhoto mengunggah file lewat FormData", async () => {
    mockResponse({ status: "success", message: "Foto diubah" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    expect(await userApi.postPhoto(file)).toBe("Foto diubah");

    const [url, options] = apiHelper.fetchData.mock.calls[0];
    expect(url).toBe(`${BASE}/me/photo`);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo")).toBe(file);
  });

  it("putPassword mengirim kata sandi lama dan baru", async () => {
    mockResponse({ status: "success", message: "Sandi diubah" });

    expect(await userApi.putPassword("lama", "baru")).toBe("Sandi diubah");
    expect(apiHelper.fetchData).toHaveBeenCalledWith(`${BASE}/me/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "lama", new_password: "baru" }),
    });
  });
});