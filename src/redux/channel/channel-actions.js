import channelActionTypes from "./channel-types";

export const setCurrentUser = (channel) => {
  return {
    type: channelActionTypes.SET_CURRENT_CHANNEL,
    payload: channel,
  };
};
