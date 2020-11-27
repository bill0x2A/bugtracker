import React, { Component } from 'react';
import classes from './Friends.module.css';
import Loading from '../../Loading/Loading';
import Friend from './Friend/Friend';
import { withFirebase } from '../../../Firebase/index';

const STARTER_STATE = {
    friends : [],
    loadingFriends : true,
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

    loadFriendsToState = () => {
        try {
            const friendUIDs = [...Object.values(this.props.friends)];
            friendUIDs.forEach(uid => {
                this.props.firebase.user(uid)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let friends = [...this.state.friends];
                                       const newFriend = {
                                           ...dataSnapshot.val(),
                                           id : uid,
                                       }
                                       // Check included to prevent double adding, which occaisionally happens.
                                       if(!friends.includes(newFriend)){
                                            friends.push(newFriend);
                                            this.setState({ friends:friends, loadingFriends:false }, console.log(this.state.friends));
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
            {this.state.userIsFriend ? (
                    <button
                        className={classes.Button}
                        onClick = {this.removeFriend}
                    >Remove friend</button>
                ) : ( <button
                        className={classes.Button}
                        onClick = {this.inviteFriend}
                        >Add friend</button>
                )}
        </div>
    )}
}

export default withFirebase(Friends)