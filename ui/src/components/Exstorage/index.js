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
            content: null,
            data: null,
            responseContract: null,
            responseMetadata: null,
            responseURI: null
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

    submitUpload = event => {
        event.preventDefault();
        const content = this.state.content;
        console.log('exstorage index.js: submitUpload', content);
        const exstorageURL = `${apiUrl}/exstorage`;
        const type = 'image/jpeg'
        const metadata = 'metadata';
        const file = {content, type, metadata};
        fetch(exstorageURL, {
            method: HTTP_METHODS.POST,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                file

            })
        })
        .then(function (response) {
            return response.json()
        })
        .then(data => {
            console.log('ui/src/component/Exstorage: submitUpload(), data from api', data.data);
            const responseString = JSON.stringify(data.data, null, 2);
            this.setState({data: responseString});
            return data;
        })
        .catch(function (error) {
            throw error;
        });
    }

    submitDownload = event => {
        event.preventDefault();
        const filename = this.state.filename;
        console.log('exstorage index.js: submitDownload', filename);
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
                console.log('ui/src/component/Exstorage: submitDownload(), data from api', data);
                this.setState({data: data.data.args.filename});
                return data;
            })
            .catch(function (error) {
                throw error;
            });
    }

    submitSign = event => {
        event.preventDefault();
        const filename = this.state.filename;
        console.log('exstorage index.js: submitSign', filename);
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
                console.log('ui/src/component/Exstorage: submitSign(), data from api', data);
                this.setState({data: data.data.args.filename});
                return data;
            })
            .catch(function (error) {
                throw error;
            });
    }


    handleChange = event => {
        this.setState({content: event.target.value});
    };


        render() {

        // const buttonMarkup =  <Button onClick={this.handleClick} color="inherit"> Upload file</Button>;
        // TODO SER-106 Add mime type for file -RA
        const formUpload =
            <form onSubmit={this.submitUpload}>
                <label>File Path: </label>
                <input type="text" style={{margin:'10px'}} onChange={this.handleChange} />
                <input type="submit" value="Upload File" size="500" maxLength="maxlength" />
            </form>

        const formUploadResult =
            <Typography variant="h6" color="inherit" className="appbar-container">
                <p align='left'> {this.state.data} </p>
            </Typography>



        console.log('ui/src/components/exstorage, render:' , this.state.data);
            return(
                <Typography variant="h6" color="inherit" className="appbar-container">
                    <div style={{height: '100vh', padding:'20px'}}>
                        <div style={{display:'flex', padding:'20px'}}>
                        {formUpload}
                        </div>
                        <div style={{display:'flex', padding:'20px'}}>
                        {formUploadResult}
                        </div>
                    </div>
                </Typography>
        )
    }
}


export default Exstorage;
