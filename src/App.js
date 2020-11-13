import React from 'react';
import './App.css';
import { BrowserRouter as Router,
         Route,
         Switch
        } from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/LandingPage/index';
import SignUpPage from './components/SignUp/index';
import SignInPage from './components/SignIn/index';

 
import * as ROUTES from './constants/routes';



function App() {
  return (
<Router>
    <div>
      <Navigation />
 
      <hr />
 
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.LOG_IN} component={SignInPage} />
      {/* <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} /> */}
    </div>
  </Router>
  );
}

export default App;
