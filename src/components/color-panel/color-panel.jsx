import React, { Component } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Label,
  Icon,
} from "semantic-ui-react";
import { TwitterPicker } from "react-color";
import { connect } from "react-redux";

import firebase from "../../firebase/firebase";
import { changeColorScheme } from "../../redux/color/color-actions";

class ColorPanel extends Component {
  constructor() {
    super();

    this.usersRef = firebase.database().ref("users");
    this.state = {
      modal: false,
      primaryColor: "",
      secondaryColor: "",
      colorSchemes: [],
    };
  }

  componentDidMount() {
    if (this.props.user) {
      this.addColorsListener(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.usersRef.child(`${this.props.user.uid}/colors`).off();
  };

  addColorsListener = (userId) => {
    let colorSchemes = [];

    this.usersRef.child(`${userId}/colors`).on("child_added", (snapshot) => {
      colorSchemes.unshift(snapshot.val());

      this.setState({ colorSchemes });
    });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleChangePrimary = (color) => {
    this.setState({ primaryColor: color.hex });
  };

  handleChangeSecondary = (color) => {
    this.setState({ secondaryColor: color.hex });
  };

  handleSaveColors = () => {
    const { primaryColor, secondaryColor } = this.state;
    if (primaryColor && secondaryColor) {
      this.saveColors(primaryColor, secondaryColor);
    }
  };

  saveColors = async (primaryColor, secondaryColor) => {
    try {
      await this.usersRef.child(`${this.props.user.uid}/colors`).push().update({
        primaryColor,
        secondaryColor,
      });

      this.closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  displayColorSchemes = (colorSchemes) => {
    return colorSchemes
      ? colorSchemes.map((colorScheme, i) => {
          return (
            <React.Fragment key={i}>
              <Divider />
              <div className="color-container">
                <div
                  className="color-square"
                  style={{ backgroundColor: colorScheme.primaryColor }}
                  onClick={() => {
                    this.props.changeColorScheme(
                      colorScheme.primaryColor,
                      colorScheme.secondaryColor
                    );
                  }}
                >
                  <div
                    className="color-overlay"
                    style={{ backgroundColor: colorScheme.secondaryColor }}
                  ></div>
                </div>
              </div>
            </React.Fragment>
          );
        })
      : null;
  };

  render() {
    const { modal, primaryColor, secondaryColor, colorSchemes } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        width="very thin"
        inverted
        vertical
        visible
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />

        {this.displayColorSchemes(colorSchemes)}

        <Modal
          basic
          open={modal}
          onClose={this.closeModal}
          size="fullscreen"
          centered={false}
        >
          <Modal.Header>CHOOSE APP COLOR</Modal.Header>
          <Modal.Content className="color-modal">
            <div
              className="centre"
              style={{ backgroundColor: primaryColor ? primaryColor : null }}
            >
              <Label content="PRIMARY COLOR" />
              <TwitterPicker
                onChange={this.handleChangePrimary}
                color={primaryColor}
              />
            </div>
            <div
              className="centre"
              style={{
                backgroundColor: secondaryColor ? secondaryColor : null,
              }}
            >
              <Label content="SECONDARY COLOR" />
              <TwitterPicker
                onChange={this.handleChangeSecondary}
                color={secondaryColor}
              />
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> PICK COLORS
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> CANCEL
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeColorScheme: (primaryColor, secondaryColor) => {
      return dispatch(changeColorScheme(primaryColor, secondaryColor));
    },
  };
};

export default connect(null, mapDispatchToProps)(ColorPanel);
