import React, { Component } from "react";
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

class SignInPage extends Component {
  constructor() {
    super();

    this.state = {
      email: "",
      passwd: "",
      errors: [],
      loading: false,
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    const { email, passwd } = this.state;
    event.preventDefault();

    try {
      this.setState({ loading: true });
      const userAuth = await firebase
        .auth()
        .signInWithEmailAndPassword(email, passwd);
      console.log(userAuth);
      this.setState({ loading: false });
    } catch (error) {
      this.setState({
        errors: [...this.state.errors, error.message],
        loading: false,
      });
    }
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
    const { email, passwd, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="violet" textAlign="center">
            <Icon name="sign-in alternate" color="violet" />
            Sign In to DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
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
              <Button
                className={loading ? "loading" : ""}
                disabled={loading}
                fluid
                color="violet"
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
            DON'T HAVE AN ACCOUNT! <Link to="/auth/signup">SIGN UP</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default SignInPage;
