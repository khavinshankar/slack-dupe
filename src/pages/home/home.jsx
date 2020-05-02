import React from "react";
import { Grid, GridColumn } from "semantic-ui-react";

import "../../App.css";
import ColorPanel from "../../components/color-panel/color-panel";
import SidePanel from "../../components/side-panel/side-panel";
import Messages from "../../components/messages/messages";
import MetaPanel from "../../components/meta-panel/meta-panel";

const HomePage = () => {
  return (
    <Grid columns="equal" className="app" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel />

      <GridColumn style={{ marginLeft: 320 }}>
        <Messages />
      </GridColumn>

      <GridColumn width={4}>
        <MetaPanel />
      </GridColumn>
    </Grid>
  );
};

export default HomePage;
