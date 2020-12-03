import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import classes from './SignIn.module.css';

import * as ROUTES from '../../constants/routes';
import * as actionTypes from '../../store/actionTypes';
import { withFirebase } from '../../Firebase/index';

import { connect } from 'react-redux';

const STARTER_STATE = {
    email : '',
    password : '',
    error : null
}


class SignInForm extends Component {

    constructor(props){
        super(props);
        this.state = { ...STARTER_STATE};
    }

    onSubmit = e => {
        e.preventDefault();

        const {email, password} = this.state;

        this.props.firebase.doSignInWithEmailAndPassword(email, password)
                           .then(user => {
                               this.setState({ ...STARTER_STATE});
                               this.props.login(user);
                               this.props.history.push(ROUTES.HOME);
                           })
                           .catch(error => {
                               this.setState({error:error});
                           })
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    render () {
        const isInvalid = this.state.password === '' || this.state.email === '';
        return (
            <div className = {classes.Container}>
                <form onSubmit = {this.onSubmit}>
                <h2>Sign In</h2>
                    <input
                        name = "email"
                        value = {this.state.email}
                        onChange = {this.onChange}
                        type = "text"
                        placeholder = "email"
                    />
                    <input
                        name = "password"
                        value = {this.state.password}
                        onChange = {this.onChange}
                        type = "password"
                        placeholder = "password"
                    />
                    <button disabled = {isInvalid} type = "submit">Sign In</button>
                    {this.state.error && <p>{this.state.error.message}</p>}
                </form>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => (
    {
        login : authUser => dispatch({ type: actionTypes.LOGIN, authUser : authUser})
    }
)

export default connect(null, mapDispatchToProps)(withRouter(withFirebase(SignInForm)));
