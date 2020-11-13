import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../../Firebase/index';

const STARTER_STATE = {
    email : '',
    password : '',
    error : null
}

const SignIn = () => {
    
    return (
    <div>
        <h1>Sign In</h1>
        <SignInForm />
    </div>
    )
};


class SignInFormBase extends Component {

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
            <form onSubmit = {this.onSubmit}>
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
        )
    }
}

const SignInForm = withRouter(withFirebase(SignInFormBase));

export default SignIn;