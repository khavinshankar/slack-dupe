import React, { Component } from "react";
import { Menu } from "semantic-ui-react";

import UserPanel from "./user-panel/user-panel";
import Channels from "./channels/channels";
import DirectMessages from "./direct-messages/direct-messages";
import Starred from "./starred/starred";

class SidePanel extends Component {
  render() {
    const { primaryColor, user } = this.props;
    return (
      <Menu
        size="large"
        fixed="left"
        inverted
        vertical
        style={{ background: primaryColor, fontSize: "1.2rem" }}
      >
        <UserPanel primaryColor={primaryColor} />
        <br />
        <Starred />
        <Channels />
        <DirectMessages user={user} />
      </Menu>
    );
  }
}

export default SidePanel;
