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
      uniqueUsersCount: 0,
      searchTerm: "",
      loadingSearch: false,
      searchResults: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.channel !== this.props.channel) {
      this.setState({ messages: [], uniqueUsersCount: 0 });
      const { user, channel } = this.props;

      if (user && channel) {
        this.addListeners(channel.id);
      }
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  handleSearch = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        loadingSearch: true,
      },
      () => {
        this.searchMessages();
      }
    );
  };

  searchMessages = () => {
    const allMessages = [...this.state.messages];
    const querry = new RegExp(this.state.searchTerm, "gim");

    const searchResults = allMessages.reduce((acc, message) => {
      if (
        message.content &&
        (message.content.match(querry) || message.user.name.match(querry))
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => {
      this.setState({ loadingSearch: false });
    }, 100);
  };

  addMessageListener = (channelId) => {
    let messages = [];
    let uniqueUsers = new Set();
    this.messagesRef.child(channelId).on("child_added", (snapshot) => {
      messages.push(snapshot.val());
      if (snapshot.val().user.name) {
        uniqueUsers.add(snapshot.val().user.name);
      }
      this.setState({
        messages,
        messagesLoading: false,
        uniqueUsersCount: uniqueUsers.size,
      });
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
    const {
      messages,
      progressBar,
      uniqueUsersCount,
      searchTerm,
      loadingSearch,
      searchResults,
    } = this.state;
    const { user, channel } = this.props;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={channel ? `#${channel.name}` : ""}
          uniqueUsersCount={uniqueUsersCount}
          handleSearch={this.handleSearch}
          loadingSearch={loadingSearch}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages-progress" : "messages"}
          >
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
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
