import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./features/auth/states/reducer";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./features/users/states/reducer";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
  lostFoundStatsReducer,
} from "./features/lost-founds/states/reducer";

const store = configureStore({
  reducer: {
    // auth
    isAuthLogin: isAuthLoginReducer,
    isAuthRegister: isAuthRegisterReducer,
    isAuthLogout: isAuthLogoutReducer,
    // users
    users: usersReducer,
    user: userReducer,
    profile: profileReducer,
    isProfile: isProfileReducer,
    isChangeProfile: isChangeProfileReducer,
    isChangeProfilePhoto: isChangeProfilePhotoReducer,
    isChangeProfilePassword: isChangeProfilePasswordReducer,
    // lost-founds
    lostFounds: lostFoundsReducer,
    lostFound: lostFoundReducer,
    isLostFound: isLostFoundReducer,
    isLostFoundAdd: isLostFoundAddReducer,
    isLostFoundAdded: isLostFoundAddedReducer,
    isLostFoundChange: isLostFoundChangeReducer,
    isLostFoundChanged: isLostFoundChangedReducer,
    isLostFoundChangeCover: isLostFoundChangeCoverReducer,
    isLostFoundChangedCover: isLostFoundChangedCoverReducer,
    isLostFoundDelete: isLostFoundDeleteReducer,
    isLostFoundDeleted: isLostFoundDeletedReducer,
    lostFoundStats: lostFoundStatsReducer,
  },
});

export default store;