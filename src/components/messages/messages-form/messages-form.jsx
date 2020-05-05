import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import uuidv4 from "uuid/dist/v4";

import firebase from "../../../firebase/firebase";
import FileModal from "../file-modal/file-modal";
import ProgressBar from "../../progress-bar/progress-bar";

class MessagesForm extends Component {
  constructor() {
    super();

    this.messagesRef = firebase.database().ref("messages");
    this.storageRef = firebase.storage().ref();

    this.state = {
      message: "",
      isLoading: false,
      errors: [],
      modal: false,
      uploadState: "",
      uploadTask: null,
      percentUploaded: 0,
    };
  }

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  getPath = () => {
    if (this.props.isPrivateChannel)
      return `chat/private-${this.props.channel.id}`;
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
    } = this.state;

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
