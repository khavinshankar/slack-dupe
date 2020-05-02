import React, { Component } from "react";
import md5 from "md5";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

import "../../App.css";
import firebase from "../../firebase/firebase";

class SignUpPage extends Component {
  constructor() {
    super();

    this.state = {
      uname: "",
      email: "",
      passwd: "",
      confPasswd: "",
      errors: [],
      loading: false,
      userRef: firebase.database().ref("users"),
    };
  }

  isPasswordValid = ({ passwd, confPasswd }) => {
    let error;
    if (passwd.length < 8) {
      error = "Make sure password is atleast 8 characters long";
      this.setState({
        errors: [...this.state.errors, error],
      });
      return false;
    } else if (passwd !== confPasswd) {
      error = "Password Mismatch";
      this.setState({
        errors: [...this.state.errors, error],
      });
      return false;
    }
    return true;
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    const { email, passwd, uname } = this.state;
    event.preventDefault();

    if (this.isPasswordValid(this.state)) {
      try {
        this.setState({ error: [], loading: true });
        const userAuth = await firebase
          .auth()
          .createUserWithEmailAndPassword(email, passwd);
        await userAuth.user.updateProfile({
          displayName: uname,
          photoURL: `http://gravatar.com/avatar/${md5(email)}?d=identicon`,
        });
        await this.saveUser(userAuth.user);
        console.log("user saved");
        this.setState({ loading: false });
      } catch (error) {
        this.setState({
          errors: [...this.state.errors, error.message],
          loading: false,
        });
      }
    }
  };

  saveUser = (user) => {
    return this.state.userRef.child(user.uid).set({
      name: user.displayName,
      avatar: user.photoURL,
    });
  };

  showErrors = (errors) => {
    return errors.map((error, i) => {
      return <p key={i}>{error}</p>;
    });
  };

  handleError = (errors, key) => {
    return errors.some((error) => {
      return error.toLowerCase().includes(key);
    })
      ? "error"
      : "";
  };

  render() {
    const { uname, email, passwd, confPasswd, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="purple" textAlign="center">
            <Icon name="signup" color="purple" />
            Sign Up for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                required
                fluid
                name="uname"
                icon="user"
                placeholder="USERNAME"
                type="text"
                value={uname}
                className={this.handleError(errors, "username")}
                onChange={this.handleChange}
              />
              <Form.Input
                required
                fluid
                name="email"
                icon="mail"
                placeholder="EMAIL"
                type="email"
                value={email}
                className={this.handleError(errors, "email")}
                onChange={this.handleChange}
              />
              <Form.Input
                required
                fluid
                name="passwd"
                icon="lock"
                placeholder="PASSWORD"
                type="password"
                value={passwd}
                className={this.handleError(errors, "password")}
                onChange={this.handleChange}
              />
              <Form.Input
                required
                fluid
                name="confPasswd"
                icon="lock"
                placeholder="CONFIRM PASSWORD"
                type="password"
                value={confPasswd}
                className={this.handleError(errors, "password mismatch")}
                onChange={this.handleChange}
              />

              <Button
                className={loading ? "loading" : ""}
                disabled={loading}
                fluid
                color="purple"
                size="large"
              >
                SUBMIT
              </Button>
            </Segment>
          </Form>
          {errors.length ? (
            <Message error>
              <h3>ERROR!</h3>
              {this.showErrors(errors)}
            </Message>
          ) : null}
          <Message>
            ALREADY A USER! <Link to="/auth/signin">SIGN IN</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default SignUpPage;
