import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../Firebase';
import { withRouter } from 'react-router';
import classes from './Projects.module.css';

import * as ROUTES from '../../constants/routes';

const STARTER_STATE = {
    name : '',
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
            users : [creatorUID]
        }

        const projectID = this.state.name.toLowerCase().replace(/\s/g,'-') + '-' + Math.random().toString(36).substr(2, 9);

        this.props.firebase.projects(projectID).push(projectData);
        this.props.firebase.users(creatorUID).update({projects : [projectID]});
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    render() {
        let projectIDs = 'No Projects Found....';
        this.props.firebase.users(this.props.authUser.user.uid)
                            .on("value", snapshot => {
                                return snapshot.val() ? projectIDs = snapshot.val().projects : null;
                            });
        console.log(projectIDs);
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
                <div>
                    <h1>My Projects</h1>
                    {this.props.authUser && projectIDs.map(projectID => <p>{projectID}</p>)}
                </div>
            </div>
        )
    }
}

const ProjectsPage = props => {
    if(props.authUser.user){
        return(
            <div>
                {React.createElement(withFirebase(AddProjectForm))}
            </div>
        )
    } else {
        props.history.push(ROUTES.LOG_IN)
        return
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(ProjectsPage));