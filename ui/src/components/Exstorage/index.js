import React, { Component } from 'react'
import { Grid, AppBar, Typography, Toolbar } from '@material-ui/core';import { connect } from "react-redux";
import LoadingBar from 'react-redux-loading-bar';
import ReduxedTextField from "../ReduxedTextField";
import { apiUrl, HTTP_METHODS } from "../../constants";
import './Exstorage.css';



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
            uploadResponse : null,
            downloadResponse: null
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
        let form = new FormData();
        form.append('file', this.state.content);
        form.append('metadata', this.state.metadata);
        const content = this.state.content;
        const exstorageURL = `${apiUrl}/exstorage`;
        const type = this.state.fileType;
        const metadata = this.state.metadata;
        const file = {form, type, metadata};

        fetch(exstorageURL, {
            method: HTTP_METHODS.POST,
            body: form
        })
        .then(function (response) {
            return response.json()
        })
        .then(data => {
            const responseString = JSON.stringify(data.data, null, 2);
            this.setState({uploadResponse: responseString});
            return data;
        })
        .catch(function (error) {
            throw error;
        });
    }

    submitDownload = event => {
        event.preventDefault();
        const contractAddress = this.state.contractAddress;
        const exstorageURL = `${apiUrl}/exstorage/${contractAddress}`;

        const downloadArgs = {contractAddress};
        fetch(exstorageURL, {
            method: HTTP_METHODS.GET,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
            .then(function (response) {
                return response.json()
            })
            .then(data => {
                const responseString = JSON.stringify(data.data, null, 2);
                this.setState({downloadResponse: responseString});
                window.open(data.data.url);
                return data;
            })
            .catch(function (error) {
                throw error;
            });
    }

    // not used at the moment
    submitSign = event => {
        event.preventDefault();
        const filename = this.state.filename;
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
                this.setState({data: data.data.args.filename});
                return data;
            })
            .catch(function (error) {
                throw error;
            });
    }


    setContent = event => {
        this.setState({content: event.target.files[0]});
    };

    setFileType = event => {
        this.setState({fileType: event.target.value});
    };

    setMetadata = event => {
        this.setState({metadata: event.target.value});

    };
    setContractAddress = event => {
    this.setState({contractAddress: event.target.value});
    };

        render() {

        // const buttonMarkup =  <Button onClick={this.handleClick} color="inherit"> Upload file</Button>;
        const formUpload =
            <form onSubmit={this.submitUpload} enctype="multipart/form-data">
                <label>File Path: </label>
                <input type="file" onChange={this.setContent} />
                <br></br>
                <br/>
                <label>File Metadata: </label>
                <input type="text" onChange={this.setMetadata} />
                <input type="submit" value="Upload File"/>
            </form>


        const formDownload =
            <form onSubmit={this.submitDownload}>
                <label>Contract Address: </label>
                <input type="text" style={{margin:'10px'}} onChange={this.setContractAddress} />
                <input type="submit" value="Download File" size="500" maxLength="maxlength" />
            </form>

        const formUploadResult =
            <Typography variant="h7" color="inherit" className="appbar-container">
                <p align='left'> {this.state.uploadResponse} </p>
            </Typography>

        const formDownloadResult =
            <Typography variant="h7" color="inherit" className="appbar-container">
                <p align='left'> {this.state.downloadResponse} </p>
            </Typography>




            return(
                    <div>
                        <div>
                        {formUpload}
                        </div>
                        <div>
                        {formUploadResult}
                        </div>
                        <div>
                            {formDownload}
                        </div>
                        <div style={{display:'flex', padding:'20px'}}>
                            {formDownloadResult}
                        </div>
                    </div>
        )
    }
}


export default Exstorage;
