import React from 'react';
import { Stepper, Step, StepLabel } from '@material-ui/core';
import './auditLog.css';

function getSteps() {
  // TODO: Change when actual API is integrated
  return ['Distributer Requested bid', 'Distributer Requested bid', 'Distributer Requested bid'];
}

class AuditLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0
    };
  }

  render() {
    const steps = getSteps();
    const { activeStep } = this.state;

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