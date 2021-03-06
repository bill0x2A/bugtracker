import React, { Component } from 'react';
import { withFirebase } from '../../../Firebase';
import { connect } from 'react-redux';
import { withRouter, useParams, Link } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';
import classes from './ProjectPage.module.css';
import { DisplayBug, SelectedBug } from './Bug/index';
import User from './User/User';
import BugAdder from './BugAdder/BugAdder';
import Loading from '../../Loading/Loading';
import defaultpp from '../../../assets/2.png'

const STARTER_STATE = {
    loading : true,
    bugs : [],
    users : [],
    admins : [],
    actions : [],
    cheat : true,
}   


class ProjectPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...STARTER_STATE,
            selectedBug : this.props.match.bid
        }
    }

    componentDidMount() {
        this.loadProjectToState();
        // This is a very bad practice and I am sorry for doing it
        setTimeout(() => {
            this.setState({cheat : !this.state.cheat})
            }, 500);
    }

    userIsMember = () => {
        const { users } = this.state.project;
        const uid = this.props.authUser.user.uid;

        const usersArray = [...Object.values(users)];

        if(usersArray.includes(uid)){
            return true;
        } else {
            return false;
        }
    }

    userIsAdmin = () => {
        const { admins } = this.state.project;
        const uid = this.props.authUser.user.uid;

        const adminsArray = [...Object.values(admins)]

        if(adminsArray.includes(uid)){
            this.setState({isAdmin : true});
        } else {
            this.setState({isAdmin : false});
        }
    }

    loadProjectToState = () => {
        this.props.firebase.project(this.props.pid)
                           .on("value", dataSnapshot => {
                            const project = dataSnapshot.val();
                            let RESET_STATE = {...STARTER_STATE};
                            RESET_STATE.loading = false;
                            RESET_STATE.project = project;
                            
                            this.setState(RESET_STATE, () => {
                                this.loadBugsToState();
                                this.loadUsersToState();
                                this.loadAdminsToState();
                                this.loadActionsToState();
                                this.userIsAdmin();

                                // If the user is kicked, instantly revoke their access
                                if(!this.userIsMember()){
                                    this.props.history.push('/');
                                }
                            })
                           });
    }

    loadBugsToState = () => {
        const { bugs } = this.state.project;
        try {
            const bugIDs = Object.values(bugs);
            console.log(bugIDs);
            bugIDs.forEach(bugID => {
                this.props.firebase.bug(bugID)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let bugs = [...this.state.bugs];
                                       const newBug = {
                                           ...dataSnapshot.val(),
                                           id : bugID
                                       };
                                       bugs.push(newBug);
                                       this.setState({bugs:bugs});
                                       if(bugID === this.props.match.params.bid){
                                           this.setState({selectedBug:newBug});
                                       }
                                   });
            })
        } catch (e) {
            //Do nothing
        }
    }

    loadUsersToState = () => {
        const userIDs = [...Object.values(this.state.project.users)];

        userIDs.forEach(uid => {
            this.props.firebase.user(uid)
                               .once("value")
                               .then(dataSnapshot => {
                                   let users = [...this.state.users];
                                   const data = dataSnapshot.val();
                                   const newUser = {
                                       ...data,
                                       uid : uid,
                                   }
                                   if(data && !users.includes(newUser)){
                                       users.push(newUser);
                                       this.setState({users:users});}
                               });
        })
    }

    loadAdminsToState = () => {
        const adminIDs = [...Object.values(this.state.project.admins)];

        adminIDs.forEach(uid => {
            this.props.firebase.user(uid)
                               .once("value")
                               .then(dataSnapshot => {
                                   let admins = [...this.state.admins];
                                   const data = dataSnapshot.val();
                                   const newAdmin = {
                                       ...data,
                                       uid : uid,
                                   }
                                   if(data && !admins.includes(newAdmin)){
                                        admins.push(newAdmin);
                                        this.setState({admins:admins});
                                    }
                               });
        })
    }

    loadActionsToState = () => {
        try {
            const actionIDs = [...Object.values(this.state.project.actions)];
            actionIDs.forEach(actionID => {
                this.props.firebase.action(actionID)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let actions = [...this.state.actions];
                                       const newAction = {
                                           ...dataSnapshot.val(),
                                           id : actionID,
                                       }
                                       actions.push(newAction);
                                       this.setState({actions:actions});
                                   })
            })
        } catch(e) {
            this.setState({noActions : true});
        }

    }

    addBugHandler = () => {
        this.setState({addingBug : true});
    }

    closeNewBugHandler = () => {
        this.setState({addingBug : false});
        console.log("Running closeNewBugHandler");
    }

    bugSelectHandler = bug => {

        this.setState({selectedBug:bug}, console.log(this.state.selectedBug));
        const newPath = "/projects/" + this.props.pid + "/" + bug.id;
        this.props.history.push(newPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render () {
        let { project, loading, bugs, users, admins, empty, selectedBug, actions } = this.state;

        const invertedActions = actions.reverse();

        const main = (
            <div className = {classes.Main}>
            {empty && <NoBugs/>}
            <div className = {classes.Bugs}>
            <div>
                {selectedBug && <SelectedBug
                                    key={selectedBug.title} 
                                    bug={selectedBug}
                                    {...this.props}
                                    />}
            </div>
            {bugs.map(bug => {
                return (
                    <DisplayBug
                        click = {() => this.bugSelectHandler(bug)}
                        bug={bug}
                        pid={this.props.pid}
                        key={bug.id}
                    />)
            })}
            </div>
            <div
                onClick = {this.addBugHandler}
                className={classes.AddProject}
            >
                <span>+</span>
            </div>
        </div>
        )

        return (
            loading ? (
                <Loading />
            ) : (
                <div className={classes.Container}>
                    <div className={classes.Heading}>
                    <h1>{project.name}</h1>
                        <div className={classes.HeadingCircle}></div>
                        {this.state.isAdmin && (
                                <div className={classes.AdminAccess}><Link to={"/projects/" + this.props.pid + "/admin"}>Admin Page</Link></div>
                        )}
                    </div>
                    <div className={classes.BodyContainer}>
                        <div className = {classes.UserContainer}>
                            <h2>Users</h2>
                            {users.map(user => <User user={user} key={user.uid} />)}
                            <br/>
                            <h2>Admins</h2>
                            {admins.map(user => <User admin user={user} key={user.uid} />)}
                        </div>
                        {this.state.addingBug ? <BugAdder 
                                                    close ={this.closeNewBugHandler}
                                                    {...this.props}
                                                />
                                                    : main}
                        <div className={classes.NotificationContainer}>
                            <h2>Recent Activity</h2>
                            <div className={classes.Notifications}>
                                {invertedActions.map(action => <Notification
                                                                    firebase={this.props.firebase}
                                                                    action={action}
                                                                    key={action.id}
                                                                />)}
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    }
}

class Notification extends Component {
    constructor(props) {
        super();
        this.state = {
            loadingBug : true,
            loadingUser : true,
        }
    }

    componentDidMount() {
        this.loadUserToState();
        this.loadBugToState();
        this.parseAction();
    }

    parseAction = () => {
        let text = null;
        switch(this.props.action.type){
            case "resolve" : 
                text = " marked as resolved - "
                break;
            case "addComment":
                text = " added a comment to "
                break;
            case "addBug":
                text = " added a bug titled "
                break;
            case "changeUrgency":
                text = " changed the urgency of "
                break;
        }
        this.setState({ text:text });
    }

    loadUserToState = () => {
        this.props.firebase.user(this.props.action.user)
                           .once("value")
                           .then(dataSnapshot => {
                               this.setState({ user : dataSnapshot.val(), loadingUser : false });
                           })
    }

    loadBugToState = () => {
        this.props.firebase.bug(this.props.action.bugID)
                           .once("value")
                           .then(dataSnapshot => {
                               this.setState({ bug : dataSnapshot.val(), loadingBug : false });
                           })        
    }

    render() {
        // Prevents component breaking if a relavent bug is deleted from the project
        if(!this.state.bug){
            return null;
        }
        return(
        <div className={classes.Notification}>
            {(this.state.loadingUser || this.state.loadingBug) ? <Loading /> : (
                <React.Fragment>
                    {this.state.user ? <img src = {this.state.user.image} /> : <img src = {defaultpp} />}
                    <p>{(this.state.user ? this.state.user.username : "Deleted User") + this.state.text + this.state.bug.title}</p>
                </React.Fragment>
            )}
        </div>)
    }
}

const NoBugs = () => {
    return (
        <div className ={classes.NoBugsContainer}>
            <h2>No bugs yet, add one below!</h2>
        </div>
    )
}

const ProjectPageWithAuth = props => {
    const projectID = useParams().id;
    if(props.authUser.user.uid){
        return <ProjectPage auth {...props} pid = {projectID} />
    } else {
        props.history.push(ROUTES.LANDING);
        return <hr/>
    }
}

const mapStateToProps = state => ({
        authUser : state.authUser,
    });

export default withRouter(withFirebase(connect(mapStateToProps)(ProjectPageWithAuth)));