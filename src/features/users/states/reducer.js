import { ActionType } from "./action";

export function usersReducer(users = [], action = {}) {
  return action.type === ActionType.SET_USERS ? action.payload.users : users;
}

export function userReducer(user = null, action = {}) {
  return action.type === ActionType.SET_USER ? action.payload.user : user;
}

export function profileReducer(profile = null, action = {}) {
  return action.type === ActionType.SET_PROFILE
    ? action.payload.profile
    : profile;
}

export function isProfileReducer(isProfile = false, action = {}) {
  return action.type === ActionType.SET_IS_PROFILE
    ? action.payload.isProfile
    : isProfile;
}

export function isChangeProfileReducer(isChangeProfile = false, action = {}) {
  return action.type === ActionType.SET_IS_CHANGE_PROFILE
    ? action.payload.isChangeProfile
    : isChangeProfile;
}

export function isChangeProfilePhotoReducer(
  isChangeProfilePhoto = false,
  action = {}
) {
  return action.type === ActionType.SET_IS_CHANGE_PROFILE_PHOTO
    ? action.payload.isChangeProfilePhoto
    : isChangeProfilePhoto;
}

export function isChangeProfilePasswordReducer(
  isChangeProfilePassword = false,
  action = {}
) {
  return action.type === ActionType.SET_IS_CHANGE_PROFILE_PASSWORD
    ? action.payload.isChangeProfilePassword
    : isChangeProfilePassword;
}