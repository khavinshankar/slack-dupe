import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import uuidv4 from "uuid/dist/v4";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import firebase from "../../../firebase/firebase";
import FileModal from "../file-modal/file-modal";
import ProgressBar from "../../progress-bar/progress-bar";

class MessagesForm extends Component {
  constructor() {
    super();

    this.messagesRef = firebase.database().ref("messages");
    this.storageRef = firebase.storage().ref();
    this.typingRef = firebase.database().ref("typing");
    this.state = {
      message: "",
      isLoading: false,
      errors: [],
      modal: false,
      uploadState: "",
      uploadTask: null,
      percentUploaded: 0,
      emojiPicker: false,
    };
  }

  componentWillUnmount() {
    if (this.state.uploadTask) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }

    if (this.state.message) {
      this.addTyping();
    } else {
      this.removeTyping();
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = (emoji) => {
    const message = this.colonToUnicode(`${this.state.message}${emoji.colons}`);
    this.setState({ message });
    setTimeout(() => {
      this.messageInput.focus();
    }, 0);
  };

  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  addTyping = () => {
    const { user, channel } = this.props;
    this.typingRef.child(channel.id).child(user.uid).set(user.displayName);
  };

  removeTyping = () => {
    const { user, channel } = this.props;
    if (user && channel) {
      this.typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  getPath = () => {
    if (this.props.isPrivateChannel)
      return `chat/private/${this.props.channel.id}`;
    return "chat/public";
  };

  uploadFile = (file, metadata) => {
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
    const uploadPath = this.props.channel.id;
    const ref = this.props.getMessagesRef();

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percentUploaded = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            this.props.isProgressBarVisible(percentUploaded);
            this.setState({ percentUploaded });
          },
          (error) => {
            console.error(error);
            this.setState({
              errors: [...this.state.errors, error],
              uploadState: "error",
              uploadTask: null,
            });
          },
          async () => {
            try {
              const downloadURL = await this.state.uploadTask.snapshot.ref.getDownloadURL();
              this.sendFileMessage(downloadURL, ref, uploadPath);
            } catch (error) {
              console.error(error);
              this.setState({
                errors: [...this.state.errors, error],
                uploadState: "error",
                uploadTask: null,
              });
            }
          }
        );
      }
    );
  };

  sendFileMessage = async (fileURL, ref, uploadPath) => {
    try {
      await ref.child(uploadPath).push().set(this.createMessage(fileURL));
      this.setState({ uploadState: "done" });
    } catch (error) {
      console.error(error);
      this.setState({ errors: [...this.state.errors, error] });
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  sendMessage = async () => {
    const { message, errors } = this.state;
    const { channel, getMessagesRef } = this.props;
    if (message) {
      this.setState({ isLoading: true });
      try {
        await getMessagesRef()
          .child(channel.id)
          .push()
          .set(this.createMessage());
        this.setState({ isLoading: false, message: "", errors: [] });
        this.removeTyping();
      } catch (error) {
        this.setState({ isLoading: false, errors: [...errors, error] });
        console.error(error);
      }
    }
  };

  createMessage = (fileURL = null) => {
    const { user } = this.props;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    if (fileURL) {
      message["image"] = fileURL;
    } else {
      message["content"] = this.state.message;
    }

    return message;
  };

  render() {
    const {
      message,
      errors,
      isLoading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
    } = this.state;

    return (
      <Segment className="message-form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emoji-picker"
            title="Pick an emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="TYPE IN"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={message}
          className={errors.length ? "error" : ""}
          ref={(node) => (this.messageInput = node)}
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
            onClick={this.openModal}
            disabled={uploadState === "uploading"}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessagesForm;
