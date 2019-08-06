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
        console.log('u/src/components/formdata in submitUpload@@@@@@@@@', form);
        const content = this.state.content;
        console.log('exstorage index.js: submitUpload', content);
        const exstorageURL = `${apiUrl}/exstorage`;
        const type = this.state.fileType;
        const metadata = this.state.metadata;
        const file = {form, type, metadata};
        // console.log('ui/src/components/exstorage/index file in submitUpload', file);

        fetch(exstorageURL, {
            method: HTTP_METHODS.POST,
            body: form
        })
        .then(function (response) {
            return response.json()
        })
        .then(data => {
            console.log('ui/src/component/Exstorage: submitUpload(), data from api', data.data);
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
        console.log('exstorage index.js: submitDownload', contractAddress);
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
                console.log('ui/src/component/Exstorage: submitUpload(), data from api', data);
                const responseString = JSON.stringify(data.data, null, 2);
                this.setState({downloadResponse: responseString});
                window.open(data.data.url);
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
        console.log('ui/src/components/Exstroage/index.js event.target.value =', event.target.files[0]);
        this.setState({content: event.target.files[0]});
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
            <form onSubmit={this.submitUpload} enctype="multipart/form-data">
                <label>File Path: </label>
                <input type="file" onChange={this.setContent} />
                <label>File Type: </label>
                <select onChange={this.setFileType}>
                    <option value="" disabled selected>Select a file type</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                    <option value="plain text">plain text</option>
                    <option value="pdf">pdf</option>
                </select>
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





        console.log('ui/src/components/exstorage, render:' , this.state.data);
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
