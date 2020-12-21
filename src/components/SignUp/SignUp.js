import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from '../../Firebase/index';
import { connect } from 'react-redux';
import classes from './SignUp.module.css';
import * as ROUTES from '../../constants/routes';
import * as actionTypes from '../../store/actionTypes';

const STARTER_STATE = {
    username : '',
    email : '',
    passwordOne : '',
    passwordTwo : '',
    error : null
}


class SignUpForm extends Component {

    constructor(props){
        super(props);
        this.state = { ...STARTER_STATE};
    }

    onSubmit = e => {
        e.preventDefault();

        const { username, email, passwordOne } = this.state;

        this.props.firebase.doCreateUserWithEmailAndPassword(email, passwordOne)
                            .then( authUser => {
                               this.setState({ ...STARTER_STATE});

                               this.props.login(authUser);
                               this.props.tutorial();
                               this.props.firebase.project("example-project-bm6y7rwvb")
                                                  .child("users")
                                                  .child(authUser.user.uid)
                                                  .set(authUser.user.uid);

                               this.props.history.push(ROUTES.HOME);

                               //Push a friend request

                               return this.props.firebase.user(authUser.user.uid)
                                                         .set({
                                                             username,
                                                             email,
                                                             projects : {"example-project-bm6y7rwvb" : "example-project-bm6y7rwvb"},
                                                             image : "https://i.imgur.com/99YSV5t.png",
                                                         })

                           }).catch(error => {
                               this.setState({error : error});
                           })
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    render () {

        const isInvalid = 
            this.state.passwordOne !== this.state.passwordTwo ||
            this.state.passwordOne === '' ||
            this.state.username === '' ||
            this.state.email === '';

        return (
            <div className = {classes.Container}>
                <form onSubmit = {this.onSubmit}>
                    <h2>Sign Up</h2>
                    <input
                        name="username"
                        value={this.state.username}
                        onChange={this.onChange}
                        type="text"
                        placeholder="Username"
                    />
                    <input
                        name="email"
                        value={this.state.email}
                        onChange={this.onChange}
                        type="text"
                        placeholder="Email Address"
                    />
                    <input
                        name="passwordOne"
                        value={this.state.passwordOne}
                        onChange={this.onChange}
                        type="password"
                        placeholder="Password"
                    />
                    <input
                        name="passwordTwo"
                        value={this.state.passwordTwo}
                        onChange={this.onChange}
                        type="password"
                        placeholder="Confirm Password"
                    />
                    <button disabled = {isInvalid} type="submit">Sign Up</button>
            
                    {this.state.error && <p>{this.state.error.message}</p>}
                </form>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => (
    {
        login : authUser => dispatch({ type: actionTypes.LOGIN, authUser : authUser}),
        tutorial : () => dispatch({type: actionTypes.ACTIVATE_TUTORIAL}),
    }
)


export default connect(null, mapDispatchToProps)(withRouter(withFirebase(SignUpForm)));