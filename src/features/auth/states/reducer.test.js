import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./reducer";

describe.each([
  ["isAuthLoginReducer", isAuthLoginReducer, ActionType.SET_IS_AUTH_LOGIN, "isAuthLogin"],
  ["isAuthRegisterReducer", isAuthRegisterReducer, ActionType.SET_IS_AUTH_REGISTER, "isAuthRegister"],
  ["isAuthLogoutReducer", isAuthLogoutReducer, ActionType.SET_IS_AUTH_LOGOUT, "isAuthLogout"],
])("%s", (_name, reducer, type, key) => {
  it("mengembalikan false sebagai state awal", () => {
    expect(reducer()).toBe(false);
  });

  it("mengubah state sesuai action", () => {
    expect(reducer(false, { type, payload: { [key]: true } })).toBe(true);
  });

  it("mengabaikan action lain", () => {
    expect(reducer(true, { type: "LAIN" })).toBe(true);
  });
});
