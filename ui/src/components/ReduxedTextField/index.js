import React from 'react';
import { TextField } from '@material-ui/core';

const ReduxedTextField = ({ input, meta: { touched, error }, ...others }) => (
  // TODO: check how can we add error text in same textfield
  <TextField {...input} {...others} error={touched && !!error} />
);

export default ReduxedTextField;
