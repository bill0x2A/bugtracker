import React, { Component } from 'react';
import classes from './ProjectDisplay.module.css';
import Loading from '../Loading/Loading';
import Project from './Project/Project';
import { withFirebase } from '../../Firebase/index';


const STARTER_STATE = {
    projects : [],
    loading : true,
}

class ProjectDisplay extends Component {
    constructor(props){
        super(props);
        this.state = STARTER_STATE;
    }

    componentDidMount(){
        this.loadProjectsToState();
    }

    componentDidUpdate(prevProps){
        if(prevProps !== this.props){
            this.setState(STARTER_STATE, this.loadProjectsToState);
        }
    }   

    loadProjectsToState = () => {
        try {
            const projectIDs = [...Object.values(this.props.projectIDs)];
            projectIDs.forEach(pid => {
                this.props.firebase.project(pid)
                                   .once("value")
                                   .then(dataSnapshot => {
                                       let projects = [...this.state.projects];
                                       const newProject = {
                                           ...dataSnapshot.val(),
                                           pid : pid,
                                       }
                                       projects.push(newProject);
                                       this.setState({ projects:projects, loading:false });
                                   })
            })            
        } catch(e) {
            this.setState({noProjects : true, loading : false});
        }
    }

    render(){
        return (
            <div className={classes.ProjectsContainer}>
                {this.state.noProjects && <p>This user has no projects yet</p>}
                {this.state.loading ? <Loading /> : (
                    <React.Fragment>
                        {this.state.projects.map(project => <Project key ={project.pid} project = {project}/>)}
                    </React.Fragment>
                )}
            </div>
        )
    }
}


export default withFirebase(ProjectDisplay);