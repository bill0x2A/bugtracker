import React, { Component } from 'react';
import { withFirebase } from '../../Firebase/index';
import { withRouter, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import Loading from '../Loading/Loading';
import classes from './AdminPage.module.css';
import * as ROUTES from '../../constants/routes';

const STARTER_STATE = {
    loading : true,
    users : [],
    project : null,
    bugs : [],
    admins : [],
    friends : [],
    thisUser : null,
}

class AdminPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading : true,
        }
    }

    componentDidMount(){
        this.loadProjectToState();
    }

    loadProjectToState = () => {
        this.props.firebase.project(this.props.pid)
                           .on("value", dataSnapshot => {
                                const project = dataSnapshot.val();
                                const RESET_STATE = {...STARTER_STATE}
                                RESET_STATE.project = project;
                                RESET_STATE.loading = false;
                                this.setState(RESET_STATE, () => {
                                    this.loadAdminsToState();
                                    this.loadBugsToState();
                                    this.loadUsersToState();
                                });
                           })
        }

    loadUsersToState = () => {
        try {
            const userIDs  = [...Object.values(this.state.project.users)],
                  userKeys = [...Object.keys(this.state.project.users)];

            for(let i=0;i<userIDs.length;i++){
                this.props.firebase.user(userIDs[i]).once('value').then(dataSnapshot => {
                    let users = [...this.state.users];
                    const newUser = {
                        ...dataSnapshot.val(),
                        uid : userIDs[i],
                        projectKey : userKeys[i],
                    }
                    users.push(newUser);
                    this.setState({users:users});

                    if(newUser.uid === this.props.authUser.user.uid){
                        this.setState({thisUser : newUser}, () => {
                            console.log("Setting this user");
                            this.loadFriendsToState();
                        });
                    }
                })
            }
        } catch(e){
            // Do nothing
        }
    }

    loadAdminsToState = () => {
        try {
            const adminIDs  = [...Object.values(this.state.project.admins)],
                  adminKeys = [...Object.keys(this.state.project.admins)];

            for(let i=0;i<adminIDs.length;i++){
                this.props.firebase.user(adminIDs[i]).once('value').then(dataSnapshot => {
                    let admins = [...this.state.admins];
                    const newAdmin = {
                        ...dataSnapshot.val(),
                        uid : adminIDs[i],
                        projectKey : adminKeys[i],
                    }
                    admins.push(newAdmin);
                    this.setState({admins:admins});
                })
            }
        } catch(e){
            // Do nothing
        } 
    }

    loadBugsToState = () => {
        try {
            const bugIDs = this.state.project.bugs;
            bugIDs.forEach(id => {
                this.props.bug(id).once("value").then(dataSnapshot => {
                    let bugs = [...this.state.bugs];
                    const newBug = {
                        ...dataSnapshot.val(),
                        id : id,
                    }
                    bugs.push(newBug);
                    this.setState({bugs:bugs});
                })
            })
        } catch(e){
            this.setState({noBugs : true});
        }
    }

    loadFriendsToState = () => {
        try {
            const friendIDs = [...Object.values(this.state.thisUser.friends)];
            friendIDs.forEach(friendID => {
                this.props.firebase.user(friendID)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let friends = [...this.state.friends];

                                       const newFriend = {
                                           ...dataSnapshot.val(),
                                           uid : friendID,
                                       }
                                       friends.push(newFriend);
                                       this.setState({friends:friends}, console.log("loaded friends to state"));
                                   })
            })
        } catch(e) {

        }
    }

    removeUser = user => {
        this.props.firebase.project(this.props.pid)
                           .child("users")
                           .child(user.projectKey)
                           .remove();
        this.props.firebase.user(user.uid)
                           .child("projects")
                           .child(this.props.pid)
                           .remove();
    }

    addUser = user => {
        this.props.firebase.project(this.props.pid)
                           .child("users")
                           .child(user.uid)
                           .set(user.uid);
    }

    addAdmin = user => {
        this.props.firebase.project(this.props.pid)
                           .child("admins")
                           .child(user.uid)
                           .set(user.uid);
    }

    removeAdmin = user => {
        this.props.firebase.project(this.props.pid)
                           .child("admins")
                           .child(user.projectKey)
                           .remove();
    }

    render(){
        const {users, admins, friends} = this.state;
        return (
            !this.state.loading ? (
                <div className={classes.Container}>
                    <h2>Admin Page - {this.state.project.name}</h2>
                    <div className={classes.Main}>
                        <div className={classes.UsersContainer}>
                            <h2>User Management</h2>
                            {users.map(user => <User 
                                                    admin = {admins.includes(user)}
                                                    kick  = {() => this.removeUser(user)}
                                                    addAdmin = {() => this.addAdmin(user)}
                                                    user = {user}
                                                />)}
                        </div>
                        <div className={classes.UsersContainer}>
                        <h2>Admin Management</h2>
                            {admins.map(admin => <Admin 
                                                    removeAdmin = {() => this.removeAdmin(admin)}
                                                    admin = {admin}
                                                />)}
                        </div>
                        <div className={classes.UsersContainer}>
                        <h2>Add Users</h2>
                            {friends.map(friend => <Friend 
                                                    add = {() => this.addUser(friend)}
                                                    friend = {friend}
                                                />)}
                        </div>                                  
                    </div>
                </div>
            ) : <Loading />
        )
    }
}

const User = props => {

    const { username, image } = props.user;

    return (
        <div className = {classes.User}>
            <div className = {classes.UserInfo}>
                <img src = {image}/>
                <h3>{username}</h3>
            </div>
            <div className={classes.Controls}>
                <div className = {classes.KickButton} onClick = {props.kick}>Kick</div>
                <div className = {classes.AdminButton} onClick = {props.addAdmin}>Make Admin</div>
            </div>
        </div>
    )
}

const Admin = props => {

    const { username, image } = props.admin;

    return (
        <div className = {classes.User}>
            <div className = {classes.UserInfo}>
                <img src = {image}/>
                <h3>{username}</h3>
            </div>
            <div className={classes.Controls}>
                <div className = {classes.AdminButton} onClick = {props.removeAdmin}>Remove</div>
            </div>
        </div>
    )
}

const Friend = props => {

    const { username, image } = props.friend;

    return (
        <div className = {classes.User}>
            <div className = {classes.UserInfo}>
                <img src = {image}/>
                <h3>{username}</h3>
            </div>
            <div className={classes.Controls}>
                <div className = {classes.AdminButton} onClick = {props.add}>Add To Project</div>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

const AdminPageWithAuth = props => {
    const projectID = useParams().id;
    if(props.authUser.user.uid){
        return <AdminPage auth {...props} pid = {projectID} />
    } else {
        props.history.push(ROUTES.LANDING);
        return <hr/>
    }
}

export default connect(mapStateToProps)(withRouter(withFirebase(AdminPageWithAuth)));