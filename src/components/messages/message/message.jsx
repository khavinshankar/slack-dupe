import React from "react";
import * as timeago from "timeago.js";
import { Comment, Image } from "semantic-ui-react";

const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const Message = ({ message, user }) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content
        className={message.user.id === user.uid ? "message-self" : ""}
      >
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timeago.format(message.timestamp)}</Comment.Metadata>

        {isImage(message) ? (
          <Image src={message.image} className="message-image" />
        ) : (
          <Comment.Text>{message.content}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  );
};

export default Message;
