import React, { Component } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

class SpecTable extends Component {
  render() {
    const { asset } = this.props;
    const spec = Object.keys(asset).length ? asset.keys : [];
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spec.map((bid, key) =>
            <TableRow key={key}>
              <TableCell component="th" scope="row"> {asset.keys[key]} </TableCell>
              <TableCell>{asset.values[key]}</TableCell>
            </TableRow>
          )}
          {
            !spec.length &&
            <TableRow>
              <TableCell colSpan={2} align="center"> No Specs found </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    )
  }
}

export default SpecTable;
