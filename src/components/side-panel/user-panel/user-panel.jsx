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
} from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../../firebase/firebase";

class UserPanel extends Component {
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
        text: <span>Change Avatar</span>,
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignOut}>SIGN OUT</span>,
      },
    ];
  };

  handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      console.log("You are Signed out");
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { displayName, photoURL } = this.props.user;
    return (
      <Grid style={{ background: "#4c3c4c" }}>
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
