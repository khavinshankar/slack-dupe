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
    this.privateMessagesRef = firebase.database().ref("private-messages");
    this.usersRef = firebase.database().ref("users");
    this.state = {
      messages: [],
      isLoading: true,
      progressBar: false,
      uniqueUsersCount: 0,
      searchTerm: "",
      loadingSearch: false,
      searchResults: [],
      isStarred: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.channel !== this.props.channel) {
      this.setState({ messages: [], uniqueUsersCount: 0 });
      const { user, channel } = this.props;

      if (user && channel) {
        this.addMessageListener(channel.id);
        this.addStarsListener(user.uid, channel.id);
      }
    }
  }

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
    const ref = this.getMessagesRef();
    let uniqueUsers = new Set();
    ref.child(channelId).on("child_added", (snapshot) => {
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

  getMessagesRef = () => {
    return this.props.isPrivateChannel
      ? this.privateMessagesRef
      : this.messagesRef;
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

  addStarsListener = async (userId, channelId) => {
    const response = await this.usersRef
      .child(userId)
      .child("starred")
      .once("value");
    if (response.val()) {
      const channelIds = Object.keys(response.val());
      const starred = channelIds.includes(channelId);
      this.setState({ isStarred: starred });
    }
  };

  handleStar = () => {
    this.setState({ isStarred: !this.state.isStarred }, () => {
      this.starChannel();
    });
  };

  starChannel = () => {
    const { user, channel } = this.props;
    if (this.state.isStarred) {
      this.usersRef.child(`${user.uid}/starred`).update({
        [channel.id]: {
          name: channel.name,
          details: channel.details,
          createdBy: {
            name: channel.createdBy.name,
            avatar: channel.createdBy.avatar,
          },
        },
      });
    } else {
      this.usersRef
        .child(`${user.uid}/starred`)
        .child(channel.id)
        .remove((error) => {
          if (error) {
            console.error(error);
          }
        });
    }
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
      isStarred,
    } = this.state;
    const { user, channel, isPrivateChannel } = this.props;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={channel ? `${channel.name}` : ""}
          uniqueUsersCount={uniqueUsersCount}
          handleSearch={this.handleSearch}
          loadingSearch={loadingSearch}
          isPrivateChannel={isPrivateChannel}
          handleStar={this.handleStar}
          isStarred={isStarred}
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
          isPrivateChannel={isPrivateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    channel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivate,
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(Messages);
