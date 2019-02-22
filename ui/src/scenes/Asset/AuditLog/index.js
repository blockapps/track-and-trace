import React from 'react';
import { Stepper, Step, StepLabel } from '@material-ui/core';
import './auditLog.css';

function getSteps() {
  return ['Asset Created', 'Bid Requested', 'Owned'];
}

class AuditLog extends React.Component {
  render() {
    const steps = getSteps();
    const { activeStep } = this.props;

    return (
      <div className="audit-container">
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label} index={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  }
}

export default AuditLog;
