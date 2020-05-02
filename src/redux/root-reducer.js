import { combineReducers } from "redux";

import userReducer from "./user/user-reducer";
import channelReducer from "./channel/channel-reducer";

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer,
});

export default rootReducer;
