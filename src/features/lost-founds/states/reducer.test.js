import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import * as reducers from "./reducer";

describe.each([
  ["lostFoundsReducer", reducers.lostFoundsReducer, ActionType.SET_LOST_FOUNDS, "lostFounds", []],
  ["lostFoundReducer", reducers.lostFoundReducer, ActionType.SET_LOST_FOUND, "lostFound", null],
  ["isLostFoundReducer", reducers.isLostFoundReducer, ActionType.SET_IS_LOST_FOUND, "isLostFound", false],
  ["isLostFoundAddReducer", reducers.isLostFoundAddReducer, ActionType.SET_IS_LOST_FOUND_ADD, "isLostFoundAdd", false],
  ["isLostFoundAddedReducer", reducers.isLostFoundAddedReducer, ActionType.SET_IS_LOST_FOUND_ADDED, "isLostFoundAdded", false],
  ["isLostFoundChangeReducer", reducers.isLostFoundChangeReducer, ActionType.SET_IS_LOST_FOUND_CHANGE, "isLostFoundChange", false],
  ["isLostFoundChangedReducer", reducers.isLostFoundChangedReducer, ActionType.SET_IS_LOST_FOUND_CHANGED, "isLostFoundChanged", false],
  ["isLostFoundChangeCoverReducer", reducers.isLostFoundChangeCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER, "isLostFoundChangeCover", false],
  ["isLostFoundChangedCoverReducer", reducers.isLostFoundChangedCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER, "isLostFoundChangedCover", false],
  ["isLostFoundDeleteReducer", reducers.isLostFoundDeleteReducer, ActionType.SET_IS_LOST_FOUND_DELETE, "isLostFoundDelete", false],
  ["isLostFoundDeletedReducer", reducers.isLostFoundDeletedReducer, ActionType.SET_IS_LOST_FOUND_DELETED, "isLostFoundDeleted", false],
  ["lostFoundStatsReducer", reducers.lostFoundStatsReducer, ActionType.SET_LOST_FOUND_STATS, "lostFoundStats", null],
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