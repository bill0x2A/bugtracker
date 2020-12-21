import React from 'react';
import { connect } from 'react-redux';
import classes from './Tutorial.module.css';
import * as actionTypes from '../../../../store/actionTypes';

const Tutorial = props => {

    return (
        <div className = {classes.Container}>
            <div className ={classes.Tutorial}>
                <h3>Welcome</h3>
                <p>So you can easily see the features of this app, some friends have added you!</p>
                <p>You have also been included in an example project.</p>
                <p>Click on your friends profiles to see what they've been up to.</p>
                <p>Try adding your own bugs to the example project, or maybe start your own.</p>
                <p>Remember to invite your new friends to bugfix with you!</p>
                <div className = {classes.Ok} onClick ={props.end}>OK!</div>
            </div>
        </div>
    )
}

const mapDispatchToProps = dispatch => ({
    end : () => dispatch({type : actionTypes.END_TUTORIAL}),
})

export default connect(null, mapDispatchToProps)(Tutorial);