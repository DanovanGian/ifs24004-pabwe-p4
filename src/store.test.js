import { describe, expect, it } from "vitest";
import store, { reducer } from "./store";
import { setIsAuthLoginActionCreator } from "./features/auth/states/action";

describe("store", () => {
  it("menggabungkan seluruh reducer dari auth, users, dan lost-founds", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(
      Object.keys(reducer).sort()
    );
  });

  it("memiliki state awal yang benar", () => {
    const state = store.getState();

    expect(state.isAuthLogin).toBe(false);
    expect(state.isAuthRegister).toBe(false);
    expect(state.isAuthLogout).toBe(false);
    expect(state.users).toEqual([]);
    expect(state.profile).toBeNull();
    expect(state.isProfile).toBe(false);
    expect(state.lostFounds).toEqual([]);
    expect(state.lostFound).toBeNull();
    expect(state.lostFoundStats).toBeNull();
  });

  it("memperbarui state saat action dikirim", () => {
    store.dispatch(setIsAuthLoginActionCreator(true));

    expect(store.getState().isAuthLogin).toBe(true);
  });
});