import React, { Component } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "semantic-ui-css/semantic.min.css";

import HomePage from "./pages/home/home";
import SignUpPage from "./pages/sign-up/sign-up";
import SignInPage from "./pages/sign-in/sign-in";
import firebase from "./firebase/firebase";
import { setUser } from "./redux/user/user-actions";
import Spinner from "./components/spinner/spinner";

class App extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push("/");
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner content="PREPARING CHAT..." />
    ) : (
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/auth/signup" component={SignUpPage} />
        <Route exact path="/auth/signin" component={SignInPage} />
      </Switch>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: (user) => {
      return dispatch(setUser(user));
    },
  };
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.user.isLoading,
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
