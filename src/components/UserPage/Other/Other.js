import React, { Component } from 'react';
import classes from '../UserPage.module.css';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../Firebase/index';
import { connect } from 'react-redux';
import Projects from '../../ProjectDisplay/ProjectDisplay';
import Loading from '../../Loading/Loading';
import Friends from '../Friends/Friends';

const STARTER_STATE = {
    userIsFriend : false,
    userHasFriends : true,
    loadingUser : true,
    loadingProjects : true,
    loadingFriends : true,
    projects : [],
    noProjects : false,
}

class UserPage extends Component {
    constructor(){
        super();
        this.state = STARTER_STATE;
    }

    componentDidMount(){
        this.loadUserToState();
    }
    
    componentDidUpdate(prevProps){
        if(prevProps !== this.props){
            this.setState(STARTER_STATE, this.loadUserToState);
        }
    }

    loadUserToState = () => {
        const uid = this.props.match.params.uid;
        this.props.firebase.user(uid)
                           .once("value", dataSnapshot => {
                            const user = {
                                ...dataSnapshot.val(),
                                uid : uid,
                            }
                             this.setState({ user:user , loadingUser : false });
                        })
    }

    loadProjectsToState = () => {
        try {
            const projectIDs = [...Object.values(this.state.user.projects)];
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
            this.setState({ projects:[], loadingProjects :false, noProjects : true});
        }

    }

    checkFriendStatus = () => {
        try {
            const friendUIDs = [...Object.values(this.state.user.friends)];
            const thisUserUID = this.props.authUser.user.uid;
    
            if(friendUIDs.includes(thisUserUID)){
                this.setState({ userIsFriend:true })
            }
        } catch(e){
            this.setState({userHasFriends : false});
        }
  
    }

    render() {
        const { user, loadingUser } = this.state;
        return (
            <div className ={classes.Container}>
                <div className={classes.BasicInfoContainer}>
                    {loadingUser ? <Loading /> : (<React.Fragment>
                                                                     <img src ={user.image}/>
                                                                     <h2>{user.username}</h2>
                                                                   </React.Fragment>)}
                </div>
                <div className={classes.Main}>
                    <div className={classes.ProjectsContainer}>
                        <h2>User Projects</h2>
                        {loadingUser ? <Loading /> : <Projects projectIDs={user.projects} />}
                    </div>
                    <div className = {classes.BioContainer}>
                        <h2>Bio</h2>
                        {loadingUser ? <Loading /> : <p>{user.bio}</p>}
                    </div>
                    {loadingUser ? <Loading /> : <Friends friends={user.friends} />}
                </div>
            </div>
        )
    }
}

const Redirector = props => {
    if(props.match.params.uid === props.authUser.user.uid){
        props.history.push("/home");
        return null;
    } else {
        return <UserPage {...props}/>;
    }
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default connect(mapStateToProps,null)(withRouter(withFirebase(Redirector)));