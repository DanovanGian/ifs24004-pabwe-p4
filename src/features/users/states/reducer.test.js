import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from "./reducer";

describe.each([
  ["usersReducer", usersReducer, ActionType.SET_USERS, "users", []],
  ["userReducer", userReducer, ActionType.SET_USER, "user", null],
  ["profileReducer", profileReducer, ActionType.SET_PROFILE, "profile", null],
  ["isProfileReducer", isProfileReducer, ActionType.SET_IS_PROFILE, "isProfile", false],
  ["isChangeProfileReducer", isChangeProfileReducer, ActionType.SET_IS_CHANGE_PROFILE, "isChangeProfile", false],
  ["isChangeProfilePhotoReducer", isChangeProfilePhotoReducer, ActionType.SET_IS_CHANGE_PROFILE_PHOTO, "isChangeProfilePhoto", false],
  ["isChangeProfilePasswordReducer", isChangeProfilePasswordReducer, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, "isChangeProfilePassword", false],
])("%s", (_name, reducer, type, key, initial) => {
  it("mengembalikan state awal", () => {
    expect(reducer()).toEqual(initial);
  });

  it("mengubah state sesuai action", () => {
    const value = ["nilai-baru"];
    expect(reducer(initial, { type, payload: { [key]: value } })).toBe(value);
  });

  it("mengabaikan action lain", () => {
    const current = ["nilai-lama"];
    expect(reducer(current, { type: "LAIN" })).toBe(current);
  });
});
