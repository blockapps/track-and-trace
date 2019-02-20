import React, { Component } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@material-ui/core';

class BidTable extends Component {
  render() {
    const { bids, acceptBid } = this.props;

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
                <Button variant="contained" color="primary" onClick={() => acceptBid(bid.address)}>
                  Accept Bid
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }
}

export default BidTable;
