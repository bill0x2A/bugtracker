import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router';
import classes from './Projects.module.css';
import { isEmpty } from 'lodash';

import * as ROUTES from '../../constants/routes';

const STARTER_STATE = {
    name : '',
    loading : true,
    projectIDs : ['mve09jv09j34']
}

class AddProjectForm extends Component {
    constructor(props){
        super(props);
        this.state = { ...STARTER_STATE}
    }

    randHex = len => {
        var maxlen = 8,
            min = Math.pow(16,Math.min(len,maxlen)-1),
            max = Math.pow(16,Math.min(len,maxlen)) - 1,
            n   = Math.floor( Math.random() * (max-min+1) ) + min,
            r   = n.toString(16);
        while ( r.length < len ) {
           r = r + this.randHex( len - maxlen );
        }
        return r;
      };

    onSubmit = e => {
        e.preventDefault();

        const creatorUID = this.props.authUser.user.uid;
        const projectData = {
            name : this.state.name,
            admins : [creatorUID],
            users : [creatorUID]
        }

        const projectID = this.state.name.toLowerCase().replace(/\s/g,'-') + '-' + Math.random().toString(36).substr(2, 9);

        this.props.firebase.project(projectID).set(projectData);
        this.props.firebase.user(creatorUID).child('projects').push(projectID);
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    getData = () => {
        this.props.firebase.user(this.props.authUser.user.uid)
                           .child('projects')
                           .once("value")
                           .then(dataSnapshot => {
                               const projectIDs = Object.values(dataSnapshot.val());
                               console.log(projectIDs);
                               this.setState({projectIDs : projectIDs, loading : false});
                           });
    }

    componentDidMount() {
        this.getData();
    }

    render() {
   
        return (
            <div>
                <p>{this.props.authUser ? "Logged in" : "Not logged in ;("}</p>
                <h1>New Project Form</h1>
                <form onSubmit = {this.onSubmit}>
                <input
                    name = "name"
                    value = {this.state.name}
                    onChange = {this.onChange}
                    type = "text"
                    placeholder = "Project Name"
                />
                <button type="submit">Submit</button>
                </form>
                <hr/>
                <div>
                    <h1>My Projects</h1>
                    {
                        !this.state.loading ? 
                            this.state.projectIDs.map(projectID => <Project key = {projectID} {...this.props} pid = {projectID} />) :
                            <p>Loading projects...</p>
                    }
                </div>
            </div>
        )
    }
}

class Project extends Component {
    constructor(props){
        super(props)
        this.state = {
            loading:true,
        }
    }

    componentDidMount(){
        this.getData();
    }

    getData = () => {
        this.props.firebase.project(this.props.pid)
                           .once("value")
                           .then(dataSnapshot => {
                               const project = dataSnapshot.val();
                               this.setState({project : project, loading : false})
                           })
    }
    render(){
 
        const {project, loading} = this.state;
        const path = ROUTES.PROJECTS + '/' + this.props.pid;
        return loading ? (
            <div>
                loading...
            </div>
        ) : (
            <div>
              <h2>{project.name}</h2>
              <Link to={path}>Go to Project Page</Link>
            </div>
        )
    }
}
    


const ProjectsPage = props => {
    console.log(!isEmpty(props.authUser));
    if(!isEmpty(props.authUser)){
        return(
            <div>
                {React.createElement(withFirebase(connect(mapStateToProps,mapDispatchToProps)(AddProjectForm)))}
            </div>
        )
    } else {
        props.history.push(ROUTES.LOG_IN)
        return(
            <div></div>
        )
    }
}

const mapStateToProps = state => (
    {
        authUser : state.authUser,
    }
)

const mapDispatchToProps = dispatch => (
    {

    }
)

export default withRouter(connect(mapStateToProps,mapDispatchToProps)(ProjectsPage));