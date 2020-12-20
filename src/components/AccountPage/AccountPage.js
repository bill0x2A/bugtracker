import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../Firebase/index';
import classes from './AccountPage.module.css';
import Loading from '../Loading/Loading';
import defaultpp from '../../assets/default.png'
import { withRouter } from 'react-router-dom';
import ImageUploader from '../ImageUploader/ImageUploader';


class AccountPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            user : null,
            loading : true,
            confirmDeleting : false,
        }
    }

    componentDidMount(){
        this.loadUserToState();
    }

    loadUserToState = () => {
        const uid = this.props.authUser.user.uid;

        this.props.firebase.user(uid).once("value").then(snap => {
            const user = {
                ...snap.val(),
                uid : uid,
            };
            this.setState({user:user, loading : false});
        })
    }

    deleteAccount = () => {
        const uid = this.props.authUser.user.uid;
        this.props.firebase.user(uid).remove();
        this.props.firebase.doDeleteAccount();
        this.props.history.push('/');
    }

    onChange = e => {
        this.setState({ [e.target.name]:e.target.value });
    }

    onSubmit = () => {
        let { user, selectedFile } = this.state,
        uid = user.uid;

        this.props.firebase.image(uid).delete();
        this.props.firebase.image(uid)
                           .put(selectedFile)
                           .then( () => {
                               this.props.firebase.image(uid)
                                                  .getDownloadURL()
                                                  .then(url => {
                                                    user.image = url;
                                                    this.props.firebase.user(uid)
                                                                       .set(user);
                               })
                           });
        this.props.history.push('/home');
    }

    fileSelectedHandler = event => {
        const blob = new Blob(event.target.files),
              url = URL.createObjectURL(blob);
        this.setState({
            selectedFile : event.target.files[0],
            filePreview : url,
        })
    }    

    render() {


        const { filePreview, loading, user } = this.state;

        return (
            <div className={classes.Container}>
                {this.state.confirmDeleting && <DeleteAccount 
                                                    delete={this.deleteAccount}
                                                    cancel = {() => this.setState({confirmDeleting:false})}
                                                />}
                <div className={classes.BasicInfoContainer}>
                    {loading ?  <Loading /> : (<React.Fragment>
                                                            <img src ={user.image ? user.image : defaultpp}/>
                                                            <h2>Edit Account Info</h2>
                                                          </React.Fragment>)}
                </div>
{loading ? <Loading /> :  (<div className = {classes.Main}>
                    <div className = {classes.Form}>
                        <h3>Username</h3>
                        <input
                            type="text"
                            name="username"
                            onChange = {this.onChange}
                            value = {user.username}
                            placeholder="Username"
                        />
                        <h3>Bio</h3>
                        <textarea
                            type="text"
                            name="bio"
                            onChange = {this.onChange}
                            value = {user.bio}
                            placeholder="bio"
                        />
                        <h3>Profile Picture</h3>
                        <input
                            type = "file"
                            onChange = {this.fileSelectedHandler}
                        />
                        {<img
                            className={classes.ImagePreview}
                            src={filePreview}
                        />}
                        <button className={classes.Button} onClick = {this.onSubmit}>Submit Changes</button>
                        <div 
                         className={classes.DeleteButton}
                            onClick ={() => this.setState({confirmDeleting : true})}>
                            DELETE ACCOUNT
                        </div>
                    </div>

                </div>)}

            </div>
        )
    }
}

const DeleteAccount = props => {
    return (
        <div className = {classes.FullscreenContainer}>
            <div className={classes.DeleteContainer}>
                <h3>Are you sure you wish to delete your account?</h3>
                <div className = {classes.DeleteButtons}>
                    <div className={classes.Confirm}
                        onClick = {props.delete}>YES</div>
                    <div className={classes.Cancel}
                        onClick = {props.cancel}>NO!</div>
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default withRouter(withFirebase(connect(mapStateToProps, null)(AccountPage)));