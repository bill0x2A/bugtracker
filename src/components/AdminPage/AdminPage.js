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
                                    this.userIsAdmin();
                                    this.projectHasMultipleAdmins();
                                    this.projectHasUsers();
                                });
                           })
        }

    userIsAdmin = () => {
        const admins = [...Object.values(this.state.project.admins)];
        if(admins.includes(this.props.authUser.user.uid)){
            return true
        } else {
            this.props.history.push("/projects/" + this.props.projectID);
            return false
        }
    }

    projectHasMultipleAdmins = () => {
        const admins = [...Object.values(this.state.project.admins)];
        if(admins.length === 1){
            this.setState({lastAdmin : true});
        } else {
            this.setState({lastAdmin : false});
        }
    }

    projectHasUsers = () => {
        const users = [...Object.values(this.state.project.users)];
        if(users.length === 0){
            this.props.firebase.project(this.props.pid).remove();
        }
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
            const bugIDs = [...Object.values(this.state.project.bugs)];

            bugIDs.forEach(id => {
                this.props.firebase.bug(id).once("value").then(dataSnapshot => {
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
            console.log(e);
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

        this.props.firebase.user(user.uid)
                           .child("projects")
                           .child(this.props.pid)
                           .set(this.props.pid);
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

    deleteBugHandler = bug => {
        const { id } = bug;

        this.props.firebase.bug(id).remove();
        this.props.firebase.project(this.props.pid)
                           .child("bugs")
                           .child(id)
                           .remove();
    }

    confirmingDeleteHandler = () => {
        this.setState({confirmingDelete:true})
    }

    confirmDeleteHandler = () => {
        this.props.firebase.project(this.props.pid).remove();
        this.props.history.push("/home");
    }

    render(){
        const {project, users, admins, friends, bugs} = this.state;

        let userList, adminList = [];

        try {
            userList = [...Object.values(project.users)];
            adminList = [...Object.values(project.admins)];
        } catch (e){
            // Do nothing
        }

        const confirmingDelete = (
            <div className = {classes.ModalContainer}>
                <div className = {classes.ConfirmDelete}>

                    <h2>Are you sure? This action cannot be undone.</h2>
                    <div className = {classes.Controls}>
                        <div onClick = {this.confirmDeleteHandler} className ={classes.ConfirmButton}>CONFIRM DELETE</div>
                        <div onClick = {() => this.setState({confirmingDelete:false})} className = {classes.CancelButton}>NO!</div>
                    </div>
                </div>
            </div>
        )

        return (
            !this.state.loading ? (
                <div className={classes.Container}>
                    {this.state.confirmingDelete && confirmingDelete}
                    <h2>Admin Page - {this.state.project.name}</h2>
                    <p>Welcome to your admin controls, please note that projects must keep at least one admin and projects with no remaining users are deleted.</p>
                    <p>To add a user to the project, they must first accept your friend request.</p>
                    <div className={classes.Main}>
                        <div className={classes.UsersContainer}>
                            <h2>User Management</h2>
                            {users
                                .filter(user => !adminList.includes(user.uid))
                                .map(user => <User 
                                                    admin = {adminList.includes(user.uid)}
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
                                                    lastAdmin = {this.state.lastAdmin}
                                                />)}
                        </div>
                        <div className={classes.UsersContainer}>
                        <h2>Add Users</h2>
                            {friends
                                .filter(friend => !userList.includes(friend.uid))
                                .map(friend => <Friend 
                                                    add = {() => this.addUser(friend)}
                                                    friend = {friend}
                                                />)}
                        </div> 
                        <div className={classes.UsersContainer}>
                        <h2>Bug Removal</h2>
                            {bugs.map(bug => <Bug 
                                                bug = {bug}
                                                delete = {() => this.deleteBugHandler(bug)}
                                            />)}
                        </div>                                                            
                    </div>
                    <div onClick = {this.confirmingDeleteHandler} className ={classes.DeleteProject}>DELETE PROJECT</div>
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
                {!props.lastAdmin ? <div className = {classes.AdminButton} onClick = {props.removeAdmin}>Remove</div> : <div>Projects must have at least one admin</div>}
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

const Bug = props => {
    const { bug } = props;

    return (
        <div className={classes.Bug}>
           <h3>{bug.title}</h3>
           <div className={classes.Delete} onClick ={props.delete}>X</div>
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