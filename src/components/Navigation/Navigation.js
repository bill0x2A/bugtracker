import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut/SignOut';
 
import * as ROUTES from '../../constants/routes';
import classes from './Navigation.module.css';
import logo from '../../assets/logo.png';

const Navigation = ({ authUser }) => (
  <div>{authUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>
)
 
const NavigationAuth = props => (
  <nav className = {classes.Navbar}>
    <div className={classes.ImageDiv}>
      <Link to={ROUTES.HOME}>
        <img src = {logo}></img>
      </Link>
    </div>
    <div className = {classes.NavbarNav}>
        <Link to={ROUTES.HOME}>
          <i className="fas fa-house-user"></i>
        </Link>

        <Link to={ROUTES.ACCOUNT}>
          <i className="fas fa-user-cog"></i>
        </Link>

        <SignOutButton />

    </div>
  </nav>
);

const NavigationNonAuth = () => (
  <nav className = {classes.Navbar}>
    <img src = {logo}></img>
    <ul className = {classes.NavbarNav}>
      <li>
        <Link to={ROUTES.LOG_IN}>Log In</Link>
      </li>
      <li>
        <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
      </li>
    </ul>
  </nav>
)

export default Navigation;