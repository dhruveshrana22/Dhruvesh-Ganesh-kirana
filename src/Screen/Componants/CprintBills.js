import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating unique IDs
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "../Bills/NewBill.css";

import { addProduct } from '../../redux/ProductData/Peoductdata';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem } from '../../redux/Addinvoiceitem/Addinvoiceiemredux';
import { storeInvoiceData } from '../../redux/Addinvoiceitem/AddInvoiceBill_Redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { months } from 'moment';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import firestore from '../../firebase';
import { toast } from 'react-toastify';
// import MyDrawer from '../Drawer';

const CreditPrintBill = () => {
    const navigation = useNavigate();
    const location = useLocation();
    const selectedData = location.state?.selectedData;
    console.log("🚀 ~ CreditPrintBill ~ selectedData:", selectedData)
    const onDelete = location.state?.onDelete;
    const recordId = location.state?.recordId;
    const customerID = location.state?.customerID;
    const customerNAME = location.state?.customerName;

    // const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('dd/mm/yyyy'));
    const currentDate = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options); // 'en-GB' for dd/mm/yyyy format
    const [invoiceDate, setInvoiceDate] = useState(formattedDate);

    const [invoiceNumber, setInvoiceNumber] = useState(selectedData.invoiceNumber); const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceItems, setInvoiceItems] = useState(selectedData.invoiceItems);
    const [discount, setDiscount] = useState(selectedData.discount);
    const [labor, setLabor] = useState(selectedData.labor);
    const [tax, setTax] = useState(selectedData.tax);
    const [editingIndex, setEditingIndex] = useState(null);
    const [MoNo, SetMoNo] = useState(selectedData.MoNo);
    const [customerName, SetcustomerName] = useState(selectedData.customerName);
    const [BillAmount, SetBillAmount] = useState('');
    const [transactionType, setTransactionType] = useState(selectedData.memo);

    const [discountType, setDiscountType] = useState('percentage');
    const [printing, setPrinting] = useState(false); // State to track if bill is being printed
    const [showModal, setShowModal] = useState(false);
    const item = useSelector(state => state.Item.Items) || [];

    const delsrproducts = useSelector(state => state.productDataDlareReducer.delerproducts) || [];

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    // Function to fetch products from Firestore
    const fetchProducts = async () => {
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProducts(productsData);
    };
    const fetchCustomers = async () => {
        const customersCollection = collection(firestore, 'customers');
        const customersSnapshot = await getDocs(customersCollection);
        const customersData = [];

        // Iterate through each customer document
        for (const doc of customersSnapshot.docs) {
            const customerData = {
                id: doc.id,
                ...doc.data(),
                invoices: [] // Array to store invoice data for this customer
            };

            // Fetch the invoices collection for this customer
            const invoicesCollectionRef = collection(doc.ref, 'invoices');
            const invoicesSnapshot = await getDocs(invoicesCollectionRef);

            // Map each invoice document to its data and push to the invoices array
            invoicesSnapshot.forEach(invoiceDoc => {
                customerData.invoices.push({
                    id: invoiceDoc.id,
                    ...invoiceDoc.data()
                });
            });

            customersData.push(customerData);
        }


        setCustomers(customersData);
    };

    // Fetch products from Firestore on component mount
    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);





    useEffect(() => {
        localStorage.setItem('lastInvoiceNumber', invoiceNumber);
    }, [invoiceNumber]);

    const incrementInvoiceNumber = () => {
        setInvoiceNumber(prevInvoiceNumber => parseInt(prevInvoiceNumber) + 1);
    };
    let totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.amount), 0);

    const dispatch = useDispatch();
    const calculateTotalAmount = () => {
        let totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.amount), 0);

        // Apply discount
        if (discountType === 'percentage') {
            if (discount.trim().endsWith('%')) {
                // If discount ends with '%', treat it as a percentage
                const discountPercentage = parseFloat(discount.trim().slice(0, -1));
                if (!isNaN(discountPercentage)) {
                    const discountAmount = (discountPercentage / 100) * totalAmount;
                    totalAmount -= discountAmount;
                }
            } else {
                // Otherwise, treat it as a fixed amount
                const fixedDiscount = parseFloat(discount);
                if (!isNaN(fixedDiscount)) {
                    totalAmount -= fixedDiscount;
                }
            }
        } else {
            const fixedDiscount = parseFloat(discount);
            if (!isNaN(fixedDiscount)) {
                totalAmount -= fixedDiscount;
            }
        }

        // Add labor
        totalAmount += parseFloat(labor) || 0;

        // Add tax
        if (!isNaN(parseFloat(tax))) {
            const taxAmount = (parseFloat(tax) / 100) * totalAmount;
            totalAmount += taxAmount;
        }

        return totalAmount.toFixed(2);
    };








    // Function to handle clicking on a row to populate the fields for editing
    const handleRowClick = (index) => {
        const item = invoiceItems[index];
        setProductName(item.productName);
        setProductPrice(item.productPrice);
        setQuantity(item.quantity);
        setAmount(item.amount);
        setEditingIndex(index); // Set the index of the item being edited
    };

    // Function to handle updating an item

    // Function to delete an item
    const deleteItem = (indexToDelete) => {
        // Remove the item from invoiceItems array
        const updatedInvoiceItems = [...invoiceItems];
        updatedInvoiceItems.splice(indexToDelete, 1);
        setInvoiceItems(updatedInvoiceItems);
    };










    const [selectedCustomerId, setSelectedCustomerId] = useState('');


    // Update handleCustomerNameChange function to set the selected customer's ID
    const handleCustomerNameChange = (event) => {
        const customerNameInput = event.target.value;
        SetcustomerName(customerNameInput);
        const selectedCustomer = customers.find(customer => customer.customerName === customerNameInput);
        if (selectedCustomer) {
            SetMoNo(selectedCustomer.mobileNumber);
            setSelectedCustomerId(selectedCustomer.id); // Set the selected customer's ID
        } else {
            SetMoNo('');
            setSelectedCustomerId(''); // Reset the selected customer's ID if not found
        }
    };




    const handleDelete = async () => {
        try {
            // Reference to the specific invoice document
            const invoiceRef = doc(firestore, `customers/${customerID}/invoices`, selectedData.id);

            // Delete the invoice document from Firestore
            await deleteDoc(invoiceRef);

            toast.success('Invoice data updated in Firestore');
            navigation("/ViewBill", { state: { customerNAME: customerNAME } })

        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            // Check if recordId is populated
            if (!recordId) {
                console.error('Invalid record data or customerId not found');
                return;
            }



            const invoiceData = {
                invoiceDate: invoiceDate,
                invoiceNumber: invoiceNumber,
                invoiceItems: invoiceItems,
                discount: discount,
                labor: labor,
                tax: tax,
                productName: productName,
                productPrice: productPrice,
                quantity: quantity,
                amount: amount,
                billAmount: calculateTotalAmount(),
                customerName: customerName,
                MoNo: MoNo
            };

            const invoiceRef = doc(firestore, `customers/${customerID}/invoices`, selectedData.id);


            await updateDoc(invoiceRef, invoiceData);

            toast.success('Invoice data updated in Firestore');
            navigation("/ViewBill", { state: { customerNAME: customerNAME } })

        } catch (error) {
            console.error('Error updating invoice data in Firestore:', error);
        }
    };









    const invoiceData = {
        invoiceDate: invoiceDate,
        invoiceNumber: invoiceNumber,
        invoiceItems: invoiceItems,
        discount: discount,
        labor: labor,
        tax: tax,
        productName: productName,
        productPrice: productPrice,
        quantity: quantity,
        amount: amount,
        billAmount: calculateTotalAmount(),
        customerName: customerName,
        MoNo: MoNo,

    }


    async function saveInvoiceDataToMongoDB(invoiceData) {
        try {
            // Send a POST request to the server's endpoint
            const response = await fetch('/api/saveInvoice', {
                method: 'POST', // HTTP POST method
                headers: {
                    'Content-Type': 'application/json' // Specify JSON content type
                },
                body: JSON.stringify(invoiceData) // Convert invoiceData to JSON string and include it in the request body
            });

            // Check if the request was successful (status code 200-299)
            if (response.ok) {

                return true; // Return true to indicate success
            } else {
                // If the request was not successful, throw an error
                throw new Error('Failed to save invoice data');
            }
        } catch (error) {
            console.error('Error saving invoice data:', error.message);
            return false; // Return false to indicate failure
        }
    }















    const generatePrintableBill = () => {
        setPrinting(true); // Set printing state to true when bill is being printed
        if (window && window.print) {
            // If running in a browser
            window.print(); // Open the browser print dialog
        } else if (window && window.require) {
            // If running in Electron
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('print-to-pdf'); // Send a message to main process to print to PDF
        } else {
            console.error('Printing not supported in this environment.');
        }
    };







    const handleMoNoChange = (event) => {
        const mobileNumberInput = event.target.value;
        SetMoNo(mobileNumberInput);
    };

    const handlePrint = () => {
        window.print();
    };
    const addItem2 = () => {
        // Logic to open the modal
        setShowModal(true);
    };
    return (
        <div style={{ display: 'flex', paddingRight: 20, justifyContent: 'center', alignItems: 'center' }}>


            <div id="Container2" style={{}}>
                <button onClick={handlePrint}>Print</button>

                <div className="print-preview-container">


                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: 0,
                        }}
                    >
                        <h4 style={{ fontSize: 10 }}>
                            Chandrakant Rana <br />
                            9265610593
                        </h4>
                        <div
                            style={{
                                alignItems: "center",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h2 style={{ fontSize: 13 }}>ગણેશ કિરણા સ્ટોર </h2>
                            <h2 style={{ fontSize: 13 }}>
                                સલુણ બજાર રાણા ચોક નડિયાદ ,387001{" "}
                            </h2>
                        </div>
                        <h4 style={{ fontSize: 10 }}>
                            Daxesh Rana
                            <br />
                            8866190395
                        </h4>
                    </div>
                    <div className="invoice-details" style={{
                        display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between',
                        marginTop: -10,
                        marginBottom: -10
                    }}>
                        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }} >

                            <p style={{ fontSize: 13 }}><strong>Invoice Number:</strong> <strong>{invoiceData.invoiceNumber}</strong></p>
                            <p style={{ fontSize: 13 }}><strong>Date:</strong> {invoiceData.invoiceDate}</p>
                            <h5>{transactionType} memo</h5>

                        </div>
                        <div style={{ display: 'flex', gap: 15 }} >
                            <p style={{ fontSize: 13 }}><strong>Customer Name:</strong> {invoiceData.customerName}</p>
                            <p style={{ fontSize: 13 }}><strong>MoNo:</strong> {invoiceData.MoNo}</p>
                            {/* <p><strong>Village Name:</strong> {customers.villageName}</p> */}

                        </div>
                    </div>
                    <div className="invoice-items">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ fontSize: 12 }}>SiNo</th>
                                    <th style={{ fontSize: 12 }}>Product Name</th>
                                    <th style={{ fontSize: 12 }}>Price</th>
                                    <th style={{ fontSize: 12 }}>Qty/(KG)</th>
                                    <th style={{ fontSize: 12 }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.invoiceItems.map((item, index) => (
                                    <tr key={index} onDoubleClick={() => handleRowClick(index)}>
                                        <td style={{ fontSize: 13 }}>{index + 1}</td>
                                        <td style={{ fontSize: 13 }}>{item.productName}</td>
                                        <td style={{ fontSize: 13 }}>{item.productPrice}</td>
                                        <td style={{ fontSize: 13 }}>{item.quantity} </td>
                                        <td style={{ fontSize: 13 }}>{item.amount}</td>
                                        <button type="button" style={{ backgroundColor: 'transparent', color: 'black' }} onClick={() => deleteItem(index)}>Delete</button>  {/* Modified this line */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="additional-details" style={{ display: 'flex', justifyContent: 'space-between', marginTop: -20 }}>
                        <p style={{ fontSize: 13 }}><strong>Total Paybal Amount:</strong> {totalAmount}</p>
                        {/* <p style={{ fontSize: 13 }}><strong>Discount:</strong> {invoiceData.discount}</p> */}
                        <p style={{ fontSize: 13 }}><strong>Labor:</strong> {invoiceData.labor}</p>
                        {/* <p><strong>Tax:</strong> {invoiceData.tax}</p> */}
                        <p style={{ fontSize: 12 }}><strong>Total Paybal Amount:</strong> <strong style={{ fontSize: 15 }}>{invoiceData.billAmount}</strong></p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditPrintBill;
//  add this one to the database name village name and discription and mobilenumber