import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut/index';
 
import * as ROUTES from '../../constants/routes';
import classes from './Navigation.module.css';

const Navigation = ({ authUser }) => (
  <div>{authUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>
)
 
const NavigationAuth = props => (
  <nav className = {classes.Navbar}>
    <h2>App Name</h2>
    <ul className = {classes.NavbarNav}>
      <li>
        <Link to={ROUTES.LANDING}>Landing</Link>
      </li>
      <li>
        <Link to={ROUTES.HOME}>Home</Link>
      </li>
      <li>
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </li>
      <li>
        <SignOutButton />
      </li>
    </ul>
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