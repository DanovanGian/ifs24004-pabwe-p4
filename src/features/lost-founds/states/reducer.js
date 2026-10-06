import { ActionType } from "./action";

function createReducer(type, key, initialValue) {
  return (state = initialValue, action = {}) =>
    action.type === type ? action.payload[key] : state;
}

export const lostFoundsReducer = createReducer(ActionType.SET_LOST_FOUNDS, "lostFounds", []);
export const lostFoundReducer = createReducer(ActionType.SET_LOST_FOUND, "lostFound", null);
export const isLostFoundReducer = createReducer(ActionType.SET_IS_LOST_FOUND, "isLostFound", false);
export const isLostFoundAddReducer = createReducer(ActionType.SET_IS_LOST_FOUND_ADD, "isLostFoundAdd", false);
export const isLostFoundAddedReducer = createReducer(ActionType.SET_IS_LOST_FOUND_ADDED, "isLostFoundAdded", false);
export const isLostFoundChangeReducer = createReducer(ActionType.SET_IS_LOST_FOUND_CHANGE, "isLostFoundChange", false);
export const isLostFoundChangedReducer = createReducer(ActionType.SET_IS_LOST_FOUND_CHANGED, "isLostFoundChanged", false);
export const isLostFoundChangeCoverReducer = createReducer(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER, "isLostFoundChangeCover", false);
export const isLostFoundChangedCoverReducer = createReducer(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER, "isLostFoundChangedCover", false);
export const isLostFoundDeleteReducer = createReducer(ActionType.SET_IS_LOST_FOUND_DELETE, "isLostFoundDelete", false);
export const isLostFoundDeletedReducer = createReducer(ActionType.SET_IS_LOST_FOUND_DELETED, "isLostFoundDeleted", false);
export const lostFoundStatsReducer = createReducer(ActionType.SET_LOST_FOUND_STATS, "lostFoundStats", null);