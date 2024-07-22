import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import ProductManagement from "./Screen/AddProduct/Product";
import ViewBills from "./Screen/ViewBills/ViewBills";
import PrintPreview from "./Screen/ViewBills/PrintPriview";
import Addcustomers from "./Screen/AddCustomer/AddCustomer";
import PurchaseManagement from "./Screen/PurchaseBill";
import AddDealers from "./Screen/Dealer/AddDelarDetail";
import PurchaseEntry from "./Screen/Bills/PurchaseEntry";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./Screen/Login/Login";
import SignupForm from "./Screen/Login/Signup";
import InvoiceInput from "./Screen/Bills/NewBill";
import UpdateBill from "./Screen/Bills/UpdateBill";
import PurchaseViewBills from "./Screen/ViewBills/ShowPurchaseBill";
import PurchaseUpdateBill from "./Screen/Bills/PurchaseUpdateBill";
import PrintPreviewData from "./Screen/PrintPreview";
import ClearPayout from "./Screen/ClearPayout/ClearPayout";
import AllCustomer from "./Screen/ClearPayout/ShowAllCustomer";
import CreditDataTable from "./Screen/Bills/CreditBill";
import CreditPrintBill from "./Screen/Bills/CreditprintBill";
import Kharcho from "./Screen/Expanse";
import PandLAccount from "./Screen/P&L/p&l";
import Showprintbill from "./Screen/Componants/CprintBills";
import NotFound from "./Screen/404";

function App() {
  return (
    <>
      <Routes>
        <Route path="/DhruveshHome" element={<Home />} />
        {/* <Route path="/" element={<NotFound />} /> */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/Signup" element={<SignupForm />} />
        <Route path="/product" element={<ProductManagement />} />
        <Route path="/AddCustomer" element={<Addcustomers />} />
        <Route path="/Bill/NewBill" element={<InvoiceInput />} />
        <Route path="/ViewBill" element={<ViewBills />} />
        <Route path="/UpdateBill" element={<UpdateBill />} />
        <Route path="/print-preview" element={<PrintPreview />} />
        <Route path="/AddDealers" element={<AddDealers />} />
        <Route path="/PurchaseEntry" element={<PurchaseEntry />} />
        <Route path="/purchaseBill" element={<PurchaseViewBills />} />
        <Route path="/PurchaseUpdateBill" element={<PurchaseUpdateBill />} />
        <Route path="/PrintPreview" element={<PrintPreviewData />} />
        <Route path="/ClearPayOut" element={<ClearPayout />} />
        <Route path="/AllCustomer" element={<AllCustomer />} />
        <Route path="/CreditDataTable" element={<CreditDataTable />} />
        <Route path="/CreditPrintBill" element={<CreditPrintBill />} />
        <Route path="/kharcho" element={<Kharcho />} />
        <Route path="/P&l" element={<PandLAccount />} />
        <Route path="/ShowP&lData" element={<Showprintbill />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
