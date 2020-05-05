import React, { Component } from "react";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../../firebase/firebase";
import {
  setCurrentChannel,
  setChannelPrivate,
} from "../../../redux/channel/channel-actions";

class Channels extends Component {
  constructor() {
    super();

    this.channelRef = firebase.database().ref("channels");

    this.state = {
      channels: [],
      modal: false,
      channelName: "",
      aboutChannel: "",
      initialLoad: true,
      activeChannel: "",
    };
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.channelRef.off();
  };

  addListeners() {
    let channels = [];

    this.channelRef.on("child_added", (snapshot) => {
      channels.push(snapshot.val());
      this.setState({ channels }, () => {
        this.setInitialChannel();
      });
    });
  }

  setInitialChannel = () => {
    const { initialLoad, channels } = this.state;
    if (initialLoad && channels) {
      this.changeChannel(channels[0]);
    }
    this.setState({ initialLoad: false });
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = (channel) => {
    this.props.setCurrentChannel(channel);
    this.props.setChannelPrivate(false);
    this.setActiveChannel(channel);
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { channelName, aboutChannel } = this.state;
    if (channelName && aboutChannel) {
      this.addChannel(channelName, aboutChannel);
    }
  };

  addChannel = async (name, about) => {
    const { displayName, photoURL } = this.props.user;
    const key = this.channelRef.push().key;
    const channel = {
      id: key,
      name,
      details: about,
      createdBy: {
        name: displayName,
        avatar: photoURL,
      },
    };

    try {
      await this.channelRef.child(key).update(channel);
      this.setState({ channelName: "", aboutChannel: "" });
      this.closeModal();
      console.log("channel added");
    } catch (error) {
      console.error(error);
    }
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

  render() {
    const { channels, modal, channelName, aboutChannel } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            [{channels.length}] <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>ADD A CHANNEL</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  required
                  label="Channel Name"
                  name="channelName"
                  onChange={this.handleChange}
                  value={channelName}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  required
                  label="About Channel"
                  name="aboutChannel"
                  onChange={this.handleChange}
                  value={aboutChannel}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> ADD
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> CANCEL
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(Channels);
