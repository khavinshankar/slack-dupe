import channelActionTypes from "./channel-types";

const INITIAL_STATE = {
  currentChannel: null,
  isPrivate: false,
};

const channelReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case channelActionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload,
      };
    case channelActionTypes.SET_CHANNEL_PRIVATE:
      return {
        ...state,
        isPrivate: action.payload,
      };
    default:
      return state;
  }
};

export default channelReducer;
