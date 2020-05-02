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
