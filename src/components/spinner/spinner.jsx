import React from "react";
import { Loader } from "semantic-ui-react";

const Spinner = ({ content }) => {
  return <Loader active size="huge" content={content} />;
};

export default Spinner;
