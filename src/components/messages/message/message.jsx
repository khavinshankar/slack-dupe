import React from "react";
import * as timeago from "timeago.js";
import { Comment } from "semantic-ui-react";

const Message = ({ message, user }) => {
  var d = new Date(message.timestamp);
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content
        className={message.user.id === user.uid ? "message-self" : ""}
      >
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timeago.format(message.timestamp)}</Comment.Metadata>
        <Comment.Text>{message.content}</Comment.Text>
      </Comment.Content>
    </Comment>
  );
};

export default Message;
