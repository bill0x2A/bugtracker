import React, { Component } from 'react';
import classes from '../UserPage.module.css';
import testpp from '../../../assets/default.png';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../Firebase/index';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Project from '../../ProjectDisplay/index';

class HomePage extends Component {
    constructor(){
        super();
        this.state = {
            userIsFriend : false,
            loadingUser : true,
            loadingProjects : true,
            loadingFriends  : true,
            loadingFriendInvites : true,
            loadingProjectInvites : true,
            projects : [],
            friends : [],
            friendInvites : [],
            projectInvites : [],
        }
    }

    componentDidMount(){
        this.loadUserToState();
    }

    loadUserToState = () => {
        const uid = this.props.authUser.user.uid;

        this.props.firebase.user(uid)
                           .once("value")
                           .then(dataSnapshot => {
                               this.setState({ user:dataSnapshot.val() , loadingUser : false });
                               this.loadProjectsToState();
                               this.loadFriendsToState();
                               this.loadInvitationsToState();
                           })
    }

    loadProjectsToState = () => {
        let projectIDs = null;
        try {
            projectIDs = [...Object.values(this.state.user.projects)];
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
        } catch(e) {
            this.setState({projects : [], loadingProjects : false});
        }
    }

    loadFriendsToState = () => {
        try {
            const friendUIDs = [...Object.values(this.state.user.friends)];
            friendUIDs.forEach(uid => {
                this.props.firebase.user(uid)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let friends = [...this.state.friends];
                                       const newFriend = {
                                           ...dataSnapshot.val(),
                                           id : uid,
                                       }
                                       friends.push(newFriend);
                                       this.setState({ friends:friends, loadingFriends:false });
                                   })
                                }
                            );
                // Check if the user is a friend of the logged in user, save result to state
                const thisUserUID = this.props.authUser.user.uid;
                if(friendUIDs.includes(thisUserUID)){
                    this.setState({ userIsFriend:true })
                }                              
            } catch(e) {
                this.setState({friends : [], loadingFriends : false});
        }
    }

    loadInvitationsToState = () => {
        try {
            const invitationIDs = [...Object.values(this.state.user.invitations)];
            invitationIDs.forEach(iid => {
                this.props.firebase.invite(iid).once("value").then(snap => {
                    let data = {
                        ...snap.val(),
                        id : iid,
                    };
                    let friendInvites = [...this.state.friendInvites];
                    let projectInvites = [...this.state.projectInvites];

                    if(data.to === this.props.authUser.user.uid) {
                        switch(data.type){
                            case "friend":
                                friendInvites.push(data);
                                this.setState({friendInvites : friendInvites, loadingFriendInvites : false});
                                break;
                            case "project":
                                projectInvites.push(data);
                                this.setState({projectInvites:projectInvites, loadingProjectInvites : false});
                                break;
                            default:
                                break;
                        }
                    }
                })
            })
        }
        catch(e) {
            this.setState({friendInvites : [], projectInvites : [], loadingProjectInvites : false, loadingFriendInvites : false});
        }
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
                                                                     <img src ={testpp}/>
                                                                     <h2>Welcome, {this.state.user.username}</h2>
                                                                   </React.Fragment>)}
                </div>
                <div className={classes.Main}>
                    <div className={classes.ProjectsContainer}>
                        <h2>My Projects</h2>
                        {this.state.loadingProjects ? <p>Loading...</p> : this.state.projects.map(project => (
                            <Project key={project.pid} project={project} />
                        ))}
                        <div>

                        </div>
                    </div>
                    <div className={classes.InvitesContainer}>
                        <h2>Friends</h2>
                        {this.state.loadingFriends ? <p>Loading...</p> : (
                            <React.Fragment>
                                {this.state.friends.map(friend => <Friend user={friend} />)}
                            </React.Fragment>
                        )}
                    </div>
                    <div className={classes.InvitesContainer}>
                        <h2>Friend Requests</h2>
                        {this.state.loadingFriendInvites ? <p>Loading...</p> : (
                            <React.Fragment>
                                {this.state.friendInvites.map(friendInvite => (
                                    <Invite
                                        friend
                                        key={friendInvite.id}
                                        data={friendInvite}
                                        firebase={this.props.firebase}
                                    />)
                                )}
                            </React.Fragment>
                        )}
                        <h2>Project Invites</h2>
                        {this.state.loadingProjectInvites ? <p>Loading...</p> : (
                            <React.Fragment>
                                {this.state.projectInvites.map(projectInvite => (
                                    <Invite
                                        key={projectInvite.id}
                                        data={projectInvite}
                                        firebase={this.props.firebase}
                                        project
                                    />)
                                )}
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const Friend = props => {
    const { user } = props;

    return (
        <Link to={`/users/${user.id}`}>
        <div className = {classes.Friend}>
                    <div className={classes.FriendBody}>
                    <img src={testpp}></img>
                    <span>{user.username}</span>
                    <div>
                    </div>
                </div>
        </div>
        </Link>
    )
}

class Invite extends Component {
    constructor(){
        super();
        this.state = {
            loading : true,
        }
    }

    componentDidMount(){
        this.loadUserToState();
    }

    onAccept = () => {
        const { id, to, from } = this.props.data;
        this.props.firebase.invite(id).remove();
        this.props.firebase.user(to).child(`friends/${from}`).set(from);
        this.props.firebase.user(from).child(`friends/${to}`).set(to);
    }

    onReject = () => {
        const { id } = this.props.data;
        this.props.firebase.invite(id).remove();
    }

    loadUserToState = () => {
        const uid = this.props.data.from;
        this.props.firebase.user(uid).once("value").then(snap => {
            const user = snap.val();
            this.setState({ ...user , loading : false});
        })
    }
    render(){
        return (
            <div className={classes.FriendInvite}>
                {this.state.loading ? <p>Loading...</p> : (
                    <div className={classes.InviteBody}>
                    <img src={testpp}></img>
                    <span>{this.state.username}</span>
                    <div>
                    <button onClick = {this.onAccept} className={classes.Accept}>Accept</button>
                    <button onClick = {this.onReject} className={classes.Ignore}>Ignore</button>
                    </div>
                </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default connect(mapStateToProps,null)(withRouter(withFirebase(HomePage)));