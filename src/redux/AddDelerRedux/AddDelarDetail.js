// dealerRedux.js
// This file contains Redux actions, reducers, and action creators for dealer management

// Action Types
const ADD_DEALER = 'ADD_DEALER';
const DELETE_DEALER = 'DELETE_DEALER';
const UPDATE_DEALER = 'UPDATE_DEALER';

// Initial State
const initialState = {
    dealers: []
};

// Reducer
const dealerReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_DEALER:
            return {
                ...state,
                dealers: [...state.dealers, action.payload]
            };
        case DELETE_DEALER:
            return {
                ...state,
                dealers: state.dealers.filter(dealer => dealer.id !== action.payload)
            };
        case UPDATE_DEALER:
            return {
                ...state,
                dealers: state.dealers.map(dealer =>
                    dealer.id === action.payload.id ? { ...dealer, ...action.payload } : dealer
                )
            };
        default:
            return state;
    }
};

// Action Creators
export const addDealer = (dealer) => ({
    type: ADD_DEALER,
    payload: dealer
});

export const deleteDealer = (dealerId) => ({
    type: DELETE_DEALER,
    payload: dealerId
});

export const updateDealer = (dealer) => ({
    type: UPDATE_DEALER,
    payload: dealer
});

export default dealerReducer;
