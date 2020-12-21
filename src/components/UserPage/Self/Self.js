import React, { Component } from 'react';
import classes from '../UserPage.module.css';
import testpp from '../../../assets/default.png';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../Firebase/index';
import { connect } from 'react-redux';
import Loading from '../../Loading/Loading';
import { Link } from 'react-router-dom';
import Projects from '../../ProjectDisplay/ProjectDisplay';
import * as ROUTES from '../../../constants/routes';
import * as actionTypes from '../../../store/actionTypes';
import Friends from '../Friends/Friends';
import Invites from './Invites/Invites';
import Tutorial from './Tutorial/Tutorial';

const STARTER_STATE = {
    userIsFriend : false,
    loadingUser : true,
    loadingPP : true,
}

class HomePage extends Component {
    constructor(){
        super();
        this.state = STARTER_STATE;
    }

    componentDidMount(){
        this.loadUserToState();
    }

    loadUserToState = () => {
        const uid = this.props.authUser.user.uid;

        this.props.firebase.user(uid)
                           .on("value", dataSnapshot => {
                            let RESET_STATE = {...STARTER_STATE }
                            RESET_STATE.loadingUser = false;
                            RESET_STATE.user = dataSnapshot.val();
                            this.setState(RESET_STATE);
                        });
    }

    loadPictureToState = () => {}

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
                {this.props.tutorialActive && <Tutorial />}
                <div className={classes.BasicInfoContainer}>
                    {this.state.loadingUser ?  <Loading /> : (<React.Fragment>
                                                                <img src ={this.state.user.image}/>
                                                                <h2>Welcome, {this.state.user.username}</h2>
                                                              </React.Fragment>)}
                </div>
                <div className={classes.Main}>

                    <div className = {classes.ProjectsSection}>
                        <div className = {classes.ProjectsSectionHeader}>
                            <h2>My Projects</h2>
                            <Link to={ROUTES.NEWPROJECT}>
                                <div className={classes.AddProjectButton}>ADD NEW PROJECT</div>
                            </Link>
                        </div>
                        <div className={classes.ProjectsContainer}>
                            {this.state.loadingUser ? <Loading /> : <Projects projectIDs={this.state.user.projects} />}
                        </div>
                    </div>

                    <div className={classes.FriendsSection}>
                        {this.state.loadingUser ? <Loading /> : <Friends friends={this.state.user.friends} />}
                        {this.state.loadingUser ? <Loading /> : <Invites invites={this.state.user.invitations}/> }
                    </div>

                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authUser : state.authUser,
    tutorialActive : state.tutorialActive,
})

const mapActionsToDispatch = dispatch => ({
    activate : () => dispatch({type : actionTypes.ACTIVATE_TUTORIAL}),
})

export default connect(mapStateToProps,mapActionsToDispatch)(withRouter(withFirebase(HomePage)));