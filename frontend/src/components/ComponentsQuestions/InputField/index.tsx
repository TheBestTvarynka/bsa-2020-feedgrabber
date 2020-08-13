import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import "./style.scss";

const InputField: React.FunctionComponent = () => {
  return (
    <div className="form_main-container">
      <Form className="form_container">
        <Form.Input placeholder="Here should be answer..." disabled />
      </Form>
    </div>
  );
};

export default InputField;