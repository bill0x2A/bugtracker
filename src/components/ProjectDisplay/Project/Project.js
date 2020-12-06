import React from 'react';
import classes from './Project.module.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const Project = props => {

    const { project } = props;
    const route = "/projects/" + project.pid;

    let users = [];


    // If the project no longer exists, do not render it
    try{
        users = [...Object.values(project.users)];
    } catch(e){
        return null
    }

    return (
        <div className={classes.Project}>
            <div className = {classes.ProjectHeader}>
                <h2>{project.name}</h2>
            </div>
            <div className = {classes.ProjectBody}>
                {users.includes(props.authUser.user.uid) && <Link to = {route}>Go to project</Link>}
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    authUser : state.authUser,
})

export default connect(mapStateToProps)(Project);