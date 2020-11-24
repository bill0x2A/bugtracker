import React, { Component } from 'react';
import classes from '../UserPage.module.css';
import testpp from '../../../assets/default.png';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../Firebase/index';
import { connect } from 'react-redux';
import Project from '../../ProjectDisplay/index';

class UserPage extends Component {
    constructor(){
        super();
        this.state = {
            userIsFriend : false,
            loadingUser : true,
            loadingProjects : true,
            projects : [],
        }
    }

    componentDidMount(){
        this.loadUserToState();
    }

    loadUserToState = () => {
        const uid = this.props.match.params.uid;
        this.props.firebase.user(uid)
                           .once("value")
                           .then(dataSnapshot => {
                               const user = {
                                   ...dataSnapshot.val(),
                                   uid : uid,
                               }
                               this.setState({ user:user , loadingUser : false });
                               this.loadProjectsToState();
                           })
    }

    loadProjectsToState = () => {
        let projectIDs = null;
        try {
            projectIDs = [...Object.values(this.state.user.projects)];
        } catch(e) {

        }
        projectIDs.forEach(pid => {
            this.props.firebase.project(pid)
                               .once("value")
                               .then(dataSnapshot => {
                                   let projects = [...this.state.projects];
                                   const newProject = {
                                       ...dataSnapshot.val(),
                                       pid : pid,
                                   }
                                   projects.push(newProject);
                                   this.setState({ projects:projects, loadingProjects:false });
                               })
        })
    }

    loadFriendsToState = () => {
        let friendUIDs = null;
        try {
            friendUIDs = [...Object.values(this.state.user.friends)];
        } catch(e) {

        }
        friendUIDs.forEach(uid => {
            this.props.firebase.user(uid)
                               .once("value")
                               .then(dataSnapshot => {
                                   let friends = [...this.state.friends];
                                   const newFriend = dataSnapshot.val();
                                   friends.push(newFriend);
                                   this.setState({ friends:friends });
                               })
        })

        // Check if the user is a friend of the logged in user, save result to state
        const thisUserUID = this.props.authUser.user.uid;
        if(friendUIDs.includes(thisUserUID)){
            this.setState({ userIsFriend:true })
        }  
    }

    inviteFriend = () => {
        const thisUserUID = this.props.authUser.user.uid;
        const uid = this.props.match.params.uid;

        const newInvite = {
            from : thisUserUID,
            to   : uid,
            type : "friend",
            data : null,
        }

        const newKey = this.props.firebase.invites()
                                          .push(newInvite)
                                          .getKey();

        this.props.firebase.user(uid).child("invitations").push(newKey);
        this.props.firebase.user(thisUserUID).child("invitations").push(newKey);
    }

    removeFriend = () => {
        this.props.firebase.user(this.props.authUser.user.uid)
                           .child(`friends/${this.props.match.params.uid}`)
                           .remove();
        this.props.firebase.user(this.props.match.params.uid)
                           .child(`friends/${this.props.authUser.user.uid}`)
                           .remove();
    }

    render() {
        return (
            <div className ={classes.Container}>
                <div className={classes.BasicInfoContainer}>
                    {this.state.loadingUser ? <p>Loading...</p> : (<React.Fragment>
                                                                     <img src ={this.state.user.image}/>
                                                                     <h2>{this.state.user.username}</h2>
                                                                   </React.Fragment>)}
                </div>
                <button className={classes.Button} onClick = {this.inviteFriend}>Add friend</button>
                <div className={classes.ProjectsContainer}>
                    <h2>Projects</h2>
                    {this.state.loadingProjects ? <p>Loading...</p> : this.state.projects.map(project => (
                        <Project project={project} />
                    ))}
                </div>
            </div>
        )
    }
}

const Friend = props => {
    const { user } = props;

    return (
        <div className = {classes.Friend}>
            <img></img>
        </div>
    )
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default connect(mapStateToProps,null)(withRouter(withFirebase(UserPage)));