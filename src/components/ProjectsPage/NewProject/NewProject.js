import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../../Firebase';
import { withRouter } from 'react-router';
import classes from './NewProject.module.css';
import { isEmpty } from 'lodash';

import * as ROUTES from '../../../constants/routes';

class AddProjectForm extends Component {
    constructor(props){
        super(props);
        this.state = { 
            name : '',
            desc : '',
            loading : true,
            friends : [],
        }
    }

    onSubmit = e => {
        e.preventDefault();

        const creatorUID = this.props.authUser.user.uid;

        let users = [creatorUID];
        this.state.friends.forEach(friend => {
            if(friend.checked){
                users.push(friend.uid);
            }
        })
        const projectData = {
            name : this.state.name,
            admins : [creatorUID],
            users : users,
            bugs : [],
        }

        const projectID = this.state.name.toLowerCase().replace(/\s/g,'-') + '-' + Math.random().toString(36).substr(2, 9);

        this.props.firebase.project(projectID).set(projectData);
        users.forEach(uid => {
            this.props.firebase.user(uid).child('projects').child(projectID).set(projectID);
        });

        this.props.history.push("/projects/" + projectID);
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    loadFriendIDs = () => {
        const uid = this.props.authUser.user.uid;
        this.props.firebase.user(uid)
                           .child("friends")
                           .once("value")
                           .then(snap => {
                               if(snap.val()){
                                    const data = [...Object.values(snap.val())];
                                    this.loadFriendsToState(data);
                               } else{
                                    this.setState({noFriends : true});
                               }
                           })
        }

    loadFriendsToState = friendIDs => {
        friendIDs.forEach(friendID => {
            this.props.firebase.user(friendID)
                               .once("value")
                               .then(snap => {
                                   let friends = [...this.state.friends];
                                   const data = {
                                       ...snap.val(),
                                       uid : friendID,
                                       checked : false,
                                   }
                                   friends.push(data)
                                   this.setState({friends : friends, loading : false});
                               })
        })
    }

    checkUser = uid => {
        let friends = [...this.state.friends];
        for(let i=0;i<friends.length;i++){
            if(friends[i].uid === uid){
                friends[i].checked = !friends[i].checked;
                this.setState({friends:friends});
                return;
            }
        }
    }

    componentDidMount() {
        this.loadFriendIDs();
    }

    render() {
        const formIsValid = (this.state.title !== "") && (this.state.desc !== "");
        return (
            <div className={classes.Container}>
                <div className={classes.AddProjectForm}>
                    <h1>New Project</h1>
                    <form onSubmit = {this.onSubmit}>
                    <input
                        name = "name"
                        value = {this.state.name}
                        onChange = {this.onChange}
                        type = "text"
                        placeholder = "Project Name"
                    />
                    <textarea
                        name = "desc"
                        value= {this.state.desc}
                        onChange = {this.onChange}
                        type = "text"
                        placeholder = "Project description"
                    />
                    {!this.state.loading &&
                      this.state.friends.filter(friend => friend.username)
                                        .map(friend => (
                        <User
                            key = {friend.uid}
                            check = {() => this.checkUser(friend.uid)}
                            user={friend}
                        />
                    ))}
                    <button disabled ={!formIsValid} type="submit">Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

const User = props => {
    const { user } = props;
    let userClass = classes.User;
    if(user.checked){
        userClass = [classes.User, classes.Checked].join(" ");
    }
    console.log(user)
    return (
        <div 
            onClick = {props.check}
            className = {userClass}
        >
            {user.username}
        </div>
    )
}

const NewProjectPage = props => {

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

export default withFirebase(withRouter(connect(mapStateToProps,mapDispatchToProps)(NewProjectPage)));