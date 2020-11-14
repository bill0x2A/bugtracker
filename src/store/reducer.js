import * as actionTypes from './actionTypes';

const initialState = {
    authUser : {},
};

const reducer = ( state = initialState, action ) => {
    switch(action.type) {
        case actionTypes.LOGIN:
            console.dir(action)
            return {
                ...state,
                authUser : action.authUser,         
            }
        // case actionTypes.LOGOUT:
        //     return {
        //         ...state,
        //         authUser : {},
        //     }
        default:
            return state
    }
}

export default reducer;