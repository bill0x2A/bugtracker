import React from 'react';
import AuthUserContext from './Context';
import { withFirebase } from '../Firebase';

const withAuth = Component => {
    class withAuth extends Component {

        constructor(props) {
            super(props);
            this.state = {
                authUser : null,
            }
        }

        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    authUser ? this.setState({authUser}) : this.setState({authUser:null});
                }
            )
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
                <AuthUserContext.Provider value={this.state.authUser}>
                    <Component {...this.props}/>
                </AuthUserContext.Provider>
            )
        }
    }

    return withFirebase(withAuth);
}

export default withAuth;