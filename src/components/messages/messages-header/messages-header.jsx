import React, { Component } from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      uniqueUsersCount,
      handleSearch,
      loadingSearch,
      isPrivateChannel,
      handleStar,
      isStarred,
    } = this.props;

    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {isPrivateChannel ? `@${channelName}` : `#${channelName}`}
            {!isPrivateChannel && (
              <Icon
                name={isStarred ? "star" : "star outline"}
                onClick={handleStar}
                color={isStarred ? "pink" : "black"}
              />
            )}
          </span>

          <Header.Subheader>
            {isPrivateChannel
              ? null
              : uniqueUsersCount > 1
              ? `${uniqueUsersCount} USERS`
              : `${uniqueUsersCount} USER`}
          </Header.Subheader>
        </Header>

        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchField"
            placeholder="SEARCH MESSAGES"
            onChange={handleSearch}
            loading={loadingSearch}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
