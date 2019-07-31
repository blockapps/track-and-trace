import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import LoadingBar from 'react-redux-loading-bar';
import ReduxedTextField from "../ReduxedTextField";
import { apiUrl, HTTP_METHODS } from "../../constants";



class Exstorage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formFlag: true,
            filename: null,
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
        .then(function (data) {
            console.log('ui/src/component/Exstorage: submit', data);
            return data;
        })
        .catch(function (error) {
            throw error;
        });
    }

    handleChange = event => {
        this.setState({filename: event.target.value});
        console.log(this.state.filename);
    };


        render() {

        // const buttonMarkup =  <Button onClick={this.handleClick} color="inherit"> Upload file</Button>;

        const formMarkup =
            <form onSubmit={this.submit}>
                <label>File Path: </label>
                <input type="text" onChange={this.handleChange} />
                <input type="submit" value="Upload File" />
            </form>

        return(
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>                {/*{buttonMarkup}*/}
                {formMarkup}
            </div>
        )
    }
}


export default Exstorage;
