import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router,
         Route,
         Switch
        } from 'react-router-dom';
import { withFirebase } from './Firebase/index';

import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/index';
import SignUpPage from './components/SignUp/index';
import SignInPage from './components/SignIn/index';
import HomePage from './components/Home/index';
import ProjectsPage from './components/ProjectsPage/index';
import ProjectPage from './components/ProjectsPage/ProjectPage/index';

import * as ROUTES from './constants/routes';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authUser : null
    }
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser ? this.setState({authUser}) : this.setState({authUser:null});
    })
  }

  componentWillUnmount() {
    this.listener();
  }

 render() {
   return (
    <Router>
        <div>
          <Navigation authUser={this.state.authUser} />
          
          <Switch>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
            <Route path={ROUTES.LOG_IN} component={SignInPage} />
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.BUG} component={ProjectPage} />
            <Route path={ROUTES.PROJECT} component={ProjectPage} />
            <Route exact path={ROUTES.PROJECTS} component={ProjectsPage} />
            <Route render = {() => <h1>404, page not found</h1>} />
          </Switch>

        </div>
      </Router>
      );
    }
}

export default withFirebase(App);
