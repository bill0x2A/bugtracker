import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router,
         Route,
         Switch
        } from 'react-router-dom';
import { withFirebase } from './Firebase/index';

import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/LandingPage';
import SignUpPage from './components/SignUp/SignUp';
import SignInPage from './components/SignIn/SignIn';
import HomePage from './components/UserPage/Self/Self';
import NewProject from './components/ProjectsPage/NewProject/NewProject';
import ProjectPage from './components/ProjectsPage/ProjectPage/ProjectPage';
import UserPage from './components/UserPage/Other/Other';
import AccountPage from './components/AccountPage/AccountPage';
import AdminPage from './components/AdminPage/AdminPage';

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
            <Route exact path={ROUTES.LANDING} render={() => <LandingPage authUser={this.state.authUser}/>} />
            <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
            <Route path={ROUTES.LOG_IN} component={SignInPage} />
            <Route path={ROUTES.ACCOUNT} component={AccountPage}/>
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.USER} component={UserPage} />
            <Route path={ROUTES.ADMIN} component={AdminPage} />
            <Route path={ROUTES.BUG} component={ProjectPage} />
            <Route path={ROUTES.NEWPROJECT} component={NewProject} />
            <Route path={ROUTES.PROJECT} component={ProjectPage} />
            <Route render = {() => <h1>404, page not found</h1>} />
          </Switch>

        </div>
      </Router>
      );
    }
}

export default withFirebase(App);
