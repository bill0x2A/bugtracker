import classes from './BugAdder.module.css';
import React, { Component } from 'react';

const STARTER_STATE = {
    title : '',
    entries : [{type : 'text', data : ''}],
    urgency : 0

}

class AddBugForm extends Component {
    constructor(props) {
        super(props);
        this.state = STARTER_STATE;
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
    }

    onChangeDynamicBinding = e => {
        let currentEntries = [...this.state.entries];
        const index = e.target.name;
        currentEntries[index].data = e.target.value;
        this.setState({entries:currentEntries});
    }

    onSubmit = e => {
        e.preventDefault();

        const bugID = this.props.firebase.bugs().push().getKey();
        const newBug = { ...this.state,
                         project : this.props.pid,
                         creator : this.props.authUser.user.uid,
                         resolved : false,
                        };
        
        this.props.firebase.bug(bugID).set(newBug);

        const time = new Date();
        const newAction = {
            type  : "addBug",
            user  : this.props.authUser.user.uid,
            time  : time.getTime(),
            bugID : bugID,
            data  : { title : this.state.title, urgency : this.state.urgency},
        }
        
        const newKey  = this.props.firebase.actions()
                                           .push(newAction)
                                           .getKey();

        this.props.firebase.project(this.props.pid).child("bugs")
                   .child(bugID)
                   .set(bugID);

        // Action update removed to stop double load bug =(

        this.setState(STARTER_STATE);
        this.props.close();
    }

    entryStateAdder = entryType => {
        let currentEntries = [...this.state.entries]
        switch(entryType){
            case "image":
                currentEntries.push({type:"image", data: ""});
                this.setState({entries : currentEntries})
                break;
            case "text":
                currentEntries.push({type:"text", data: ""});
                this.setState({entries : currentEntries})
                break;
            case "code": 
                currentEntries.push({type: "code", data: ""});
                this.setState({entries : currentEntries});
                break;
            default:
                return;
        }
    }
    
    entryDomAdder = entry => {
        const index = this.state.entries.indexOf(entry);

        switch(entry.type){
            case "image":
                return (
                    <input
                    onChange = {this.onChangeDynamicBinding}
                    name = {index}
                    type = "text"
                    value = {this.state.entries[index].data}
                    placeholder = "Add image URL here"
             />
                );
            case "code":
                return (
                    <textarea onChange = {this.onChangeDynamicBinding}
                    name = {index}
                    type = "text"
                    value = {this.state.entries[index].data}
                    placeholder = "Add your code here"
             />
                );
            case "text":
                return (
                    <textarea onChange = {this.onChangeDynamicBinding}
                    name = {index}
                    type = "text"
                    value = {this.state.entries[index].data}
                    placeholder = "Add your description here"
             />
                );
            default:
                return null;
        }
    }

    render () {
        const { entries } = this.state;
        const formIsValid = (this.state.title !== "") && (this.state.urgency !== 0);
        return (
            <div className={classes.BugAddForm}>
                <form onSubmit = {this.onSubmit}>
                    <input onChange = {this.onChange}
                           name = "title"
                           type = "text"
                           value = {this.state.title}
                           placeholder = "Bug Name"
                    />
                    {entries.map(entry => this.entryDomAdder(entry))}
                    <div className={classes.NewSection}>
                        <span onClick={() => this.entryStateAdder("image")}
                              className ={classes.AddImage}
                        >+ Add Image</span>
                        <span onClick={() => this.entryStateAdder("text")}
                              className ={classes.AddImage}
                        >+ Add Text</span>
                        <span onClick={() => this.entryStateAdder("code")}
                              className ={classes.AddImage}
                        >+ Add Code</span>
                    </div>
                    <div className={classes.UrgencySelector}>
                        Urgency
                        <input className = {classes.Red}
                            onChange = {this.onChange}
                            name = "urgency"
                            type = "radio"
                            value = {1}
                        />
                        <input className = {classes.Yellow} 
                            onChange = {this.onChange}
                            name = "urgency"
                            type = "radio"
                            value = {2}
                        />
                        <input className = {classes.Green}
                            onChange = {this.onChange}
                            name = "urgency"
                            type = "radio"
                            value = {3}
                        />                                                
                    </div>
                    <div className ={classes.ButtonsContainer}>
                        <button disabled = {!formIsValid} className = {[classes.Button, classes.Submit].join(" ")} type="submit">Submit Bug</button>
                        <button  className = {classes.Button}style={{backgroundColor:"salmon"}} onClick={this.props.close}>Cancel</button>
                    </div>
                </form>
            </div>
        )
    }
}


const BugAdder = props => {
    return (
        <div className={classes.BugAdder}>
            <h2>Add a new bug</h2>
            <AddBugForm {...props} />
            
        </div>
    )
}

export default BugAdder;