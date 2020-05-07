import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import {
  setChannelPrivate,
  setCurrentChannel,
} from "../../../redux/channel/channel-actions";
import firebase from "../../../firebase/firebase";

class Starred extends Component {
  constructor() {
    super();

    this.usersRef = firebase.database().ref("users");
    this.state = {
      starredChannels: [],
      activeChannel: "",
    };
  }

  componentDidMount() {
    if (this.props.user) {
      this.addStaredChannelsListeners(this.props.user.uid);
    }
  }

  addStaredChannelsListeners = (userId) => {
    this.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snapshot) => {
        const starredChannel = { id: snapshot.key, ...snapshot.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });

    this.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snapshot) => {
        const unStarredChannel = { id: snapshot.key, ...snapshot.val() };
        const filteredChannels = this.state.starredChannels.filter(
          (channel) => {
            return channel.id !== unStarredChannel.id;
          }
        );
        this.setState({ starredChannels: filteredChannels });
      });
  };

  displayChannels = (channels) => {
    return channels.length
      ? channels.map((channel) => {
          return (
            <Menu.Item
              key={channel.id}
              onClick={() => this.changeChannel(channel)}
              style={{ opacity: 0.7 }}
              active={this.state.activeChannel === channel.id}
            >
              #{channel.name}
            </Menu.Item>
          );
        })
      : null;
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setChannelPrivate(false);
  };

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          [{starredChannels.length}]
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
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
    setCurrentChannel: (channel) => {
      return dispatch(setCurrentChannel(channel));
    },
    setChannelPrivate: (isPrivate) => {
      return dispatch(setChannelPrivate(isPrivate));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Starred);
