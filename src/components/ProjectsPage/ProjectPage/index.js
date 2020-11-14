import React from 'react';
import { withFirebase } from '../../../Firebase';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

const ProjectPage = props => {
    props.firebase.users(props.authUser.user.uid).ref.on("value", function(snapshot) {
        console.log(snapshot.val());
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    return (
        <div>
            {props.firebase.projects().once("value", snap => (
                <div>{snap.val()}</div>
            ))}
        </div>
    )
}

const ProjectPageWithAuth = props => {
    if(props.authUser.user.uid){
        return ProjectPage
    } else {
        props.history.push(ROUTES.LANDING);
    }
}

const mapStateToProps = state => {
    return ({
        authUser : state.authUser,
    })
} 

export default withRouter(withFirebase(connect(mapStateToProps, null)(ProjectPageWithAuth)));