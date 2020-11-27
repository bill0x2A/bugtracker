import React from 'react';
import classes from './Friend.module.css';
import { Link } from 'react-router-dom';

const Friend = props => {
    const { user } = props;

    return (
        <Link to={`/users/${user.id}`}>
            <div className = {classes.Friend}>
                        <div className={classes.FriendBody}>
                        <img src={user.image}></img>
                        <span>{user.username}</span>
                        <div>
                        </div>
                    </div>
            </div>
        </Link>
    )
}



export default Friend;