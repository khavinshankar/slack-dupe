import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase/firebase";
import MessagesHeader from "./messages-header/messages-header";
import MessagesForm from "./messages-form/messages-form";
import Message from "./message/message";
import Skeleton from "./skeleton/skeleton";
import { setUsersPosts } from "../../redux/user/user-actions";
import Typing from "./typing/typing";

class Messages extends Component {
  constructor() {
    super();

    this.messagesRef = firebase.database().ref("messages");
    this.privateMessagesRef = firebase.database().ref("private-messages");
    this.usersRef = firebase.database().ref("users");
    this.typingRef = firebase.database().ref("typing");
    this.connectedRef = firebase.database().ref(".info/connected");
    this.activeRef = firebase.database().ref("active");
    this.state = {
      messages: [],
      isLoading: true,
      progressBar: false,
      uniqueUsersCount: 0,
      searchTerm: "",
      loadingSearch: false,
      searchResults: [],
      isStarred: false,
      usersTyping: [],
      listeners: [],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.channel !== this.props.channel) {
      this.setState({ messages: [], uniqueUsersCount: 0 });
      const { user, channel } = this.props;

      if (user && channel) {
        this.addMessageListener(channel.id);
        this.addStarsListener(user.uid, channel.id);
        this.addTypingListener(user.uid, channel.id);
      }
    }

    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.connectedRef.off();
    this.state.listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const listener = { id, ref, event };
      this.setState({ listeners: [...this.state.listeners, listener] });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  addTypingListener = (userId, channelId) => {
    let usersTyping = [];

    this.typingRef.child(channelId).on("child_added", (snapshot) => {
      if (snapshot.key !== userId) {
        usersTyping.push({
          id: snapshot.key,
          name: snapshot.val(),
        });
        this.setState({ usersTyping });
      }
    });
    this.addToListeners(channelId, this.typingRef, "child_added");

    this.typingRef.child(channelId).on("child_removed", (snapshot) => {
      const index = usersTyping.findIndex((user) => {
        return user.id === snapshot.key;
      });

      if (index !== -1) {
        usersTyping = usersTyping.filter((user) => {
          return user.id !== snapshot.key;
        });
        this.setState({ usersTyping });
      }
    });
    this.addToListeners(channelId, this.typingRef, "child_removed");

    // this.activeRef.on("child_removed", (snapshot) => {
    //   const index = usersTyping.findIndex((user) => {
    //     return user.id === snapshot.key;
    //   });

    //   if (index !== -1) {
    //     usersTyping = usersTyping.filter((user) => {
    //       return user.id !== snapshot.key;
    //     });
    //     this.setState({ usersTyping });
    //   }
    // });

    this.connectedRef.on("value", (snapshot) => {
      if (snapshot.val()) {
        this.typingRef
          .child(channelId)
          .child(userId)
          .onDisconnect()
          .remove((error) => {
            if (error) {
              console.error(error);
            }
          });
      }
    });
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
    const ref = this.getMessagesRef();
    let uniqueUsers = new Set();
    ref.child(channelId).on("child_added", (snapshot) => {
      messages.push(snapshot.val());
      if (snapshot.val().user.name) {
        uniqueUsers.add(snapshot.val().user.name);
      }
      this.setState({
        messages,
        isLoading: false,
        uniqueUsersCount: uniqueUsers.size,
      });
      this.countUsersPosts(messages);
    });
    this.addToListeners(channelId, ref, "child_added");
  };

  countUsersPosts = (messages) => {
    let usersPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }

      return acc;
    }, {});
    this.props.setUsersPosts(usersPosts);
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

  displayUsersTyping = (usersTyping) => {
    return (
      usersTyping &&
      usersTyping.map((user) => {
        return (
          <div
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.2em",
            }}
          >
            <span className="user-typing">{user.name} is typing</span>{" "}
            <Typing />
          </div>
        );
      })
    );
  };

  displayMessagesSkeleton = (isLoading) => {
    return isLoading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => {
          return <Skeleton key={i} />;
        })}
      </React.Fragment>
    ) : null;
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
      usersTyping,
      isLoading,
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
            {this.displayMessagesSkeleton(isLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayUsersTyping(usersTyping)}
            <div ref={(node) => (this.messagesEnd = node)}></div>
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

const mapDispatchToProps = (dispatch) => {
  return {
    setUsersPosts: (usersPosts) => {
      return dispatch(setUsersPosts(usersPosts));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
