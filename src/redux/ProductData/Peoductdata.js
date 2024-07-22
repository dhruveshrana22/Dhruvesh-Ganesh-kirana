// ProductData/Peoductdata.js

// Define action types
const ADD_PRODUCT = 'ADD_PRODUCT';
const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
const DELETE_PRODUCT = 'DELETE_PRODUCT';

// Define action creators
export const addProduct = (product) => ({
    type: ADD_PRODUCT,
    payload: product
});

export const updateProductAction = (product) => ({
    type: UPDATE_PRODUCT,
    payload: product
});

export const deleteProductAction = (id) => ({
    type: DELETE_PRODUCT,
    payload: id
});
// reducers/ProductReducer.js
const initialState = {
    products: []
};

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_PRODUCT:
            const newProduct = {
                ...action.payload,
                id: Date.now() // Generating unique ID using timestamp
            };
            return {
                ...state,
                products: [...state.products, newProduct]
            };
        case UPDATE_PRODUCT:
            return {
                ...state,
                products: state.products.map(product =>
                    product.id === action.payload.id ? action.payload : product
                )
            };
        case DELETE_PRODUCT:
            return {
                ...state,
                products: state.products.filter(product => product.id !== action.payload)
            };
        default:
            return state;
    }
};

export default productReducer;
