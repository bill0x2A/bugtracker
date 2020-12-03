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

class ProjectPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            bugs : [],
            users : [],
            admins : [],
            actions : [],
            selectedBug : this.props.match.bid,
        }
    }

    componentDidMount() {
        this.getProjectData();
    }

    userIsMember = () => {
        const { project } = this.state;
        const uid = this.props.authUser.uid;

        if(project.users.includes(uid)){
            return true;
        } else {
            return false;
        }
    }

    userIsAdmin = () => {
        const { project } = this.state;
        const uid = this.props.authUser.uid;

        if(project.admins.includes(uid)){
            return true;
        } else {
            return false;
        }
    }

    getProjectData = () => {
        this.props.firebase.project(this.props.pid)
                           .once("value")
                           .then( dataSnapshot => {
                               const project = dataSnapshot.val();

                               this.setState({loading:false, project : project})

                               this.loadBugsToState(project);
                               this.loadUsersToState(project);
                               this.loadAdminsToState(project);
                               this.loadActionsToState(project);
                           })
    }

    loadBugsToState = project => {
        let bugIDs = null;
        try {
            bugIDs = Object.values(project.bugs);
        } catch (e) {
            bugIDs = [];
            this.setState({empty : true});
        }
        
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
    }

    loadUsersToState = project => {
        const userIDs = [...project.users];

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
                                   if(data){
                                   users.push(newUser);
                                   this.setState({users:users});}
                               });
        })
    }

    loadAdminsToState = project => {
        const adminIDs = [...project.admins];

        adminIDs.forEach(uid => {
            this.props.firebase.user(uid)
                               .once("value")
                               .then(dataSnapshot => {
                                   let admins = [...this.state.users];
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

    loadActionsToState = project => {
        let actionIDs = [];
        try {
            actionIDs = [...Object.values(project.actions)];
        } catch(e) {

        }

        actionIDs.forEach(actionID => {
            this.props.firebase.action(actionID)
                               .once("value")
                               .then(dataSnapshot => {
                                   let actions = [...this.state.actions];
                                   actions.push(dataSnapshot.val());
                                   this.setState({actions:actions});
                               })
        })
    }

    addBugHandler = () => {
        this.setState({addingBug : true});
    }

    cancelNewBugHandler = () => {
        this.setState({addingBug : false});
    }

    bugSelectHandler = bug => {

        this.setState({selectedBug:bug});
        const newPath = "/projects/" + this.props.pid + "/" + bug.id;
        this.props.history.push(newPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render () {
        const { project, loading, bugs, users, admins, empty, selectedBug } = this.state;

        const main = (
            <div className = {classes.Main}>
            {empty && <p>No bugs found!</p>}
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
                <div>Loading content...</div>
            ) : (
                <div className={classes.Container}>
                    <div className={classes.Heading}>
                    <h1>{project.name}</h1>
                        <div className={classes.HeadingCircle}></div>
    
                    </div>
                    <div className={classes.BodyContainer}>
                        <div className = {classes.UserContainer}>
                            <h2>Users</h2>
                            {users.map(user => <User user={user} />)}
                            <br/>
                            <h2>Admins</h2>
                            {admins.map(user => <User admin user={user} />)}
                        </div>
                        {this.state.addingBug ? <BugAdder close ={this.cancelNewBugHandler}{...this.props}/> : main}
                        <div className={classes.Notifications}>
                            <h2>Recent Activity</h2>
                            {this.state.actions.map(action => <Notification firebase={this.props.firebase} action={action}/>)}
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
        console.log(this.props.action.user)
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
        console.log(this.state);
        return(
        <div className={classes.Notification}>
            {(this.state.loadingUser || this.state.loadingBug) ? <Loading /> : (
                <React.Fragment>
                    <img src = {this.state.user.image} />
                    <p>{this.state.user.username + this.state.text + this.state.bug.title}</p>
                </React.Fragment>
            )}
        </div>)
    }
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