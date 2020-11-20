import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router';
import classes from './Projects.module.css';
import { isEmpty } from 'lodash';
import Project from '../ProjectDisplay/index';

import * as ROUTES from '../../constants/routes';

const STARTER_STATE = {
    name : '',
    loading : true,
    projectIDs : ['mve09jv09j34']
}

class AddProjectForm extends Component {
    constructor(props){
        super(props);
        this.state = { ...STARTER_STATE}
    }

    randHex = len => {
        var maxlen = 8,
            min = Math.pow(16,Math.min(len,maxlen)-1),
            max = Math.pow(16,Math.min(len,maxlen)) - 1,
            n   = Math.floor( Math.random() * (max-min+1) ) + min,
            r   = n.toString(16);
        while ( r.length < len ) {
           r = r + this.randHex( len - maxlen );
        }
        return r;
      };

    onSubmit = e => {
        e.preventDefault();

        const creatorUID = this.props.authUser.user.uid;
        const projectData = {
            name : this.state.name,
            admins : [creatorUID],
            users : [creatorUID],
            bugs : [],
        }

        const projectID = this.state.name.toLowerCase().replace(/\s/g,'-') + '-' + Math.random().toString(36).substr(2, 9);

        this.props.firebase.project(projectID).set(projectData);
        this.props.firebase.user(creatorUID).child('projects').push(projectID);

        this.props.history.go(0);
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    render() {
   
        return (
            <div>
                <p>{this.props.authUser ? "Logged in" : "Not logged in ;("}</p>
                <h1>New Project Form</h1>
                <form onSubmit = {this.onSubmit}>
                <input
                    name = "name"
                    value = {this.state.name}
                    onChange = {this.onChange}
                    type = "text"
                    placeholder = "Project Name"
                />
                <button type="submit">Submit</button>
                </form>
                <hr/>
            </div>
        )
    }
}

const ProjectsPage = props => {

    if(!isEmpty(props.authUser)){
        return(
            <div>
                <AddProjectForm {...props} />
            </div>
        )
    } else {
        props.history.push(ROUTES.LOG_IN)
        return <br/>
    }
}

const mapStateToProps = state => (
    {
        authUser : state.authUser,
    }
)

const mapDispatchToProps = dispatch => (
    {

    }
)

export default withFirebase(withRouter(connect(mapStateToProps,mapDispatchToProps)(ProjectsPage)));