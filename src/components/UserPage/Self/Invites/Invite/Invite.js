import React, { Component } from 'react';
import classes from './Invite.module.css';
import Loading from '../../../../Loading/Loading';
import { connect } from 'react-redux';

class Invite extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading : true,
        }
    }

    componentDidMount(){
        this.loadUserToState();
    }

    onAccept = () => {
        const { id, to, from} = this.props.data;
        this.props.firebase.invite(id).remove();
        this.props.firebase.user(to).child(`friends/${from}`).set(from);
        this.props.firebase.user(from).child(`friends/${to}`).set(to);
        this.props.firebase.user(to).child(`invitations/${id}`).remove();
    }

    onReject = () => {
        const { id, to, from} = this.props.data;

        this.props.firebase.invite(id).remove();
        this.props.firebase.user(to).child(`invitations/${id}`).remove();
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
                {this.state.loading ? <Loading /> : (
                    <div className={classes.InviteBody}>
                        <img src={this.state.image}></img>
                        <span>{this.state.username}</span>
                        <div className={classes.Controls}>
                            <div onClick = {this.onAccept} className={classes.Accept}>Accept</div>
                            <div onClick = {this.onReject} className={classes.Ignore}>Ignore</div>
                        </div>
                     </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authUser : state.authUser
})

export default connect(mapStateToProps)(Invite);