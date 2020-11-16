import React, { Component } from 'react';
import { withFirebase } from '../../../Firebase';
import { connect } from 'react-redux';
import { withRouter, useParams } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

class ProjectPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
        }
    }

    componentDidMount() {
        this.getProjectData();
    }

    getProjectData = () => {
        this.props.firebase.project(this.props.pid)
                           .once("value")
                           .then( dataSnapshot => {
                               const project = dataSnapshot.val();
                               this.setState({loading:false, project : project})
                           })
    }

    render (){
        const { project, loading } = this.state;
        return (
            loading ? (
                <div>Loading content...</div>
            ) : (
                <div>
                    <h1>{project.name}</h1>
                </div>
            )
        )
    }
}

const ProjectPageWithAuth = props => {
    const pid = useParams().id;
    if(props.authUser.user.uid){
        return <ProjectPage {...props} pid ={pid} />
    } else {
        props.history.push(ROUTES.LANDING);
    }
}

const mapStateToProps = state => {
    return ({
        authUser : state.authUser,
    })
} 

export default withRouter(withFirebase(connect(mapStateToProps)(ProjectPageWithAuth)));