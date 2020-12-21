import * as actionTypes from './actionTypes';

const initialState = {
    authUser : {},
    tutorialActive : false,
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
            break;
        case actionTypes.ACTIVATE_TUTORIAL:
            return {
                ...state,
                tutorialActive : true,
            }
            break;
        case actionTypes.END_TUTORIAL:
            return {
                ...state,
                tutorialActive : false,
            }
            break;           
        case actionTypes.LOG_OUT:
            delete state.authUser;
            break;
            return initialState;
        default:
            return state
    }
}

export default reducer;