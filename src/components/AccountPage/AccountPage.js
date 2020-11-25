import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../Firebase/index';
import classes from './AccountPage.module.css';
import Loading from '../Loading/Loading';
import defaultpp from '../../assets/default.png'
import { withRouter } from 'react-router-dom';


class AccountPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            user : null,
            loading : true,
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
            this.setState({...user, loading : false});
        })
    }

    onChange = e => {
        this.setState({ [e.target.name]:e.target.value });
    }

    onSubmit = () => {
        this.props.firebase.user(this.state.uid).set(this.state);
        this.props.history.push('/home');
    }
    

    render() {
        console.log(this.state);
        return (
            <div className={classes.Container}>
                <div className={classes.BasicInfoContainer}>
                    {this.state.loading ?  <Loading /> : (<React.Fragment>
                                                            <img src ={this.state.image ? this.state.image : defaultpp}/>
                                                            <h2>Edit Account Info</h2>
                                                          </React.Fragment>)}
                </div>
                <div className = {classes.Main}>
                    <div className = {classes.Form}>
                        <h3>Profile Picture</h3>
                        <input
                            type="text"
                            name="image"
                            onChange = {this.onChange}
                            value = {this.state.image}
                            placeholder="Profile Picture URL"
                        />
                        <h3>Username</h3>
                        <input
                            type="text"
                            name="username"
                            onChange = {this.onChange}
                            value = {this.state.username}
                            placeholder="Username"
                        />
                        <h3>Bio</h3>
                        <textarea
                            type="text"
                            name="bio"
                            onChange = {this.onChange}
                            value = {this.state.bio}
                            placeholder="bio"
                        />
                        <button onClick = {this.onSubmit}>Submit Changes</button>
                    </div>
                </div>

            </div>
        )
    }
}


const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default withRouter(withFirebase(connect(mapStateToProps, null)(AccountPage)));