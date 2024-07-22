// actions.js
export const actionTypes = {
    ADD_BILL: 'ADD_BILL',
    UPDATE_BILL: 'UPDATE_BILL',
    DELETE_BILL: 'DELETE_BILL'
};

export const addBill = (billData) => ({
    type: actionTypes.ADD_BILL,
    payload: billData
});

export const updateBill = (billData) => ({
    type: actionTypes.UPDATE_BILL,
    payload: billData
});

export const deleteBill = (billNumber) => ({
    type: actionTypes.DELETE_BILL,
    payload: billNumber
});


// reducers.js
const initialState = {
    bills: []
};

const CreditBillReducer = (state = initialState, action) => {
    console.log("CreditBillReducer", action.payload);
    switch (action.type) {
        case actionTypes.ADD_BILL:
            return {
                ...state,
                bills: [...state.bills, action.payload]
            };
        case actionTypes.UPDATE_BILL:
            return {
                ...state,
                bills: state.bills.map(bill =>
                    bill.billNo === action.payload.billNo ? action.payload : bill
                )
            };
        case actionTypes.DELETE_BILL:
            return {
                ...state,
                bills: state.bills.filter(bill => bill.billNo !== action.payload)
            };
        default:
            return state;
    }
};

export default CreditBillReducer;
