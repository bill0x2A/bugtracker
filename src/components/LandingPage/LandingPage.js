import classes from './LandingPage.module.css';
import React from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../../assets/BigLogo.png';
import AddFriend from '../../assets/AddFriend.png';
import AddProject from '../../assets/AddProject.png';
import WorkTogether from '../../assets/WorkTogether.png';

const landingPage = ({authUser}) => {

    return (
        <div className={classes.Container}>

            {
                authUser ? (
                    <div>
                    <img src = {defaultImage}/>
                    <h1>Billy's Bugtracker</h1>
                    </div>
                ) : (
                    <div className = {classes.IntroContainer}>
                        <ul className = {classes.IntroText}>
                            <li>Add Friends<img src={AddFriend}></img></li>
                            <li>Create Projects<img src={AddProject}></img></li>
                            <li>Work Together<img src={WorkTogether}></img></li>
                            <li className = {classes.ButtonsContainer}>
                                <Link to="/log-in">
                                    <div className = {classes.InButton}>Login</div>
                                </Link>
                                <Link to="/signup">
                                    <div className = {classes.InButton}>Sign Up</div>
                                </Link>
                            </li>
                        </ul>

                    </div>
                )
            }     
        </div>
    )
}

export default landingPage;