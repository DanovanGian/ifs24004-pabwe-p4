
import { beforeEach, describe, expect, it, vi } from "vitest";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsAuthLogin,
  asyncSetIsAuthLogout,
  asyncSetIsAuthRegister,
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from "./action";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));
vi.mock("../../../helpers/apiHelper", () => ({
  default: { putAccessToken: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("auth action creators", () => {
  it.each([
    [setIsAuthLoginActionCreator, ActionType.SET_IS_AUTH_LOGIN, "isAuthLogin"],
    [setIsAuthRegisterActionCreator, ActionType.SET_IS_AUTH_REGISTER, "isAuthRegister"],
    [setIsAuthLogoutActionCreator, ActionType.SET_IS_AUTH_LOGOUT, "isAuthLogout"],
  ])("membuat action dengan type dan payload yang benar", (creator, type, key) => {
    expect(creator(true)).toEqual({ type, payload: { [key]: true } });
  });
});

describe("auth thunks", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("asyncSetIsAuthLogin", () => {
    it("menyimpan token lalu menandai login berhasil", async () => {
      authApi.postLogin.mockResolvedValue({ token: "abc" });

      await asyncSetIsAuthLogin("g@mail.com", "rahasia")(dispatch);

      expect(authApi.postLogin).toHaveBeenCalledWith("g@mail.com", "rahasia");
      expect(apiHelper.putAccessToken).toHaveBeenCalledWith("abc");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsAuthLogoutActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsAuthLoginActionCreator(true));
    });

    it("menampilkan error dan menandai login gagal", async () => {
      authApi.postLogin.mockRejectedValue(new Error("Sandi salah"));

      await asyncSetIsAuthLogin("a", "b")(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Sandi salah");
      expect(apiHelper.putAccessToken).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("menampilkan dialog sukses dan menandai register berhasil", async () => {
      authApi.postRegister.mockResolvedValue("Berhasil daftar");

      await asyncSetIsAuthRegister("Gian", "g@mail.com", "rahasia")(dispatch);

      expect(authApi.postRegister).toHaveBeenCalledWith("Gian", "g@mail.com", "rahasia");
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil daftar");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    });

    it("menampilkan error dan menandai register gagal", async () => {
      authApi.postRegister.mockRejectedValue(new Error("Email dipakai"));

      await asyncSetIsAuthRegister("a", "b", "c")(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(false));
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("menghapus token dan menandai logout", async () => {
      await asyncSetIsAuthLogout()(dispatch);

      expect(apiHelper.putAccessToken).toHaveBeenCalledWith(null);
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsAuthLoginActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsAuthLogoutActionCreator(true));
    });
  });
});
