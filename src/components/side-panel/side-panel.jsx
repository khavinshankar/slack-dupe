import React, { Component } from "react";
import { Menu } from "semantic-ui-react";

import UserPanel from "./user-panel/user-panel";
import Channels from "./channels/channels";

class SidePanel extends Component {
  render() {
    return (
      <Menu
        size="large"
        fixed="left"
        inverted
        vertical
        style={{ background: "#4c3c4c", fontSize: "1.2rem" }}
      >
        <UserPanel />
        <Channels />
      </Menu>
    );
  }
}

export default SidePanel;
