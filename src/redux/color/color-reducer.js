import colorActionTypes from "./color-types";

const INITIAL_STATE = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee",
};

const colorReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case colorActionTypes.CHANGE_COLOR_SCHEME:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor,
      };
    default:
      return state;
  }
};

export default colorReducer;
