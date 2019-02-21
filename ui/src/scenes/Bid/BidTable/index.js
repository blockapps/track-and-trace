import React, { Component } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@material-ui/core';
import './bidTable.css';

class BidTable extends Component {

  acceptBidButton = (bid) => {
    const { handleEvent, isManufacturer, bidEvent } = this.props;
    if (isManufacturer) {
      return (
        <Button variant="contained" color="primary" className="event-button" onClick={() => handleEvent(bid.address, bid.chainId, bidEvent.ACCEPT)}>
          Accept Bid
        </Button>
      )
    }
  }

  rejectBidButton = (bid) => {
    const { handleEvent, isManufacturer, bidEvent } = this.props;
    if (isManufacturer) {
      return (
        <Button variant="contained" color="primary" className="event-button" onClick={() => handleEvent(bid.address, bid.chainId, bidEvent.REJECT)}>
          Reject Bid
        </Button>
      )
    }
  }

  render() {
    const { bids } = this.props;

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bid Address</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid, key) =>
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {bid.address}
              </TableCell>
              <TableCell>{bid.value}</TableCell>
              <TableCell>
                {this.acceptBidButton(bid)}
                {this.rejectBidButton(bid)}
              </TableCell>
            </TableRow>
          )}
          {
            !bids.length &&
            <TableRow>
              <TableCell colSpan={3} align="center"> No bids found </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    )
  }
}

export default BidTable;
