import React, { Component } from 'react';
import classes from './Friends.module.css';
import Loading from '../../Loading/Loading';
import Friend from './Friend/Friend';
import { withFirebase } from '../../../Firebase/index';
import AddButton from './AddButton/AddButton';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const STARTER_STATE = {
    friends : [],
    loadingFriends : true,
    userIsFriend : false,
};

class Friends extends Component  {
    constructor(props){
        super(props)
        this.state = STARTER_STATE;
    }
    
    componentDidMount(){
        this.loadFriendsToState();
    }

    componentDidUpdate(prevProps){
        if(prevProps !== this.props){
            this.setState(STARTER_STATE, this.loadFriendsToState);
        }
    }

    inviteFriend = () => {
        const thisUserUID = this.props.authUser.user.uid;
        const uid = this.props.match.params.uid;

        const newInvite = {
            from : thisUserUID,
            to   : uid,
            data : null,
        }

        const newKey = this.props.firebase.invites()
                                          .push(newInvite)
                                          .getKey();

        this.props.firebase.user(uid).child(`/invitations/${newKey}`).set(newKey);
    }

    removeFriend = () => {
        this.props.firebase.user(this.props.authUser.user.uid)
                           .child(`friends/${this.props.match.params.uid}`)
                           .remove();
        this.props.firebase.user(this.props.match.params.uid)
                           .child(`friends/${this.props.authUser.user.uid}`)
                           .remove();
    }

    loadFriendsToState = () => {
        try {
            const friendUIDs = [...Object.values(this.props.friends)];
            friendUIDs.forEach(uid => {
                this.props.firebase.user(uid)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let friends = [...this.state.friends];
                                       const friendData = dataSnapshot.val();
                                       const newFriend = {
                                           ...dataSnapshot.val(),
                                           id : uid,
                                       }
                                       // Check included to prevent double adding, which occaisionally happens.
                                       if(!friends.includes(newFriend) && friendData){
                                            friends.push(newFriend);
                                            this.setState({ friends:friends, loadingFriends:false });
                                        }
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

    render(){
    return (
        <div className={classes.Friends}>
            <h2>Friends</h2>
            {this.props.loading ? <Loading /> : (
                <React.Fragment>
                    {this.state.friends.map(friend => <Friend key = {friend.id} user={friend} />)}
                </React.Fragment>
            )}
            {(!this.props.loading && this.props.match.path !== "/home") &&
                <AddButton 
                    userIsFriend = {this.state.userIsFriend}
                    remove = {this.removeFriend}
                    invite = {this.inviteFriend}
                />}
        </div>
    )}
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default connect(mapStateToProps)(withRouter(withFirebase(Friends)));