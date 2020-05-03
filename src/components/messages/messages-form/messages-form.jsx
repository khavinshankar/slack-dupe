import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";

import firebase from "../../../firebase/firebase";

class MessagesForm extends Component {
  constructor() {
    super();

    this.messagesRef = firebase.database().ref("messages");

    this.state = {
      message: "",
      isLoading: false,
      errors: [],
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  sendMessage = async () => {
    const { message, errors } = this.state;
    const { user, channel } = this.props;
    if (message) {
      this.setState({ isLoading: true });
      const chtMessage = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        user: {
          id: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
        },
        content: message,
      };
      try {
        await this.messagesRef.child(channel.id).push().set(chtMessage);
        this.setState({ isLoading: false, message: "", errors: [] });
      } catch (error) {
        this.setState({ isLoading: false, errors: [...errors, error] });
        console.error(error);
      }
    }
  };

  render() {
    const { message, errors, isLoading } = this.state;

    return (
      <Segment className="message-form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          label={<Button icon="add" />}
          labelPosition="left"
          placeholder="TYPE IN"
          onChange={this.handleChange}
          value={message}
          className={errors.length ? "error" : ""}
        />

        <Button.Group icon widths={2}>
          <Button
            color="orange"
            content="Add reply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
            disabled={isLoading}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            disabled={isLoading}
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessagesForm;
