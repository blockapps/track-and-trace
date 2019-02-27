import React from 'react';
import { Stepper, Step, StepLabel, StepContent, Typography, Card } from '@material-ui/core';
import './auditLog.css';

class AuditLog extends React.Component {

  renderContent(history) {
    const { BID_STATE, ASSET_STATE } = this.props;

    if (history.type === "BID") {
      return (
        <Typography>
          State: {BID_STATE[parseInt(history.bidState)]}
        </Typography>)
    } else {
      return (
        <Typography>
          State: {ASSET_STATE[parseInt(history.assetState)]}
        </Typography>
      )
    }
  }

  render() {
    const { history } = this.props;
    const steps = history ? history : [];

    return (
      <div className="audit-container">
        <Stepper activeStep={steps.length} orientation="vertical">
          {steps.reverse().map((history, index) => (
            <Step key={history.address} index={index}>
              <StepLabel>
                <b>
                  {history.address} ({history.block_timestamp})
                </b>
              </StepLabel>
              <StepContent active={true}>
                <Typography>
                  Type: {history.type}
                </Typography>
                {this.renderContent(history)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  }
}

export default AuditLog;
