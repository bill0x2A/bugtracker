import React, { Component } from 'react';
import classes from './SelectedBug.module.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Prism from 'prismjs';
import '../../../../../prismjs/prism.css';

const elementCreator = entry => {
    switch(entry.type){
        case "image":
            return <img src={entry.data} className={classes.Image}/>;
        case "text" :
            return <p key ={entry.data}>{entry.data}</p>
        case "code" :
            return (<pre className="line-numbers">
                        <code className="language-js">
                            {`${entry.data}`.trim()}
                        </code>
                   </pre>);
        default:
            return null;
    }
}

class Comment extends Component {
    constructor(props){
        super();
        this.state = {
            user : {username : "loading"}
        }
    }

    getUserInfo = () => {
        this.props.firebase.user(this.props.comment.author)
                           .once("value")
                           .then(dataSnapshot => {
                               const user = dataSnapshot.val();
                               this.setState({user : user});
                           });
    }

    componentDidMount() {
        this.getUserInfo();
    }

    render(){
        return(
            <div className={classes.Comment}>
                <div className={classes.CommentHeader}>
                    <h3>{this.state.user.username}</h3>
                    <h4>{this.props.comment.time}</h4>
                </div>
                <div className = {classes.CommentBody}>
                {this.props.comment.entries.map(entry => elementCreator(entry))}
                </div>
            </div>
        )
    }
}

class CommentAddingForm extends Component {
    constructor(){
        super();
        this.state = {
            entries : [{type : "text", data : ""}],
        }
    }

    onSubmit = e => {
        e.preventDefault();
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + " " + date.getDate()  + "/" + date.getMonth() + "/" + date.getFullYear();
        const newComment = {
            entries : this.state.entries,
            author  : this.props.authUser.user.uid,
            time    : time
        }

        const newKey = this.props.firebase.comments()
                                          .push(newComment)
                                          .getKey();
    
        this.props.firebase.bug(this.props.bug.id)
                           .child('comments')
                           .push(newKey);
        
        const newAction = {
            type  : "addComment",
            user  : this.props.authUser.user.uid,
            time  : date.getTime(),
            bugID : this.props.bug.id,
        }
    
        const newActionKey  = this.props.firebase.actions()
                                                 .push(newAction)
                                                 .getKey();

        this.props.firebase.project(this.props.pid)
                           .child("actions")
                           .push(newActionKey);         

        this.props.submit();
    }

    onChangeDynamicBinding = e => {
        let currentEntries = [...this.state.entries];
        const index = e.target.name;
        currentEntries[index].data = e.target.value;
        this.setState({entries:currentEntries});
    }

    onChange = e => {
        this.setState({ [e.target.name] : e.target.value });
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
    
    componentDidUpdate(){
        Prism.highlightAll();
    }

    render(){
        const { entries } = this.state;
        return(
            <div class={classes.NewCommentForm}>
                <form onSubmit = {this.onSubmit}>
                    <input onChange = {this.onChange}
                           className = {classes.AddingInput}
                           name = "title"
                           type = "text"
                           value = {this.state.title}
                           placeholder = "Comment Title"
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
                    <button type="submit" className={classes.Button}>Submit Comment</button>
                </form>
            </div>
        )
    }
}

class Bug extends Component {
    constructor(props){
        super(props);
        this.state = {
            ...this.props.bug,
            addingComment : false,
            commentData : [],
        }
    }

    headerColourSelector = () => {
        switch(this.state.urgency){
            
            case "1": 
                this.setState({headerColour: "red"});
                break;
            case "2": 
                this.setState({headerColour: "yellow"});
                break;
            case "3": 
                this.setState({headerColour: "green"});
                break;
        }
    }

    
    routeGen = () => {
        this.setState({route : this.props.pid + "/" + this.state.id});
    }

    submitChangeUrgency = newUrgency => {

        const time = new Date();
        const newAction = {
            type  : "changeUrgency",
            user  : this.props.authUser.user.uid,
            time  : time.getTime(),
            bugID : this.state.id,
            data  : newUrgency,
        }

        this.setState({urgency : newUrgency}, this.headerColourSelector);

        this.props.firebase.bug(this.state.id)
                           .child("urgency")
                           .set(newUrgency);

        const newKey  = this.props.firebase.actions()
                                           .push(newAction)
                                           .getKey();

        this.props.firebase.project(this.props.pid)
                           .child("actions")
                           .push(newKey);
    }

    addingCommentHandler = () => {
        this.setState({addingComment : true});
    }
    submitComment = () => {
        this.setState({addingComment:false});
    }

    loadComments = () => {
        let commentIDs = [];
         try {
            commentIDs = Object.values(this.state.comments);
         } catch (e) {
            console.log("")
         }

        commentIDs.forEach(commentID => {
            this.props.firebase.comment(commentID)
                               .once("value")
                               .then(dataSnapshot => {
                                   let comments = [...this.state.commentData];
                                   const newComment = {
                                       ...dataSnapshot.val(),
                                       id : commentID,
                                    }
                                   comments.push(newComment);
                                   this.setState({commentData : comments});
                               })
        })
    }

    componentDidMount() {
        this.loadComments();
        this.headerColourSelector();
        this.routeGen();
    }

    resolve = () => {
        const time = new Date();
        const newAction = {
            type  : "resolve",
            user  : this.props.authUser.user.uid,
            time  : time.getTime(),
            bugID : this.state.id,
        }

        this.props.firebase.bug(this.state.id)
                           .child("resolved")
                           .set(true);

        const newKey  = this.props.firebase.actions()
                                           .push(newAction)
                                           .getKey();

        this.props.firebase.project(this.props.pid)
                           .child("actions")
                           .push(newKey);
    }

    render(){
        const { entries, title, headerColour, commentData } = this.state;
        return (
            <div className={classes.Selected}>
                <div className={classes.Resolved}
                     onClick ={this.resolve}>Mark Resolved</div>      
                <div style = {{background : headerColour}} className={classes.Header}></div>
                <h3>{title}</h3>
                {entries.map(entry => elementCreator(entry))}
                <div className={classes.UrgencySelector}>
                                <p>Change Urgency</p>
                                <div className = {classes.Inputs}>
                                    <div className = {classes.Red}
                                        onClick = {() => this.submitChangeUrgency("1")}
                                    />
                                    <div className = {classes.Yellow} 
                                        onClick = {() => this.submitChangeUrgency("2")}
                                    />
                                    <div className = {classes.Green}
                                        onClick = {() => this.submitChangeUrgency("3")}
                                    /> 
                                </div>                                
                </div>
                <h3>Comments</h3>
                {this.state.commentData.map(comment => <Comment firebase = {this.props.firebase} comment={comment} key = {comment.id} />)}
                {this.state.addingComment ? <CommentAddingForm submit = {this.submitComment} {...this.props} /> : <button className={classes.Button}
                                                                                            onClick = {this.addingCommentHandler}
                                                                                    >Add Comment</button>}

            </div>
        )
    }
}

export default withRouter(Bug);