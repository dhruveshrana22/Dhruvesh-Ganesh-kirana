// actions.js


// actionTypes.js
export const ADD_CUSTOMER = 'ADD_CUSTOMER';
export const UPDATE_CUSTOMER = 'UPDATE_CUSTOMER';
export const DELETE_CUSTOMER = 'DELETE_CUSTOMER';

export const addCustomer = (customer) => ({
    type: 'ADD_CUSTOMER',
    payload: customer
});

export const updateCustomer = (customer) => ({
    type: 'UPDATE_CUSTOMER',
    payload: customer
});

export const deleteCustomer = (customerId) => ({
    type: 'DELETE_CUSTOMER',
    payload: customerId
});
// reducers.js
const initialState = {
    customers: []
};

const customerReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_CUSTOMER':
            return {
                ...state,
                customers: [...state.customers, action.payload]
            };
        case 'UPDATE_CUSTOMER':
            return {
                ...state,
                customers: state.customers.map(customer =>
                    customer.id === action.payload.id ? action.payload : customer
                )
            };
        case 'DELETE_CUSTOMER':
            return {
                ...state,
                customers: state.customers.filter(customer => customer.id !== action.payload)
            };
        default:
            return state;
    }
};

export default customerReducer;
