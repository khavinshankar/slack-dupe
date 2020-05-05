import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../../firebase/firebase";
import {
  setCurrentChannel,
  setChannelPrivate,
} from "../../../redux/channel/channel-actions";

class DirectMessages extends Component {
  constructor() {
    super();

    this.usersRef = firebase.database().ref("users");
    this.connectedRef = firebase.database().ref(".info/connected");
    this.activeRef = firebase.database().ref("active");

    this.state = {
      users: [],
      activeChannel: "",
    };
  }

  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.addListeners(user.uid);
    }
  }

  addListeners = (currentUserId) => {
    this.usersRef.on("child_added", (snapshot) => {
      if (currentUserId !== snapshot.key) {
        let user = snapshot.val();
        user["uid"] = snapshot.key;
        user["status"] = "offline";
        this.setState({ users: [...this.state.users, user] });
      }
    });

    this.connectedRef.on("value", (snapshot) => {
      if (snapshot.val()) {
        const ref = this.activeRef.child(currentUserId);
        ref.set(true);
        ref.onDisconnect().remove((error) => {
          console.error(error);
        });
      }
    });

    this.activeRef.on("child_added", (snapshot) => {
      if (currentUserId !== snapshot.key) {
        this.changeUserStatus(snapshot.key, true);
      }
    });

    this.activeRef.on("child_removed", (snapshot) => {
      if (currentUserId !== snapshot.key) {
        this.changeUserStatus(snapshot.key, false);
      }
    });
  };

  changeUserStatus = (userId, connected = false) => {
    const users = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);

    this.setState({ users });
  };

  getUserStatus = (user) => {
    return user.status === "online";
  };

  changeChannel = (user) => {
    const channelId = this.getChannelId(user.uid);
    const channelInfo = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelInfo);
    this.props.setChannelPrivate(true);
    this.setActiveChannel(user.uid);
  };

  getChannelId = (userId) => {
    const currentUserId = this.props.user.uid;
    return userId > currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          [{users ? users.length : null}]
        </Menu.Item>
        {users.map((user) => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={this.getUserStatus(user) ? "green" : "red"}
            />
            @{user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentChannel: (channel) => {
      return dispatch(setCurrentChannel(channel));
    },
    setChannelPrivate: (isPrivate) => {
      return dispatch(setChannelPrivate(isPrivate));
    },
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DirectMessages);
