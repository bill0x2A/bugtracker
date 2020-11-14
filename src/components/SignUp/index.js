import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../../Firebase/index';

const STARTER_STATE = {
    username : '',
    email : '',
    passwordOne : '',
    passwordTwo : '',
    error : null
}

const SignUp = () => (
    <div>
        <h1>Sign Up Form</h1>
        <SignUpForm />
    </div>
)

class SignUpFormBase extends Component {

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
                               this.props.history.push(ROUTES.HOME);
                               return this.props.firebase.users(authUser.user.uid)
                                                         .set({
                                                             username,
                                                             email,
                                                             projects : [],
                                                             friends : [],
                                                             groups : []
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
            <form onSubmit = {this.onSubmit}>
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
        )
    }
}

const SignUpForm = withRouter(withFirebase(SignUpFormBase));


export default SignUp;