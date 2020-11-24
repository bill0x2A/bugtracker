import classes from './LandingPage.module.css';
import React from 'react';
import defaultImage from '../../assets/BigLogo.png';

const landingPage = props => {

    return (
        <div className={classes.Container}>
            <img src = {defaultImage}/>
            <h1>Billy's Bugtracker</h1>
            <p>Sign up or log in ;)</p>
        </div>
    )
}


export default landingPage;