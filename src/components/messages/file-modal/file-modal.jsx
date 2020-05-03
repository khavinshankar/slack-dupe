import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends Component {
  constructor() {
    super();

    this.state = {
      file: null,
    };
  }

  addFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file });
    }
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;
    if (file) {
      if (this.isAuthourized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      } else {
        alert("File Type Unauthorized!");
        this.clearFile();
      }
    }
  };

  clearFile = () => {
    this.setState({ file: null });
  };

  isAuthourized = (fileName) => {
    const authourizedTypes = ["image/jpeg", "image/png", "image/jpg"];
    return authourizedTypes.includes(mime.lookup(fileName));
  };

  render() {
    const { modal, closeModal } = this.props;
    return (
      <Modal basic onClose={closeModal} open={modal}>
        <Modal.Header>SELECT AN IMAGE</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
            onChange={this.addFile}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}>
            <Icon name="checkmark" /> SEND
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" /> CANCEL
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
