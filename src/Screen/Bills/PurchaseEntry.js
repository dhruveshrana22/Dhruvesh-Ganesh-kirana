import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating unique IDs
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "./NewBill.css";
import { addProduct } from '../../redux/ProductData/Peoductdata';
import { addInvoiceItem, deleteInvoiceItem, updateInvoiceItem } from '../../redux/Addinvoiceitem/Addinvoiceiemredux';
import { storeInvoiceData } from '../../redux/Addinvoiceitem/AddInvoiceBill_Redux';
import { useNavigate } from 'react-router-dom';
import { months } from 'moment';
import { addDELAREProduct } from '../../redux/AddDelerRedux/AdddelarProduct';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import firestore from '../../firebase';
import { toast } from 'react-toastify';
import useCheckLogin from '../../utils/CheckLogin';

const PurchaseEntry = () => {
    useCheckLogin();
    const navigate = useNavigate();
    // const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('dd/mm/yyyy'));
    const currentDate = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options); // 'en-GB' for dd/mm/yyyy format
    const [invoiceDate, setInvoiceDate] = useState(formattedDate);

    const initialInvoiceNumber = parseInt(localStorage.getItem('lastInvoiceNumber')) || 1;
    const [invoiceNumber, setInvoiceNumber] = useState(initialInvoiceNumber);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productPrices, setProductPrices] = useState('');
    const [productSalePrice, setProductSalePrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [discount, setDiscount] = useState('');
    const [labor, setLabor] = useState("");
    const [tax, setTax] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [MoNo, SetMoNo] = useState('');
    const [customerName, SetcustomerName] = useState('');
    const [BillAmount, SetBillAmount] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [printing, setPrinting] = useState(false); // State to track if bill is being printed
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [cgstTax, setCgstTax] = useState('');
    const [sgstTax, setSgstTax] = useState('');


    const item = useSelector(state => state.Item.Items) || [];
    const [dealers, setDealers] = useState([]);


    const fetchProducts = async () => {
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProducts(productsData);
    };
    useEffect(() => {

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const dealerCollection = collection(firestore, 'dealers');
            const snapshot = await getDocs(dealerCollection);
            const dealerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDealers(dealerData);
        };
        fetchData();
    }, []);



    // useEffect(() => {
    //     localStorage.setItem('lastInvoiceNumber', invoiceNumber.toString());
    // }, [invoiceNumber]);

    // // Function to increment invoice number
    // const incrementInvoiceNumber = () => {
    //     setInvoiceNumber(prevInvoiceNumber => prevInvoiceNumber + 1);
    // };
    let totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.amount), 0);

    const dispatch = useDispatch();
    const calculateTotalAmount = () => {
        let totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.amount), 0);

        // Add CGST and SGST
        let taxAmount = 0;
        if (!isNaN(parseFloat(cgstTax)) && !isNaN(parseFloat(sgstTax))) {
            const cgstAmount = (parseFloat(cgstTax) / 100) * totalAmount;
            const sgstAmount = (parseFloat(sgstTax) / 100) * totalAmount;
            taxAmount = cgstAmount + sgstAmount;
        }

        // Apply discount on the total amount
        let discountedAmount = totalAmount; // Start with the total amount
        if (discountType === 'percentage') {
            if (discount.trim().endsWith('%')) {
                const discountPercentage = parseFloat(discount.trim().slice(0, -1));
                if (!isNaN(discountPercentage)) {
                    const discountAmount = (discountPercentage / 100) * discountedAmount;
                    discountedAmount -= discountAmount; // Subtract discount amount
                }
            } else {
                const fixedDiscount = parseFloat(discount);
                if (!isNaN(fixedDiscount)) {
                    discountedAmount -= fixedDiscount; // Subtract fixed discount
                }
            }
        } else {
            const fixedDiscount = parseFloat(discount);
            if (!isNaN(fixedDiscount)) {
                discountedAmount -= fixedDiscount; // Subtract fixed discount
            }
        }

        // Add labor
        discountedAmount += parseFloat(labor) || 0;

        // Add regular tax
        discountedAmount += taxAmount;

        return Math.round(discountedAmount);
    };



    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleProductNameChange = (event) => {
        const productNameInput = event.target.value;
        setProductName(productNameInput);
        const selectedProduct = products.find(product => product.name === productNameInput);
        if (selectedProduct) {
            setProductPrices(selectedProduct.salePrice);
            setSelectedProduct(selectedProduct); // Set the selected product
        } else {
            setProductPrice('');
            setSelectedProduct(null); // Reset selected product if not found
        }
    };






    const handleQuantityChange = (event) => {
        const quantityInput = event.target.value;
        setQuantity(quantityInput);
        if (productPrice && !isNaN(quantityInput)) {
            setAmount(productPrice * quantityInput); // Update amount based on price and quantity
        } else {
            setAmount('');
        }
    };

    const productNameInputRef = useRef(null);

    // Inside addItem function
    const addItem = async () => {
        if (!productName || !productPrice || !productSalePrice || !quantity || !amount) {
            alert("Please fill in all fields");
            return;
        }

        const newItem = {
            name: productName,
            price: productPrice,
            salePrice: productSalePrice,
            quantity,
            amount
        };
        const newItem1 = {
            productName: productName,
            productPrice: productPrice,
            salePrice: productSalePrice,
            quantity,
            amount
        };
        const updatedItems = [...invoiceItems, newItem1];
        setInvoiceItems(updatedItems);


        try {
            const existingProduct = products.find(product => product.name === productName);
            if (existingProduct) {
                // Update existing product
                await updateProduct(existingProduct.id, newItem);
                toast.success(`Product updated: ${existingProduct.id}`);
            } else {
                // Add new product to Firestore
                const docRef = await addDoc(collection(firestore, 'products'), newItem);

            }

            // Reset input fields after adding/updating item
            setProductName('');
            setProductPrice('');
            setProductSalePrice('');
            setQuantity('');
            setAmount('');
        } catch (error) {
            console.error("Error adding/updating product:", error);
            // Handle error here
        }
        productNameInputRef.current.focus();
    };

    const updateProduct = async (productId, newData) => {
        try {
            const productDocRef = doc(collection(firestore, 'products'), productId);
            await setDoc(productDocRef, newData, { merge: true });
        } catch (error) {
            console.error("Error updating product:", error);
            // Handle error here
        }
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
    const updateItem = () => {
        if (editingIndex === null) {
            return;
        }
        const updatedItemdata = {
            productName,
            productPrice,
            quantity,
            amount
        };
        // dispatch(updateInvoiceItem(editingIndex, updatedItemdata));
        const updatedInvoiceItems = [...invoiceItems];
        updatedInvoiceItems[editingIndex] = updatedItemdata;
        setInvoiceItems(updatedInvoiceItems);
        setEditingIndex(null); // Reset editing index after update
        // Reset input fields after updating item
        setProductName('');
        setProductPrice('');
        setQuantity('');
        setAmount('');
    };
    // Function to delete an item
    const deleteItem = (indexToDelete) => {
        // Remove the item from invoiceItems array
        const updatedInvoiceItems = [...invoiceItems];
        updatedInvoiceItems.splice(indexToDelete, 1);
        setInvoiceItems(updatedInvoiceItems);
    };






    const selectedDealer = dealers.find(dealer => dealer.dealerName === customerName);

    const selectedDealerId = selectedDealer ? selectedDealer.id : null;


    const handleDebitClick = async () => {
        if (invoiceItems.length === 0) {
            alert('Cannot add data because invoice items are empty.');
            return; // Exit the function if invoice items are empty
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

        const confirmPrint = window.confirm('Do you want to print the bill?');
        if (confirmPrint) {

            setPrinting(true);

            if (window && window.print) {
                window.print();
            } else if (window && window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('print-to-pdf');
            } else {
                console.error('Printing not supported in this environment.');
            }
        }

        // Update invoices collection for the selected customer
        try {
            if (!selectedDealerId) {
                throw new Error('No Dealer selected');
            }
            const invoicesCollectionRef = collection(firestore, `dealers/${selectedDealerId}/invoices`);
            await addDoc(invoicesCollectionRef, invoiceData);


        } catch (error) {
            console.error('Error adding invoice data to Firestore:', error);
        }

        // Other necessary operations
        // incrementInvoiceNumber();
        setInvoiceNumber('')
        SetcustomerName('');
        SetMoNo('');
        setInvoiceItems([]);
        setDiscount('');
        setLabor('');
        setTax('');
        setProductName('');
        setProductPrice('');
        setQuantity('');
        setAmount('');
    };

    // const invoiceData = {
    //     invoiceDate: invoiceDate,
    //     invoiceNumber: invoiceNumber,
    //     invoiceItems: invoiceItems,
    //     discount: discount,
    //     labor: labor,
    //     tax: tax,
    //     productName: productName,
    //     productPrice: productPrice,
    //     quantity: quantity,
    //     amount: amount,
    //     billAmount: calculateTotalAmount(),
    //     customerName: customerName,
    //     MoNo: MoNo,

    // }
















    const handleCreditClick = () => {
        const confirmPrint = window.confirm('Do you want to print the bill?');
        if (confirmPrint) {

            setPrinting(true); // Set printing state to true

            // Check if the environment supports printing
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
        }
    };

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
    }

    // const handleCustomerSelect = (event) => {
    //     const selectedCustomerName = event.target.value;
    //     const selectedCustomer = customers.find(customer => customer.customerName === selectedCustomerName);
    //     if (selectedCustomer) {
    //         SetcustomerName(selectedCustomerName);
    //         SetMoNo(selectedCustomer.mobileNumber);
    //     }
    // };

    const handleCustomerNameChange = (event) => {
        const customerNameInput = event.target.value;
        SetcustomerName(customerNameInput);
        const selectedCustomer = dealers.find(customer => customer.dealerName === customerNameInput);
        if (selectedCustomer) {
            SetMoNo(selectedCustomer.mobileNumber);
        } else {
            SetMoNo('');
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


        <div id='Main' style={{ display: 'flex', flexWrap: 'wrap', }}>

            <div id="containerPurchase">
                <h2>Purchase Bill</h2>
                <button onClick={() => window.history.back()} className="goBackButton">
                    Go Back
                </button>
                <div style={{ backgroundColor: 'gray', alignItems: 'center', display: 'flex', flexDirection: 'column', right: 0 }}>
                    <label style={{ width: 'auto', color: "white" }} htmlFor="price">Purchase Price: {selectedProduct ? selectedProduct.price : ''}</label>
                    <label style={{ width: 'auto', color: "white" }} htmlFor="price">Sale Price: {productPrices}</label>
                </div>
                <form id="invoiceForm">
                    <div>
                        <label htmlFor="invoiceNumber">Bill Number:</label>
                        <input
                            type="text"
                            id="invoiceNumber"
                            name="invoiceNumber"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                        />
                        <label htmlFor="customerName">Dealer Name:</label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={customerName}
                            onChange={handleCustomerNameChange}
                            list="customerSuggestions"
                        />
                        <datalist id="customerSuggestions">
                            {dealers.map(customer => (
                                <option key={customer.id} value={customer.dealerName} data-mobile={customer.mobileNumber} />
                                //<option key={customer.id} value={`${customer.customerName}(${customer.mobileNumber})`} />  
                            ))}
                        </datalist>

                        <label htmlFor="MoNo">Mobile Number:</label>
                        <input
                            type="text"
                            id="MoNo"
                            name="MoNo"
                            value={MoNo}
                            onChange={handleMoNoChange}
                        />

                        <label htmlFor="invoiceDate">Date:</label>
                        <input
                            type="text"
                            id="invoiceDate"
                            name="invoiceDate"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="productName">Product Name:</label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            value={productName}
                            onChange={handleProductNameChange}
                            list="productSuggestions"
                            ref={productNameInputRef}
                        />
                        <datalist id="productSuggestions">
                            {products.map(product => (
                                <option key={product.id} value={product.name} />
                            ))}
                        </datalist>

                        <label htmlFor="price">Purchase Price:</label>
                        <input type="number" id="price" name="price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />


                        <label htmlFor="price">Sale Price:</label>
                        <input type="number" id="price" name="price" value={productSalePrice} onChange={(e) => setProductSalePrice(e.target.value)} />


                        <label htmlFor="quantity">Quantity (KG):</label>
                        <input type="number" id="quantity" name="quantity" value={quantity} onChange={handleQuantityChange} />
                        <label htmlFor="amount">Amount:</label>
                        <input type="number" id="amount" name="amount" value={amount} readOnly />
                    </div>
                    <div style={{ justifyContent: 'space-evenly', width: '100%', display: 'flex', padding: '20px' }}>
                        <button type="button" id="addItemButton" onClick={addItem}>
                            Add Item
                        </button>
                        <button type="button" id="updateItemButton" onClick={() => updateItem()}>
                            Update Item
                        </button>


                        {/* <button type="button" onClick={() => deleteItem(index)}>Delete</button> */}



                    </div>
                </form>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <button
                        style={{
                            backgroundColor: '#4CAF50', /* Green */
                            border: 'none',
                            color: 'white',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'inline-block',
                            fontSize: '16px',
                            cursor: 'pointer',
                        }}
                        onClick={addItem2}
                    >
                        Show Item
                    </button>
                    <span className="close" style={{ cursor: 'pointer', fontSize: '30px' }} onClick={() => setShowModal(false)}>
                        &times;
                    </span>
                </div>

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Invoice Items</h2>
                            <table id="invoiceItemsTable">
                                <thead>
                                    <tr>
                                        <th>SiNo</th>
                                        <th>Product Name</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {invoiceItems.map((item, index) => (
                                        <tr key={index} onDoubleClick={() => handleRowClick(index)}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.price}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: '20px' }}>
                    <label htmlFor="discount" >Discount:</label>
                    <input type="text" id="discount" style={{ width: "10%" }} name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />

                    <label htmlFor="labor" >Labor:</label>
                    <input type="number" id="labor" style={{ width: "10%" }} name="labor" value={labor} onChange={(e) => setLabor(e.target.value)} />



                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: '20px' }}>

                    <label htmlFor="cgstTax" >CGST (%):</label>
                    <input
                        style={{ width: "10%" }} type="number"
                        id="cgstTax"
                        name="cgstTax"
                        value={cgstTax}
                        onChange={(e) => setCgstTax(e.target.value)}
                    />

                    <label htmlFor="sgstTax" >SGST (%):</label>
                    <input
                        style={{ width: "10%" }} type="number"
                        id="sgstTax"
                        name="sgstTax"
                        value={sgstTax}
                        onChange={(e) => setSgstTax(e.target.value)}
                    />
                </div>



                <label htmlFor="TotalBillAmmount ">TotalBillAmmount:</label>
                <input
                    type="text"
                    style={{ fontWeight: 'bold', fontSize: 20 }}
                    value={calculateTotalAmount()}
                    readOnly
                    onChange={(e) => setTax(e.target.value)}
                />

                <br /><br />

                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <button type="button" id="creditButton" onClick={handleCreditClick}>
                        Credit
                    </button>
                    <button type="button" id="debitButton" onClick={handleDebitClick} >
                        Debit
                    </button>

                </div>


            </div>
            <div id="Container2" style={{}}>
                <div className="print-preview-container">
                    <div>

                    </div>

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
                    {/* <button onClick={handlePrint}>Print</button> */}
                    <div className="invoice-details" style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 15 }} >

                            <p style={{ fontSize: 15 }}><strong>Invoice Number:</strong> <strong>{invoiceData.invoiceNumber}</strong></p>
                            <p style={{ fontSize: 15 }}><strong>Date:</strong> {invoiceData.invoiceDate}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 15 }} >
                            <p style={{ fontSize: 15 }}><strong>Dealer Name:</strong> {invoiceData.customerName}</p>
                            <p style={{ fontSize: 15 }}><strong>MoNo:</strong> {invoiceData.MoNo}</p>
                            {/* <p><strong>Village Name:</strong> {customers.villageName}</p> */}

                        </div>
                    </div>
                    <div className="invoice-items">
                        {/* <h3 style={{ textAlign: 'center', fontSize: 15 }}>Items</h3> */}
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ fontSize: 12 }}>SiNo</th>
                                    <th style={{ fontSize: 12 }}>Product Name</th>
                                    <th style={{ fontSize: 12 }}>Price</th>
                                    <th style={{ fontSize: 12 }}>Qty</th>
                                    <th style={{ fontSize: 12 }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.invoiceItems.map((item, index) => (
                                    <tr key={index} onDoubleClick={() => handleRowClick(index)}>
                                        <td style={{ fontSize: 13 }}>{index + 1}</td>
                                        <td style={{ fontSize: 13 }}>{item.productName}</td>
                                        <td style={{ fontSize: 13 }}>{item.productPrice}</td>
                                        <td style={{ fontSize: 13 }}>{item.quantity}</td>
                                        <td style={{ fontSize: 13 }}>{item.amount}</td>
                                        <button type="button" style={{ backgroundColor: 'transparent', color: 'black' }} onClick={() => deleteItem(index)}>Delete</button>  {/* Modified this line */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="additional-details" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 13 }}><strong>Total Paybal Amount:</strong> {totalAmount}</p>
                        <p style={{ fontSize: 13 }}><strong>Discount:</strong> {invoiceData.discount}</p>
                        <p style={{ fontSize: 13 }}><strong>Labor:</strong> {invoiceData.labor}</p>
                        {/* <p><strong>Tax:</strong> {invoiceData.tax}</p> */}
                        <p style={{ fontSize: 13 }}><strong>Total Paybal Amount:</strong> {invoiceData.billAmount}</p>
                    </div>
                </div>
            </div>


        </div>
    );
};


export default PurchaseEntry;