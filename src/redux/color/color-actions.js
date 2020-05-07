import colorActionTypes from "./color-types";

export const changeColorScheme = (primaryColor, secondaryColor) => {
  return {
    type: colorActionTypes.CHANGE_COLOR_SCHEME,
    payload: { primaryColor, secondaryColor },
  };
};
