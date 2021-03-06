import React from 'react';
import classes from './User.module.css';
import defaultpp from '../../../../assets/default.png';

const User = props => {

    const { username, uid, image } = props.user;
    const route = '/users/' + uid;

    return(
        <a href = {route}>
            <div className = {classes.User} key={`${username}`}>
            <img src = {image} /> 
            <h3>{username}</h3>
            </div>
        </a>)
}

export default User;