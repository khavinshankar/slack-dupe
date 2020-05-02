import userActionTypes from "./user-types";

const INITIAL_STATE = {
  user: null,
  isLoading: true,
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
    default:
      return state;
  }
};

export default userReducer;
