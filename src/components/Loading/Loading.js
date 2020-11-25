import React from 'react';
import './Spinners.css';
import Spinner from 'react-bootstrap/Spinner';

const Loading = props => (
    <div style={{display:"flex", width:"100%", justifyContent:"center", alignItems:"center"}}>
        <Spinner animation="border" />
    </div>
)

export default Loading;