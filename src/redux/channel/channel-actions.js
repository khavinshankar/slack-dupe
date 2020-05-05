import channelActionTypes from "./channel-types";

export const setCurrentChannel = (channel) => {
  return {
    type: channelActionTypes.SET_CURRENT_CHANNEL,
    payload: channel,
  };
};

export const setChannelPrivate = (isPrivate) => {
  return {
    type: channelActionTypes.SET_CHANNEL_PRIVATE,
    payload: isPrivate,
  };
};
