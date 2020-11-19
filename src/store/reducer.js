import * as actionTypes from './actionTypes';

const initialState = {
    authUser : {},
};

const reducer = ( state = initialState, action ) => {
    switch(action.type) {
        case actionTypes.LOGIN:
            return {
                ...state,
                authUser : action.authUser,         
            }
        case actionTypes.SELECT_BUG:
            return {
                ...state,
                selectedBug : action.bugID
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