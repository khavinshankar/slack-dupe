import userActionTypes from "./user-types";

export const setUser = (user) => {
  return {
    type: userActionTypes.SET_USER,
    payload: user,
  };
};

export const clearUser = () => {
  return {
    type: userActionTypes.CLEAR_USER,
  };
};

export const setUsersPosts = (usersPosts) => {
  return {
    type: userActionTypes.SET_USERS_POSTS,
    payload: usersPosts,
  };
};
