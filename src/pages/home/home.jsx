import React from "react";
import { Grid, GridColumn } from "semantic-ui-react";
import { connect } from "react-redux";

import "../../App.css";
import ColorPanel from "../../components/color-panel/color-panel";
import SidePanel from "../../components/side-panel/side-panel";
import Messages from "../../components/messages/messages";
import MetaPanel from "../../components/meta-panel/meta-panel";

const HomePage = (props) => {
  const { user, primaryColor, secondaryColor } = props;
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: secondaryColor }}
    >
      <ColorPanel user={user} />
      <SidePanel primaryColor={primaryColor} />

      <GridColumn style={{ marginLeft: 320 }}>
        <Messages />
      </GridColumn>

      <GridColumn width={4}>
        <MetaPanel />
      </GridColumn>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    primaryColor: state.color.primaryColor,
    secondaryColor: state.color.secondaryColor,
  };
};

export default connect(mapStateToProps)(HomePage);
