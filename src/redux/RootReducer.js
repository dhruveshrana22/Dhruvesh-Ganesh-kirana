import { combineReducers } from 'redux';
import productReducer from './ProductData/Peoductdata';
import invoiceReducer from './Addinvoiceitem/Addinvoiceiemredux';
import invoiceBillReducer from './Addinvoiceitem/AddInvoiceBill_Redux';
import customerReducer from './AddCustomer/Addcustomerredux';
import CreditBillReducer from './Addinvoiceitem/CreditBillAmmount';
import dealerReducer from './AddDelerRedux/AddDelarDetail';
import productDataDlareReducer from './AddDelerRedux/AdddelarProduct';
import AddUser from './AddUSer';
import currentUser from './Reducers/currentUser';

const rootReducer = combineReducers({
    currentUser,
    product: productReducer,
    Item: invoiceReducer,
    Bill: invoiceBillReducer,
    Customerdata: customerReducer,
    CreditBillReducer: CreditBillReducer,
    dealerReducer: dealerReducer,
    productDataDlareReducer: productDataDlareReducer,
    AddUser: AddUser
    // Add more reducers if needed
});

export default rootReducer;
