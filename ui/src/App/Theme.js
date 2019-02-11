import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = (props) => {
  return createMuiTheme({
    palette: {
      primary: {
        main: props.color
      }
    }
  })
}

class ThemedComponent extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme(this.props)}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default ThemedComponent;
