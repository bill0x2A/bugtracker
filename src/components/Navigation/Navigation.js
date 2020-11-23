import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut/index';
 
import * as ROUTES from '../../constants/routes';
import classes from './Navigation.module.css';
import logo from '../../assets/logo.png';

const Navigation = ({ authUser }) => (
  <div>{authUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>
)
 
const NavigationAuth = props => (
  <nav className = {classes.Navbar}>
    <img src = {logo}></img>
    <div className = {classes.NavbarNav}>
        <Link to={ROUTES.HOME}>
          <i class="fas fa-house-user"></i>
        </Link>

        <Link to={ROUTES.ACCOUNT}>
          <i class="fas fa-user-cog"></i>
        </Link>

        <SignOutButton />

    </div>
  </nav>
);

const NavigationNonAuth = () => (
  <nav className = {classes.Navbar}>
    <h2>App Name</h2>
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

const NavItem = props => (
  <div className = {classes.NavItemWrapper}></div>
)

export default Navigation;