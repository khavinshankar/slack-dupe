import { createStore, applyMiddleware, compose } from "redux";
import logger from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from "./root-reducer";

const middlewares = [logger];
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(...middlewares),
    window.devToolsExtension ? composeWithDevTools() : (f) => f
  )
);

export default store;
