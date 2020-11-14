import React from 'react';
import { connect } from 'react-redux';

const Homepage = props => (
    <div>
        <h1>Should display authUser here</h1>
        <p>{props.authUser.user && props.authUser.user.uid}</p>
    </div>
)

function _renderObject(object){
    return Object.keys(object).map((obj, i) => {
        return (
            <div>
                id is: {object[obj].id} ;
                name is: {object[obj].name}
            </div>
            )
        }
    )
}

const mapStateToProps = state => (
    {
        authUser : state.authUser,
    }
)


export default connect(mapStateToProps)(Homepage);