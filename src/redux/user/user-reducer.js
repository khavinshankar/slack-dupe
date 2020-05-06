import userActionTypes from "./user-types";

const INITIAL_STATE = {
  user: null,
  isLoading: true,
  usersPosts: null,
};

const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case userActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    case userActionTypes.CLEAR_USER:
      return {
        ...state,
        user: null,
        isLoading: false,
      };
    case userActionTypes.SET_USERS_POSTS:
      return {
        ...state,
        usersPosts: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
