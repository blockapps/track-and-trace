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
            fileType: null,
            metadata: null,
            contractAddress: null,
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
        const type = this.state.fileType;
        const metadata = this.state.metadata;
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
        //TODO change data variable name -RA
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
        const contractAddress = this.state.contractAddress;
        console.log('exstorage index.js: submitDownload', contractAddress);
        const exstorageURL = `${apiUrl}/exstorage`;

        const downloadArgs = {contractAddress};
        fetch(exstorageURL, {
            method: HTTP_METHODS.POST,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                downloadArgs
            })
        })
            .then(function (response) {
                return response.json()
            })
            .then(data => {
                console.log('ui/src/component/Exstorage: submitUpload(), data from api', data);
                const responseString = JSON.stringify(data.data, null, 2);
                this.setState({contractAddress: responseString});
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


    setContent = event => {
        this.setState({content: event.target.value});
    };

    setFileType = event => {
        this.setState({fileType: event.target.value});
    };

    setMetadata = event => {
        this.setState({metadata: event.target.value});
        console.log('ui/src/components/exstorage/index changeMetadata', this.state.metadata);

    };
    setContractAddress = event => {
    this.setState({contractAddress: event.target.value});
    console.log('ui/src/components/exstorage/index changeMetadata', this.state.metadata);

    };

        render() {

        // const buttonMarkup =  <Button onClick={this.handleClick} color="inherit"> Upload file</Button>;
        const formUpload =
            <form onSubmit={this.submitUpload}>
                <label>File Path: </label>
                <input type="text" style={{margin:'10px'}} onChange={this.setContent} />
                <label>File Type: </label>
                <select style={{margin:'10px'}} onChange={this.setFileType}>
                    <option value="" disabled selected>Select a file type</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                    <option value="plain text">plain text</option>
                    <option value="pdf">pdf</option>
                </select>
                <label>File Metadata: </label>
                <input type="text" style={{margin:'10px'}} onChange={this.setMetadata} />
                <input type="submit" value="Upload File" size="500" maxLength="maxlength" />
            </form>


        const formDownload =
            <form onSubmit={this.submitDownload}>
                <label>Contract Address: </label>
                <input type="text" style={{margin:'10px'}} onChange={this.setContractAddress} />
                <input type="submit" value="Download File" size="500" maxLength="maxlength" />
            </form>

        const formUploadResult =
            <Typography variant="h6" color="inherit" className="appbar-container">
                <p align='left'> {this.state.data} </p>
            </Typography>

        const formDownloadResult =
            <Typography variant="h6" color="inherit" className="appbar-container">
                <p align='left'> {this.state.contractAddress} </p>
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
                        <div style={{display:'flex', padding:'20px'}}>
                            {formDownload}
                        </div>
                        <div style={{display:'flex', padding:'20px'}}>
                            {formDownloadResult}
                        </div>
                    </div>
                </Typography>
        )
    }
}


export default Exstorage;
