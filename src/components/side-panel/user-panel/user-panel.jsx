import React, { Component } from "react";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  GridColumn,
  GridRow,
  HeaderContent,
  Image,
  Modal,
  Input,
  Button,
} from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";
import { connect } from "react-redux";

import firebase from "../../../firebase/firebase";

class UserPanel extends Component {
  constructor() {
    super();

    this.userRef = firebase.auth().currentUser;
    this.usersRef = firebase.database().ref("users");
    this.storageRef = firebase.storage().ref();
    this.state = {
      modal: false,
      previewImage: "",
      croppedImage: "",
      blob: "",
      avatarUrl: "",
    };
  }

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      console.log("You are Signed out");
    } catch (error) {
      console.error(error);
    }
  };

  handleChange = (event) => {
    const file = event.target.files[0];
    const fileReader = new FileReader();

    if (file) {
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", () => {
        this.setState({ previewImage: fileReader.result });
      });
    }
  };

  uploadImage = async () => {
    try {
      const snapshot = await this.storageRef
        .child(`avatars/user/${this.userRef.uid}`)
        .put(this.state.blob, { contentType: "image/jpeg" });
      const downloadUrl = await snapshot.ref.getDownloadURL();
      this.setState({ avatarUrl: downloadUrl }, () => this.changeAvatar());
    } catch (error) {
      if (error) {
        console.error(error);
      }
    }
  };

  changeAvatar = async () => {
    try {
      await this.userRef.updateProfile({
        photoURL: this.state.avatarUrl,
      });

      this.closeModal();
      this.usersRef
        .child(this.props.user.uid)
        .update({ avatar: this.state.avatarUrl });
    } catch (error) {
      if (error) {
        console.error(error);
      }
    }
  };

  cropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        this.setState({
          croppedImage: URL.createObjectURL(blob),
          blob,
        });
      });
    }
  };

  dropdownOptions = () => {
    return [
      {
        key: "user",
        text: (
          <span>
            SIGNED in as <strong>{this.props.user.displayName}</strong>
          </span>
        ),
        disabled: true,
      },
      {
        key: "avatar",
        text: <span onClick={this.openModal}>Change Avatar</span>,
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignOut}>SIGN OUT</span>,
      },
    ];
  };

  render() {
    const {
      user: { displayName, photoURL },
      primaryColor,
    } = this.props;
    const { modal, previewImage, croppedImage } = this.state;
    return (
      <Grid style={{ background: primaryColor }}>
        <GridColumn>
          <GridRow style={{ padding: "1.2em", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <HeaderContent>DevChat</HeaderContent>
            </Header>
          </GridRow>

          <Header style={{ padding: "0.2em" }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={photoURL} spaced="right" avatar />
                  {displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>

          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>CHANGE AVATAR</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid stackable centered columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={(node) => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        width={100}
                        height={100}
                        style={{ margin: "3em auto" }}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button color="green" inverted onClick={this.uploadImage}>
                  <Icon name="checkmark box" /> CHANGE AVATAR
                </Button>
              )}
              <Button color="blue" inverted onClick={this.cropImage}>
                <Icon name="image" /> PREVIEW
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> CANCEL
              </Button>
            </Modal.Actions>
          </Modal>
        </GridColumn>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(UserPanel);
