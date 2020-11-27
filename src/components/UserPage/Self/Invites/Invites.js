import React, { Component } from 'react';
import classes from './Invites.module.css';
import Loading from '../../../Loading/Loading';
import Invite from './Invite/Invite';
import { withFirebase } from '../../../../Firebase/index';

const STARTER_STATE = {
    invites : [],
    loadingInvites : true,
}

class Invites extends Component {
    constructor(props){
        super(props)
        this.state = STARTER_STATE;
    }

    componentDidMount(){
        this.loadInvitationsToState();
    }

    componentDidUpdate(prevProps){
        if(prevProps !== this.props){
            this.setState(STARTER_STATE, this.loadInvitationsToState);
        }
    }

    loadInvitationsToState = () => {
        try {
            const inviteIDs = [...Object.values(this.props.invites)];

            inviteIDs.forEach(inviteID => {
                this.props.firebase.invite(inviteID)
                .once("value")
                .then(dataSnapshot => {
                    let invites = [...this.state.invites];
                    const newInvite = {
                        ...dataSnapshot.val(),
                        id : inviteID,
                    }
                    invites.push(newInvite);
                    this.setState({ invites:invites, loadingInvites:false });
                })
            })
        } catch(e) {
                this.setState({invites : [], loadingInvites : false});
        }
    }

    render(){

        return (
            <div className={classes.InvitesContainer}>
                <h2>Friend Requests</h2>
                {this.state.loadingInvites ? <Loading /> : (
                    <React.Fragment>
                        {this.state.invites.map(friendInvite => (
                            <Invite
                                key={friendInvite.id}
                                data={friendInvite}
                                firebase={this.props.firebase}
                            />
                            )
                        )}
                    </React.Fragment>
                )}
            </div>
        );

    }
}

export default withFirebase(Invites);