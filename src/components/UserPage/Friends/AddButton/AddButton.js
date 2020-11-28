import React from 'react';
import classes from './AddButton.module.css';

const AddButton = props => {

    return (
        props.userIsFriend ? (
            <button
                className={classes.Button}
                onClick = {props.remove}
            >Remove friend</button>
        ) : ( <button
                className={classes.Button}
                onClick = {props.invite}
                >Add friend</button>
        )
    )
}

export default AddButton;