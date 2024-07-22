// In your Redux action file (e.g., actions/invoiceActions.js)
export const STORE_INVOICE_DATA = 'STORE_INVOICE_DATA';
export const UPDATE_INVOICE_DATA = 'UPDATE_INVOICE_DATA';
export const DELETE_INVOICE_DATA = 'DELETE_INVOICE_DATA';

export const storeInvoiceData = (invoiceData) => ({
    type: STORE_INVOICE_DATA,
    payload: invoiceData,
});

// In your Redux action file (e.g., actions/invoiceActions.js)

export const updateInvoiceData = (updatedData) => ({
    type: UPDATE_INVOICE_DATA,
    payload: updatedData,
});

export const deleteInvoiceData = () => ({
    type: DELETE_INVOICE_DATA,
});


export const UPDATE_LAST_INVOICE_NUMBER = 'UPDATE_LAST_INVOICE_NUMBER';

export const updateLastInvoiceNumber = (lastInvoiceNumber) => ({
    type: UPDATE_LAST_INVOICE_NUMBER,
    payload: lastInvoiceNumber,
});


// In your Redux action file (e.g., actions/invoiceActions.js)

export const STORE_CREDIT_AMOUNT = 'STORE_CREDIT_AMOUNT';

export const storeCreditAmount = (personName, creditAmount, currentDate) => ({
    type: STORE_CREDIT_AMOUNT,
    payload: { personName, creditAmount, currentDate },
});
//// In your Redux reducer file (e.g., reducers/invoiceReducer.js)

const initialState = {
    invoices: [],
};

const invoiceBillReducer = (state = initialState, action) => {
    switch (action.type) {
        case STORE_INVOICE_DATA:
            return {
                ...state,
                invoices: [...state.invoices, action.payload] // Merge new invoice into the existing array
            };
        case UPDATE_INVOICE_DATA:
            // return {
            //     ...state,
            //     invoices: state.invoices.map(invoice =>
            //         invoice.id === action.payload.id ? { ...invoice, ...action.payload } : invoice
            //     ) // Update the specific invoice based on its id
            // };
            // case UPDATE_INVOICE_DATA:
            return {
                ...state,
                invoices: action.payload // Update the invoices array with the updated data
            };
        case DELETE_INVOICE_DATA:
            return {
                ...state,
                invoices: state.invoices.filter(invoice => invoice.id !== action.payload) // Remove the specified invoice
            };


        default:
            return state;
    }
};

export default invoiceBillReducer;