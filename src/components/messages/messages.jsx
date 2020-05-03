import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase/firebase";
import MessagesHeader from "./messages-header/messages-header";
import MessagesForm from "./messages-form/messages-form";
import Message from "./message/message";

class Messages extends Component {
  constructor() {
    super();

    this.messagesRef = firebase.database().ref("messages");
    this.state = {
      messages: [],
      isLoading: true,
      progressBar: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.channel !== this.props.channel) {
      const { user, channel } = this.props;

      if (user && channel) {
        this.addListeners(channel.id);
      }
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  addMessageListener = (channelId) => {
    let messages = [];
    this.messagesRef.child(channelId).on("child_added", (snapshot) => {
      messages.push(snapshot.val());
      console.log(messages);
      this.setState({ messages, messagesLoading: false });
    });
  };

  displayMessages = (messages) => {
    return messages.length
      ? messages.map((message) => (
          <Message
            key={message.timestamp}
            message={message}
            user={this.props.user}
          />
        ))
      : null;
  };

  isProgressBarVisible = (percent) => {
    if (percent > 0 && percent < 100) {
      this.setState({ progressBar: true });
    }
  };

  render() {
    const { messages, progressBar } = this.state;
    const { user, channel } = this.props;

    return (
      <React.Fragment>
        <MessagesHeader />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages-progress" : "messages"}
          >
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessagesForm
          user={user}
          channel={channel}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    channel: state.channel.currentChannel,
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(Messages);
