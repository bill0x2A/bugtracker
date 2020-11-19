import React from 'react';
import classes from './DisplayBug.module.css';
import { withRouter } from 'react-router-dom';

const elementCreator = entry => {
    switch(entry.type){
        case "image":
            return <img src={entry.data} className={classes.Image}/>;
        case "text" :
        case "code" :
            return <p>{entry.data}</p>;
        default:
            return null;
    }
}

const Bug = props => {
    let headerColour = null;
    const {urgency, title, entries, id} = props.bug;
    switch(urgency){
        case "1": 
            headerColour = "red";
            break;
        case "2": 
            headerColour = "yellow";
            break;
        case "3": 
            headerColour = "green";
            break;
    }

    const route = props.pid + "/" + id;

    return (
        <div className={classes.Bug} onClick = {props.click}>
            <div style = {{background : headerColour}} className={classes.Header}></div>
            <h3>{title}</h3>
            {entries.map(entry => elementCreator(entry))}
            <div className={classes.FadeOut}/>
        </div>
    )
}

export default withRouter(Bug);