import { combineReducers } from "redux";

import userReducer from "./user/user-reducer";
import channelReducer from "./channel/channel-reducer";
import colorReducer from "./color/color-reducer";

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer,
  color: colorReducer,
});

export default rootReducer;
