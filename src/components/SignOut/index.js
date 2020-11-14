import React from 'react';
import { withFirebase } from '../../Firebase/index';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import * as ROUTES from '../../constants/routes';
import * as actionTypes from '../../store/actionTypes';

const SignOut = ({ firebase }, props) => {
    const history = useHistory();
    return (
            <button type="button"
                    onClick={() => {
                                     firebase.doSignOut();
                                     history.push(ROUTES.LANDING);
                                   }
                                }
                            >
                                Sign Out
                            </button>)
    };

const mapDispatchToProps = dispatch => (
    {
        logout : dispatch({type : actionTypes.LOGOUT})
    }
)

export default connect(null, mapDispatchToProps)(withFirebase(SignOut));