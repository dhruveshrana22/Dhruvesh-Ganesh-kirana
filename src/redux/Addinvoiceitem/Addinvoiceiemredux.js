// actionTypes.js
export const ADD_INVOICE_ITEM = 'ADD_INVOICE_ITEM';
export const UPDATE_INVOICE_ITEM = 'UPDATE_INVOICE_ITEM';
export const DELETE_INVOICE_ITEM = 'DELETE_INVOICE_ITEM';
// actions.js

export const addInvoiceItem = (item) => ({
    type: ADD_INVOICE_ITEM,
    payload: item,
});

export const updateInvoiceItem = (index, updatedItem) => ({
    type: UPDATE_INVOICE_ITEM,
    payload: { index, updatedItem },
});

export const deleteInvoiceItem = (index) => ({
    type: DELETE_INVOICE_ITEM,
    payload: index,
});



// reducers.js

const initialState = {
    Items: [],
};

const invoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_INVOICE_ITEM:
            return {
                ...state,
                Items: [...state.Items, action.payload],
            };
        case UPDATE_INVOICE_ITEM:
            const { index, updatedItem } = action.payload;
            const updatedItems = [...state.Items];
            updatedItems[index] = updatedItem;
            return {
                ...state,
                Items: updatedItems,
            };
        case DELETE_INVOICE_ITEM:
            const deletedItems = [...state.Items];
            deletedItems.splice(action.payload, 1);
            return {
                ...state,
                Items: deletedItems,
            };
        default:
            return state;
    }
};

export default invoiceReducer;
