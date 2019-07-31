import React, { Component } from 'react'
import { Grid, AppBar, Typography, Toolbar } from '@material-ui/core';import { connect } from "react-redux";
import LoadingBar from 'react-redux-loading-bar';
import ReduxedTextField from "../ReduxedTextField";
import { apiUrl, HTTP_METHODS } from "../../constants";



class Exstorage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formFlag: true,
            filename: null,
            data: null,
        };
    }

    componentDidMount() {
        this.setState({formFlag: true})

    }

    handleClick = event => {
        this.setState(prevState => ({
            formFlag: !prevState.formFlag
        }));
    };

    submit = event => {
        event.preventDefault();
        const filename = this.state.filename;
        console.log('exstorage index.js: submit', filename);
        const exstorageURL = `${apiUrl}/exstorage`;
        // uploadFile(this.state.file);
        fetch(exstorageURL, {
            method: HTTP_METHODS.POST,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filename
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then(data => {
            console.log('ui/src/component/Exstorage: submit(), data from api', data);
            this.setState({data: data.data.args.filename});
            return data;
        })
        .catch(function (error) {
            throw error;
        });
    }

    handleChange = event => {
        this.setState({filename: event.target.value});
    };


        render() {

        // const buttonMarkup =  <Button onClick={this.handleClick} color="inherit"> Upload file</Button>;
        const formMarkup =
            <form onSubmit={this.submit}>
                <label>File Path: </label>
                <input type="text" onChange={this.handleChange} />
                <input type="submit" value="Upload File" size="500" maxLength="maxlength" />
            </form>

        const formResult =
                <p align="left"> {this.state.data} </p>



        console.log('ui/src/components/exstorage, render:' , this.state.data);
            return(
                <Typography variant="h6" color="inherit" className="appbar-container">
                    <div style={{display: 'flex', height: '100vh', padding:'20px'}}>                {/*{buttonMarkup}*/}
                        {formMarkup}
                        {formResult}
                    </div>
                </Typography>
        )
    }
}


export default Exstorage;
