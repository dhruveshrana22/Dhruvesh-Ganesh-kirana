// productDataReducer.js

// Define initial state
const initialState = {
    delerproducts: [],
};

// Define action types
const ADD_DELAREPRODUCT = 'ADD_DELAREPRODUCT';
const UPDATE_DELAREPRODUCT = 'UPDATE_DELAREPRODUCT';
const DELETE_DELAREPRODUCT = 'DELETE_DELAREPRODUCT';

// Define action creators
export const addDELAREProduct = (product) => ({
    type: ADD_DELAREPRODUCT,
    payload: product,
});

export const updateDELAREProduct = (productId, updatedProduct) => ({
    type: UPDATE_DELAREPRODUCT,
    payload: { productId, updatedProduct },
});

export const deleteDELAREProduct = (productId) => ({
    type: DELETE_DELAREPRODUCT,
    payload: productId,
});

// Define reducer function
const productDataDlareReducer = (state = initialState, action) => {

    switch (action.type) {
        case ADD_DELAREPRODUCT:
            return {
                ...state,
                delerproducts: [...state.delerproducts, action.payload],
            };
        case UPDATE_DELAREPRODUCT:
            return {
                ...state,
                delerproducts: state.delerproducts.map(product =>
                    product.id === action.payload.productId ? action.payload.updatedProduct : product
                ),
            };
        case DELETE_DELAREPRODUCT:
            return {
                ...state,
                delerproducts: state.delerproducts.filter(product => product.id !== action.payload),
            };
        default:
            return state;
    }
};

export default productDataDlareReducer;
