import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_LOST_FOUNDS: "SET_LOST_FOUNDS",
  SET_LOST_FOUND: "SET_LOST_FOUND",
  SET_IS_LOST_FOUND: "SET_IS_LOST_FOUND",
  SET_IS_LOST_FOUND_ADD: "SET_IS_LOST_FOUND_ADD",
  SET_IS_LOST_FOUND_ADDED: "SET_IS_LOST_FOUND_ADDED",
  SET_IS_LOST_FOUND_CHANGE: "SET_IS_LOST_FOUND_CHANGE",
  SET_IS_LOST_FOUND_CHANGED: "SET_IS_LOST_FOUND_CHANGED",
  SET_IS_LOST_FOUND_CHANGE_COVER: "SET_IS_LOST_FOUND_CHANGE_COVER",
  SET_IS_LOST_FOUND_CHANGED_COVER: "SET_IS_LOST_FOUND_CHANGED_COVER",
  SET_IS_LOST_FOUND_DELETE: "SET_IS_LOST_FOUND_DELETE",
  SET_IS_LOST_FOUND_DELETED: "SET_IS_LOST_FOUND_DELETED",
  SET_LOST_FOUND_STATS: "SET_LOST_FOUND_STATS",
};

// ---- Action creators ----
const creator = (type, key) => (value) => ({ type, payload: { [key]: value } });

export const setLostFoundsActionCreator = creator(ActionType.SET_LOST_FOUNDS, "lostFounds");
export const setLostFoundActionCreator = creator(ActionType.SET_LOST_FOUND, "lostFound");
export const setIsLostFoundActionCreator = creator(ActionType.SET_IS_LOST_FOUND, "isLostFound");
export const setIsLostFoundAddActionCreator = creator(ActionType.SET_IS_LOST_FOUND_ADD, "isLostFoundAdd");
export const setIsLostFoundAddedActionCreator = creator(ActionType.SET_IS_LOST_FOUND_ADDED, "isLostFoundAdded");
export const setIsLostFoundChangeActionCreator = creator(ActionType.SET_IS_LOST_FOUND_CHANGE, "isLostFoundChange");
export const setIsLostFoundChangedActionCreator = creator(ActionType.SET_IS_LOST_FOUND_CHANGED, "isLostFoundChanged");
export const setIsLostFoundChangeCoverActionCreator = creator(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER, "isLostFoundChangeCover");
export const setIsLostFoundChangedCoverActionCreator = creator(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER, "isLostFoundChangedCover");
export const setIsLostFoundDeleteActionCreator = creator(ActionType.SET_IS_LOST_FOUND_DELETE, "isLostFoundDelete");
export const setIsLostFoundDeletedActionCreator = creator(ActionType.SET_IS_LOST_FOUND_DELETED, "isLostFoundDeleted");
export const setLostFoundStatsActionCreator = creator(ActionType.SET_LOST_FOUND_STATS, "lostFoundStats");

// ---- Async thunks: baca data ----
export function asyncSetLostFounds(filters = {}) {
  return async (dispatch) => {
    try {
      const lostFounds = await lostFoundApi.getLostFounds(filters);
      dispatch(setLostFoundsActionCreator(lostFounds));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetLostFound(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(false));
    try {
      const lostFound = await lostFoundApi.getLostFound(id);
      dispatch(setLostFoundActionCreator(lostFound));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setLostFoundActionCreator(null));
    }
    dispatch(setIsLostFoundActionCreator(true));
  };
}

export function asyncSetLostFoundStats() {
  return async (dispatch) => {
    try {
      const stats = await lostFoundApi.getStatsMonthly();
      dispatch(setLostFoundStatsActionCreator(stats));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

// ---- Async thunks: mutasi data ----
export function asyncAddLostFound(title, description, status) {
  return async (dispatch) => {
    dispatch(setIsLostFoundAddActionCreator(true));
    try {
      const message = await lostFoundApi.postLostFound(title, description, status);
      showSuccessDialog(message);
      dispatch(setIsLostFoundAddedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundAddActionCreator(false));
  };
}

export function asyncChangeLostFound(id, title, description, status, isCompleted) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangeActionCreator(true));
    try {
      const message = await lostFoundApi.putLostFound(id, title, description, status, isCompleted);
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundChangeActionCreator(false));
  };
}

export function asyncChangeLostFoundCover(id, cover) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangeCoverActionCreator(true));
    try {
      const message = await lostFoundApi.postCover(id, cover);
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedCoverActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundChangeCoverActionCreator(false));
  };
}

export function asyncDeleteLostFound(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundDeleteActionCreator(true));
    try {
      const message = await lostFoundApi.deleteLostFound(id);
      showSuccessDialog(message);
      dispatch(setIsLostFoundDeletedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundDeleteActionCreator(false));
  };
}