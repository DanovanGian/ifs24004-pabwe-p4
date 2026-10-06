import { beforeEach, describe, expect, it, vi } from "vitest";
import userApi from "../api/userApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePassword,
  asyncSetIsChangeProfilePhoto,
  asyncSetProfile,
  asyncSetUsers,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePasswordActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsProfileActionCreator,
  setProfileActionCreator,
  setUserActionCreator,
  setUsersActionCreator,
} from "./action";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getMe: vi.fn(),
    putMe: vi.fn(),
    postPhoto: vi.fn(),
    putPassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/apiHelper", () => ({
  default: { putAccessToken: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("users action creators", () => {
  it.each([
    [setUsersActionCreator, ActionType.SET_USERS, "users"],
    [setUserActionCreator, ActionType.SET_USER, "user"],
    [setProfileActionCreator, ActionType.SET_PROFILE, "profile"],
    [setIsProfileActionCreator, ActionType.SET_IS_PROFILE, "isProfile"],
    [setIsChangeProfileActionCreator, ActionType.SET_IS_CHANGE_PROFILE, "isChangeProfile"],
    [setIsChangeProfilePhotoActionCreator, ActionType.SET_IS_CHANGE_PROFILE_PHOTO, "isChangeProfilePhoto"],
    [setIsChangeProfilePasswordActionCreator, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, "isChangeProfilePassword"],
  ])("membuat action dengan type dan payload yang benar", (creator, type, key) => {
    expect(creator("nilai")).toEqual({ type, payload: { [key]: "nilai" } });
  });
});

describe("users thunks", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("asyncSetUsers", () => {
    it("menyimpan daftar pengguna", async () => {
      userApi.getUsers.mockResolvedValue([{ id: 1 }]);

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([{ id: 1 }]));
    });

    it("menampilkan error saat gagal", async () => {
      userApi.getUsers.mockRejectedValue(new Error("Gagal"));

      await asyncSetUsers()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("asyncSetProfile", () => {
    it("menyimpan profil dan menandai selesai dimuat", async () => {
      userApi.getMe.mockResolvedValue({ id: 7 });

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, setProfileActionCreator({ id: 7 }));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsProfileActionCreator(true));
      expect(apiHelper.putAccessToken).not.toHaveBeenCalled();
    });

    it("menghapus token dan profil saat gagal, tetap menandai selesai", async () => {
      userApi.getMe.mockRejectedValue(new Error("Token kedaluwarsa"));

      await asyncSetProfile()(dispatch);

      expect(apiHelper.putAccessToken).toHaveBeenCalledWith(null);
      expect(dispatch).toHaveBeenNthCalledWith(1, setProfileActionCreator(null));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsProfileActionCreator(true));
    });
  });

  describe.each([
    ["asyncSetIsChangeProfile", () => asyncSetIsChangeProfile("Gian", "g@mail.com"), "putMe", setIsChangeProfileActionCreator, true],
    ["asyncSetIsChangeProfilePhoto", () => asyncSetIsChangeProfilePhoto("file"), "postPhoto", setIsChangeProfilePhotoActionCreator, true],
    ["asyncSetIsChangeProfilePassword", () => asyncSetIsChangeProfilePassword("lama", "baru"), "putPassword", setIsChangeProfilePasswordActionCreator, false],
  ])("%s", (_name, makeThunk, apiMethod, creator, reloadsProfile) => {
    it("menampilkan dialog sukses dan menandai berhasil", async () => {
      userApi[apiMethod].mockResolvedValue("Berhasil");

      await makeThunk()(dispatch);

      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
      expect(dispatch).toHaveBeenNthCalledWith(1, creator(true));
      if (reloadsProfile) {
        expect(dispatch).toHaveBeenNthCalledWith(2, expect.any(Function));
      } else {
        expect(dispatch).toHaveBeenCalledTimes(1);
      }
    });

    it("menampilkan error dan menandai gagal", async () => {
      userApi[apiMethod].mockRejectedValue(new Error("Gagal"));

      await makeThunk()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenCalledWith(creator(false));
    });
  });
});
