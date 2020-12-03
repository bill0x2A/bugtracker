import React, { Component } from 'react';
import classes from './ImageUploader.module.css';
import { withFirebase } from '../../Firebase/index';

class ImageUploader extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedFile : null,
        };
    }

    fileSelectedHandler = event => {
        this.setState({
            selectedFile : event.target.files[0]
        })
    }

    fileUploadHandler = () => {
        const uid = this.props.uid;
        
        this.props.firebase.picture(uid).set(this.state.selectedFile);
    }

    render(){
        return(
            <div>
                <input type = "file" onChange = {this.fileSelectedHandler}></input>
            </div>
        )
    }
}

export default withFirebase(ImageUploader);