import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.auth = app.auth();
    this.db = app.database();
    this.storage = app.storage();

  }

  // ### AUTH API ###

  doCreateUserWithEmailAndPassword = (email, password) => {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  doSignInWithEmailAndPassword = (email, password) => {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  doDeleteAccount = () => this.auth.currentUser.delete();

  doSignInAnonymously = () => this.auth.signInAnonymously();

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password => {  
    this.auth.currentUser.updatePassword(password);
  }

 // ### CONTENT API ####

 user = uid => this.db.ref(`users/${uid}`);
 users = () => this.db.ref('users');

 project = projectID => this.db.ref(`projects/${projectID}`);
 projects = () => this.db.ref('projects');

 bug = bugID => this.db.ref(`bugs/${bugID}`);
 bugs = () => this.db.ref('bugs');

 comment = commentID => this.db.ref(`comments/${commentID}`)
 comments = () => this.db.ref('comments');

 action = actionID => this.db.ref(`actions/${actionID}`);
 actions = () => this.db.ref('actions');

 invite = inviteID => this.db.ref(`invites/${inviteID}`);
 invites = () => this.db.ref('invites');

 // ### STORAGE API ###

 images = () => this.storage.ref('profiles');
 image = uid => this.storage.ref(`profiles/${uid}`);
}

export default Firebase;