import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_IS_AUTH_LOGIN: "SET_IS_AUTH_LOGIN",
  SET_IS_AUTH_REGISTER: "SET_IS_AUTH_REGISTER",
  SET_IS_AUTH_LOGOUT: "SET_IS_AUTH_LOGOUT",
};

// ---- Action creators ----
export function setIsAuthLoginActionCreator(isAuthLogin) {
  return { type: ActionType.SET_IS_AUTH_LOGIN, payload: { isAuthLogin } };
}

export function setIsAuthRegisterActionCreator(isAuthRegister) {
  return { type: ActionType.SET_IS_AUTH_REGISTER, payload: { isAuthRegister } };
}

export function setIsAuthLogoutActionCreator(isAuthLogout) {
  return { type: ActionType.SET_IS_AUTH_LOGOUT, payload: { isAuthLogout } };
}

// ---- Async thunks ----
export function asyncSetIsAuthLogin(email, password) {
  return async (dispatch) => {
    try {
      const data = await authApi.postLogin(email, password);
      apiHelper.putAccessToken(data.token);
      dispatch(setIsAuthLogoutActionCreator(false));
      dispatch(setIsAuthLoginActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsAuthLoginActionCreator(false));
    }
  };
}

export function asyncSetIsAuthRegister(name, email, password) {
  return async (dispatch) => {
    try {
      const message = await authApi.postRegister(name, email, password);
      showSuccessDialog(message);
      dispatch(setIsAuthRegisterActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsAuthRegisterActionCreator(false));
    }
  };
}

export function asyncSetIsAuthLogout() {
  return async (dispatch) => {
    apiHelper.putAccessToken(null);
    dispatch(setIsAuthLoginActionCreator(false));
    dispatch(setIsAuthLogoutActionCreator(true));
  };
} 