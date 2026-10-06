import userApi from "../api/userApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_USERS: "SET_USERS",
  SET_USER: "SET_USER",
  SET_PROFILE: "SET_PROFILE",
  SET_IS_PROFILE: "SET_IS_PROFILE",
  SET_IS_CHANGE_PROFILE: "SET_IS_CHANGE_PROFILE",
  SET_IS_CHANGE_PROFILE_PHOTO: "SET_IS_CHANGE_PROFILE_PHOTO",
  SET_IS_CHANGE_PROFILE_PASSWORD: "SET_IS_CHANGE_PROFILE_PASSWORD",
};

// ---- Action creators ----
export const setUsersActionCreator = (users) => ({
  type: ActionType.SET_USERS,
  payload: { users },
});
export const setUserActionCreator = (user) => ({
  type: ActionType.SET_USER,
  payload: { user },
});
export const setProfileActionCreator = (profile) => ({
  type: ActionType.SET_PROFILE,
  payload: { profile },
});
export const setIsProfileActionCreator = (isProfile) => ({
  type: ActionType.SET_IS_PROFILE,
  payload: { isProfile },
});
export const setIsChangeProfileActionCreator = (isChangeProfile) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE,
  payload: { isChangeProfile },
});
export const setIsChangeProfilePhotoActionCreator = (isChangeProfilePhoto) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
  payload: { isChangeProfilePhoto },
});
export const setIsChangeProfilePasswordActionCreator = (
  isChangeProfilePassword
) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
  payload: { isChangeProfilePassword },
});

// ---- Async thunks ----
export function asyncSetUsers() {
  return async (dispatch) => {
    try {
      const users = await userApi.getUsers();
      dispatch(setUsersActionCreator(users));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetProfile() {
  return async (dispatch) => {
    try {
      const profile = await userApi.getMe();
      dispatch(setProfileActionCreator(profile));
    } catch {
      apiHelper.putAccessToken(null);
      dispatch(setProfileActionCreator(null));
    }
    dispatch(setIsProfileActionCreator(true));
  };
}

export function asyncSetIsChangeProfile(name, email) {
  return async (dispatch) => {
    try {
      const message = await userApi.putMe(name, email);
      showSuccessDialog(message);
      dispatch(setIsChangeProfileActionCreator(true));
      await dispatch(asyncSetProfile());
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfileActionCreator(false));
    }
  };
}

export function asyncSetIsChangeProfilePhoto(photo) {
  return async (dispatch) => {
    try {
      const message = await userApi.postPhoto(photo);
      showSuccessDialog(message);
      dispatch(setIsChangeProfilePhotoActionCreator(true));
      await dispatch(asyncSetProfile());
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfilePhotoActionCreator(false));
    }
  };
}

export function asyncSetIsChangeProfilePassword(password, newPassword) {
  return async (dispatch) => {
    try {
      const message = await userApi.putPassword(password, newPassword);
      showSuccessDialog(message);
      dispatch(setIsChangeProfilePasswordActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfilePasswordActionCreator(false));
    }
  };
}