import React, { Component } from "react";
import {
  Segment,
  Header,
  Accordion,
  Icon,
  Image,
  List,
} from "semantic-ui-react";
import { connect } from "react-redux";

class MetaPanel extends Component {
  constructor() {
    super();

    this.state = {
      activeIndex: 0,
    };
  }

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  displayTopPosters = (usersPosts) => {
    return Object.entries(usersPosts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val], i) => {
        return (
          <List.Item key={i}>
            <Image src={val.avatar} avatar />
            <List.Content>
              <List.Header as="a">{key}</List.Header>
              <List.Description>{val.count} post(s)</List.Description>
            </List.Content>
          </List.Item>
        );
      })
      .slice(0, 3);
  };

  render() {
    const { activeIndex } = this.state;
    const { isPrivateChannel, channel, usersPosts } = this.props;

    if (isPrivateChannel) return null;

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          ABOUT #{channel && channel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            CHANNEL DETAILS
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            TOP POSTERS
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>{usersPosts && this.displayTopPosters(usersPosts)}</List>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            CREATED BY
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as="h3">
              <Image src={channel && channel.createdBy.avatar} circular />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isPrivateChannel: state.channel.isPrivate,
    channel: state.channel.currentChannel,
    usersPosts: state.user.usersPosts,
  };
};

export default connect(mapStateToProps)(MetaPanel);
