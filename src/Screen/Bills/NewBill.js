import { v4 as uuidv4 } from "uuid"; // Import uuidv4 for generating unique IDs
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./NewBill.css";
import { addProduct } from "../../redux/ProductData/Peoductdata";
import {
  addInvoiceItem,
  deleteInvoiceItem,
  updateInvoiceItem,
} from "../../redux/Addinvoiceitem/Addinvoiceiemredux";
import { storeInvoiceData } from "../../redux/Addinvoiceitem/AddInvoiceBill_Redux";
import { useNavigate } from "react-router-dom";
import { months } from "moment";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import firestore from "../../firebase";
import useCheckLogin from "../../utils/CheckLogin";
import { Flex, Input, Radio } from "antd";
import HeaderCompo from "../Componants/Header";
import Grid from "antd/es/card/Grid";
import { inputstyle, inputstyleNewBill } from "../../utils/Theam";
import axios from "axios";

const InvoiceInput = () => {
  useCheckLogin();
  const navigate = useNavigate();
  // const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('dd/mm/yyyy'));
  const currentDate = new Date();
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-GB", options); // 'en-GB' for dd/mm/yyyy format
  const [invoiceDate, setInvoiceDate] = useState(formattedDate);
  const fetchInvoiceNumber = async () => {
    try {
      const lastInvoiceNumber = await fetchLastInvoiceNumber();
      // Set the initial invoice number to the next number or 1 if no previous number exists
      setInvoiceNumber(lastInvoiceNumber);
      return lastInvoiceNumber;
    } catch (error) {
      console.error("Error fetching last invoice number:", error);
    }
  };
  useEffect(() => {
    fetchInvoiceNumber();
  }, []);
  const initialInvoiceNumber =
    parseInt(localStorage.getItem("lastInvoiceNumber")) || 1;
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    fetchInvoiceNumber();
  });

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [discount, setDiscount] = useState("");
  const [labor, setLabor] = useState("");
  const [tax, setTax] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [MoNo, SetMoNo] = useState("");
  const [customerName, SetcustomerName] = useState("");
  const [BillAmount, SetBillAmount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [printing, setPrinting] = useState(false); // State to track if bill is being printed
  const [showModal, setShowModal] = useState(false);
  const item = useSelector((state) => state.Item.Items) || [];
  const [transactionType, setTransactionType] = useState("Debit");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const delsrproducts =
    useSelector((state) => state.productDataDlareReducer.delerproducts) || [];

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  // Function to fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch products data from your backend API
      const response = await fetch(
        "http://localhost:5000/api/products/products"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productsData = await response.json();

      // Assuming productsData is an array of product objects
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customers/allCustomer"
      );
      const customersData = response.data; // Assuming response.data contains the customers array

      // Process each customer
      const processedCustomers = await Promise.all(
        customersData.map(async (customer) => {
          // Assuming each customer object includes an array of invoices
          const customerData = {
            id: customer.id,
            ...customer,
            invoices: customer.invoices || [], // Ensure invoices is an array
          };

          return customerData;
        })
      );

      setCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Handle the error appropriately in your application
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch data
        await fetchProducts();
        await fetchCustomers();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchLastInvoiceNumber();
  }, []);

  const fetchLastInvoiceNumber = async () => {
    try {
      const invoiceNumbersCollection = collection(firestore, "invoiceNumbers");
      const snapshot = await getDocs(invoiceNumbersCollection);
      if (!snapshot.empty) {
        // Get the last document which holds the last invoice number
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        const lastInvoiceNumber = lastDoc.data().number;
        return lastInvoiceNumber;
      } else {
        // If no document found, return null
        return null;
      }
    } catch (error) {
      console.error("Error fetching last invoice number:", error);
      // If there's an error, return null
      return null;
    }
  };

  const incrementInvoiceNumber = async () => {
    try {
      const newInvoiceNumber = invoiceNumber + 1;
      const invoiceNumbersCollection = collection(firestore, "invoiceNumbers");
      const querySnapshot = await getDocs(invoiceNumbersCollection);

      if (!querySnapshot.empty) {
        // If the collection already has documents, get the first document
        const docRef = querySnapshot.docs[0].ref;
        // Update the existing document with the new invoice number
        await setDoc(docRef, { number: newInvoiceNumber });
      } else {
        // If the collection is empty, add a new document with the new invoice number
        await addDoc(invoiceNumbersCollection, { number: newInvoiceNumber });
      }

      // Update the local state with the new invoice number
      setInvoiceNumber(newInvoiceNumber);
    } catch (error) {
      console.error("Error incrementing invoice number:", error);
    }
  };

  let totalAmount = invoiceItems.reduce(
    (total, item) => total + parseFloat(item.amount),
    0
  );

  const dispatch = useDispatch();
  const calculateTotalAmount = () => {
    let totalAmount = invoiceItems.reduce(
      (total, item) => total + parseFloat(item.amount),
      0
    );

    // Apply discount
    if (discountType === "percentage") {
      if (discount.trim().endsWith("%")) {
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

  const handleProductSelect = (event) => {
    const selectedProductName = event.target.value;
    const selectedProduct = products.find(
      (product) => product.name === selectedProductName
    );
    if (selectedProduct) {
      setProductName(selectedProductName);
      setProductPrice(selectedProduct.salePrice);
    }
  };
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleProductNameChange = (event) => {
    const productNameInput = event.target.value;
    setProductName(productNameInput);
    const selectedProduct = products.find(
      (product) => product.name === productNameInput
    );
    if (selectedProduct) {
      setProductPrice(selectedProduct.salePrice);
      setSelectedProduct(selectedProduct); // Set the selected product
    } else {
      setProductPrice("");
      setSelectedProduct(null); // Reset selected product if not found
    }
  };

  const purchasePrice = selectedProduct ? selectedProduct.price : 0;
  const profit = (productPrice - purchasePrice) * quantity;
  const handleQuantityChange = (event) => {
    const quantityInput = event.target.value;
    setQuantity(quantityInput);
    if (productPrice && !isNaN(quantityInput)) {
      setAmount(productPrice * quantityInput); // Update amount based on price and quantity
    } else {
      setAmount("");
    }
  };
  const productNameInputRef = useRef(null);

  const addItem = () => {
    if (!productName || !productPrice || !quantity || !amount) {
      alert("Please fill in all fields");
      return;
    }

    const newItem = {
      id: uuidv4(), // Generate a unique ID for the new item
      productName,
      productPrice,
      quantity,
      amount,
      profit,
    };

    const existingProduct = products.find(
      (product) => product.name === productName
    );

    if (!existingProduct) {
      const addNewProduct = {
        name: productName,
        price: productPrice,
      };

      // Dispatch addProduct action to add the new product
      dispatch(addProduct(addNewProduct));
    }

    // Dispatch addInvoiceItem action to add the new item to invoiceItems array
    setInvoiceItems([...invoiceItems, newItem]);

    // Reset input fields after adding item
    setProductName("");
    setProductPrice("");
    setQuantity("");
    setAmount("");
    productNameInputRef.current.focus();
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
      amount,
    };
    // dispatch(updateInvoiceItem(editingIndex, updatedItemdata));
    const updatedInvoiceItems = [...invoiceItems];
    updatedInvoiceItems[editingIndex] = updatedItemdata;
    setInvoiceItems(updatedInvoiceItems);
    setEditingIndex(null); // Reset editing index after update
    // Reset input fields after updating item
    setProductName("");
    setProductPrice("");
    setQuantity("");
    setAmount("");
  };
  // Function to delete an item
  const deleteItem = (indexToDelete) => {
    // Remove the item from invoiceItems array
    const updatedInvoiceItems = [...invoiceItems];
    updatedInvoiceItems.splice(indexToDelete, 1);
    setInvoiceItems(updatedInvoiceItems);
  };

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // Update handleCustomerNameChange function to set the selected customer's ID
  const handleCustomerNameChange = (event) => {
    const customerNameInput = event.target.value;
    SetcustomerName(customerNameInput);
    const selectedCustomer = customers.find(
      (customer) => customer.customerName === customerNameInput
    );
    let totalProfit = 0;
    invoiceItems.forEach((item) => {
      totalProfit += item.profit;
    });
    if (selectedCustomer) {
      SetMoNo(selectedCustomer.mobileNumber);
      setSelectedCustomerId(selectedCustomer.id); // Set the selected customer's ID
    } else {
      SetMoNo("");
      setSelectedCustomerId(""); // Reset the selected customer's ID if not found
    }
  };

  const handleDebitClick = async () => {
    if (invoiceItems.length === 0) {
      alert("Cannot add data because invoice items are empty.");
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
      MoNo: MoNo,
      memo: transactionType,
      totalProfit: totalProfit,
    };

    const confirmPrint = window.confirm("Do you want to print the bill?");
    if (confirmPrint) {
      setPrinting(true);

      if (window && window.print) {
        window.print();
      } else if (window && window.require) {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("print-to-pdf");
      } else {
        console.error("Printing not supported in this environment.");
      }
    }

    // Update invoices collection for the selected customer
    try {
      // setLoading(true);
      // if (!selectedCustomerId) {
      //   throw new Error("No customer selected");
      // }
      // const invoicesCollectionRef = collection(
      //   firestore,
      //   `customers/${selectedCustomerId}/invoices`
      // );
      // await addDoc(invoicesCollectionRef, invoiceData);
      const success = await saveInvoiceDataToMongoDB(invoiceData);
      if (success) {
        alert("Invoice saved successfully!");
        // Perform additional actions like resetting state or redirecting
      } else {
        alert("Failed to save invoice.");
      }
    } catch (error) {
      console.error("Error adding invoice data to Firestore:", error);
    } finally {
      setLoading(false);
    }

    // Other necessary operations
    incrementInvoiceNumber();
    SetcustomerName("");
    SetMoNo("");
    setInvoiceItems([]);
    setDiscount("");
    setLabor("");
    setTax("");
    setProductName("");
    setProductPrice("");
    setQuantity("");
    setAmount("");
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
  };

  async function saveInvoiceDataToMongoDB(invoiceData) {
    try {
      // Send a POST request to the server's endpoint
      const response = await fetch(
        "http://localhost:5000/api/customers/saveInvoice",
        {
          method: "POST", // HTTP POST method
          headers: {
            "Content-Type": "application/json", // Specify JSON content type
          },
          body: JSON.stringify(invoiceData), // Convert invoiceData to JSON string and include it in the request body
        }
      );

      // Check if the request was successful (status code 200-299)
      if (response.ok) {
        return true; // Return true to indicate success
      } else {
        // If the request was not successful, throw an error
        throw new Error("Failed to save invoice data");
      }
    } catch (error) {
      console.error("Error saving invoice data:", error.message);
      return false; // Return false to indicate failure
    }
  }

  const handleCreditClick = async () => {
    let totalProfit = 0;
    invoiceItems.forEach((item) => {
      totalProfit += item.profit;
    });
    const confirmPrint = window.confirm("Do you want to print the bill?");
    if (confirmPrint) {
      setPrinting(true); // Set printing state to true

      // Check if the environment supports printing
      if (window && window.print) {
        // If running in a browser
        window.print(); // Open the browser print dialog
      } else if (window && window.require) {
        // If running in Electron
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("print-to-pdf"); // Send a message to main process to print to PDF
      } else {
        console.error("Printing not supported in this environment.");
      }
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
      MoNo: MoNo,
      memo: transactionType,
      totalProfit: totalProfit,
    };
    // try {
    //   setLoading(true);
    //   // Create a reference to the "Creditdata" collection
    //   const creditDataCollection = collection(firestore, "Creditdata");

    //   // Add the invoiceData object to the "Creditdata" collection
    //   await addDoc(creditDataCollection, invoiceData);

    //   // Other necessary operations
    //   incrementInvoiceNumber();
    //   SetcustomerName("");
    //   SetMoNo("");
    //   setInvoiceItems([]);
    //   setDiscount("");
    //   setLabor("");
    //   setTax("");
    //   setProductName("");
    //   setProductPrice("");
    //   setQuantity("");
    //   setAmount("");
    // } catch (error) {
    //   console.error("Error adding invoice data to Firestore:", error);
    // }
    // const success = await saveInvoiceDataToMongoDB(invoiceData);
    // if (success) {
    //   alert("Invoice saved successfully!");
    //   // Perform additional actions like resetting state or redirecting
    // } else {
    //   alert("Failed to save invoice.");
    // }

    // finally {
    //   setLoading(false);
    // }
  };

  const generatePrintableBill = () => {
    setPrinting(true); // Set printing state to true when bill is being printed
    if (window && window.print) {
      // If running in a browser
      window.print(); // Open the browser print dialog
    } else if (window && window.require) {
      // If running in Electron
      const { ipcRenderer } = window.require("electron");
      ipcRenderer.send("print-to-pdf"); // Send a message to main process to print to PDF
    } else {
      console.error("Printing not supported in this environment.");
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
  const handleTransactionTypeChange = (event) => {
    const selectedType = event.target.value;
    setTransactionType(selectedType);
  };
  let totalProfit = 0;

  return (
    <Flex style={{ justifyContent: "space-around", flexWrap: "wrap", gap: 10 }}>
      {isLoading ? (
        <h1>Loading......</h1> // Replace 'Loader' with your loader component
      ) : (
        <>
          <Grid id="container">
            <Flex justify="space-around">
              <HeaderCompo title={"Invoice Input"} />
              <Flex style={{ alignItems: "center" }}>
                <Radio.Group
                  onChange={handleTransactionTypeChange}
                  optionType="button"
                  buttonStyle="solid"
                  value={transactionType}
                >
                  <Radio value="Cash">Cash</Radio>
                  <Radio value="Debit">Debit</Radio>
                </Radio.Group>
              </Flex>
            </Flex>
            <Grid style={{ padding: 10 }}>
              <Grid style={{ alignItems: "center" }}>
                <Grid>
                  <Flex
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Invoice Number:
                    <Input
                      style={{ width: inputstyleNewBill }}
                      type="text"
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={invoiceNumber}
                      readOnly
                    />
                  </Flex>
                  <Flex
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Customer Name:
                    <Input
                      style={{ width: inputstyleNewBill }}
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={customerName}
                      onChange={handleCustomerNameChange}
                      list="customerSuggestions"
                    />
                    <datalist id="customerSuggestions">
                      {customers.map((customer) => (
                        <option
                          key={customer.id}
                          value={customer.customerName}
                          data-mobile={customer.mobileNumber}
                        />
                        //<option key={customer.id} value={`${customer.customerName}(${customer.mobileNumber})`} />
                      ))}
                    </datalist>
                  </Flex>
                </Grid>
                <Flex
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Mobile Number:
                  <Input
                    style={{ width: inputstyleNewBill }}
                    type="text"
                    id="MoNo"
                    name="MoNo"
                    value={MoNo}
                    onChange={handleMoNoChange}
                  />
                </Flex>
                <Flex
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Date:
                  <Input
                    style={{ width: inputstyleNewBill }}
                    type="text"
                    id="invoiceDate"
                    name="invoiceDate"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </Flex>
              </Grid>
              <Flex vertical style={{ justifyContent: "space-between" }}>
                <Grid
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  Product Name:
                  <Input
                    style={{ width: inputstyle }}
                    type="text"
                    id="productName"
                    name="productName"
                    value={productName}
                    onChange={handleProductNameChange}
                    list="productSuggestions"
                    ref={productNameInputRef}
                  />
                  <datalist id="productSuggestions">
                    {products.map((product) => (
                      <option key={product.id} value={product.name} />
                    ))}
                  </datalist>
                  Sale Price:
                  <Input
                    style={{ width: inputstyle }}
                    type="number"
                    id="price"
                    name="price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                  <label style={{ width: "auto" }} htmlFor="price">
                    Purchase Price:{" "}
                    {selectedProduct ? selectedProduct.price : ""}
                  </label>
                </Grid>
              </Flex>
              <Flex>
                Quantity (KG):
                <Input
                  style={{ width: inputstyle }}
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                Amount:
                <Input
                  style={{ width: 150 }}
                  type="number"
                  id="amount"
                  name="amount"
                  value={amount}
                  readOnly
                />
              </Flex>
              <Flex style={{ justifyContent: "center" }}>Profit: {profit}</Flex>
              <Flex
                style={{
                  justifyContent: "space-evenly",
                }}
              >
                <button type="button" id="addItemButton" onClick={addItem}>
                  Add Item
                </button>
                <button
                  type="button"
                  id="updateItemButton"
                  onClick={() => updateItem()}
                >
                  Update Item
                </button>

                {/* <button type="button" onClick={() => deleteItem(index)}>Delete</button> */}
              </Flex>
            </Grid>
            <Flex style={{ justifyContent: "space-around" }}>
              <button
                style={{
                  backgroundColor: "#4CAF50" /* Green */,
                  border: "none",
                  color: "white",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "inline-block",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={addItem2}
              >
                Show Item
              </button>
              <span
                className="close"
                style={{ cursor: "pointer", fontSize: "30px" }}
                onClick={() => setShowModal(false)}
              >
                &times;
              </span>
            </Flex>

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
                        <th>Qty/(KG)</th>
                        <th>Amount</th>
                        <th>Profit Of item</th>
                      </tr>
                    </thead>
                    <tbody style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {invoiceItems.map((item, index) => {
                        totalProfit += item.profit; // Add profit of each item to the total
                        return (
                          <tr
                            key={index}
                            onDoubleClick={() => handleRowClick(index)}
                          >
                            <td>{index + 1}</td>
                            <td>{item.productName}</td>
                            <td>{item.productPrice}</td>
                            <td>{item.quantity}(KG)</td>
                            <td>{item.amount}</td>
                            <td>{item.profit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* <label htmlFor="discount">Discount:</label>
                <Input type="text" id="discount" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} /> */}
            <Flex justify="space-around">
              <Flex
                vertical
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                Labor:
                <Input
                  style={{ width: 150 }}
                  type="number"
                  id="labor"
                  name="labor"
                  value={labor}
                  onChange={(e) => setLabor(e.target.value)}
                />
              </Flex>
              {/* 
                 <label htmlFor="tax" style={{ width: '30px' }}>Tax (%):</label>
                  <Input type="number" id="tax" name="tax" value={tax} onChange={(e) => setTax(e.target.value)} /> */}

              <Flex
                vertical
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                TotalBillAmmount:
                <Input
                  style={{ width: 150 }}
                  type="text"
                  value={calculateTotalAmount()}
                  readOnly
                  onChange={(e) => setTax(e.target.value)}
                />
              </Flex>
            </Flex>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              Total Profit: {totalProfit}
            </div>

            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              {/* Radio button for selecting transaction type */}
              <button
                type="button"
                id="creditButton"
                onClick={handleCreditClick}
                disabled={transactionType === "Debit" || loading} // Disable button when loading
                style={{
                  backgroundColor:
                    transactionType === "Debit" ? "transparent" : "green",
                }}
              >
                {loading ? "Loading..." : "Credit"}{" "}
                {/* Show "Loading..." text when loading */}
              </button>
              <button
                type="button"
                id="debitButton"
                onClick={handleDebitClick}
                disabled={transactionType === "Cash" || loading} // Disable button when loading
                style={{
                  backgroundColor:
                    transactionType === "Cash" ? "transparent" : "green",
                }}
              >
                {loading ? "Loading..." : "Debit"}{" "}
                {/* Show "Loading..." text when loading */}
              </button>
            </div>
          </Grid>
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

              <div
                className="invoice-details"
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  marginTop: -10,
                  marginBottom: -10,
                }}
              >
                <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                  <p style={{ fontSize: 13 }}>
                    <strong>Invoice Number:</strong>{" "}
                    <strong>{invoiceData.invoiceNumber}</strong>
                  </p>
                  <p style={{ fontSize: 13 }}>
                    <strong>Date:</strong> {invoiceData.invoiceDate}
                  </p>
                  <h5>{transactionType}: memo</h5>
                </div>
                <div style={{ display: "flex", gap: 15 }}>
                  <p style={{ fontSize: 13 }}>
                    <strong>Customer Name:</strong> {invoiceData.customerName}
                  </p>
                  <p style={{ fontSize: 13 }}>
                    <strong>MoNo:</strong> {invoiceData.MoNo}
                  </p>
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
                      <th style={{ fontSize: 12 }}>Qty (KG)</th>
                      <th style={{ fontSize: 12 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.invoiceItems.map((item, index) => (
                      <tr
                        key={index}
                        onDoubleClick={() => handleRowClick(index)}
                      >
                        <td style={{ fontSize: 13 }}>{index + 1}</td>
                        <td style={{ fontSize: 13 }}>{item.productName}</td>
                        <td style={{ fontSize: 13 }}>{item.productPrice}</td>
                        <td style={{ fontSize: 13 }}>{item.quantity} </td>
                        <td style={{ fontSize: 13 }}>{item.amount}</td>
                        <button
                          type="button"
                          style={{
                            backgroundColor: "transparent",
                            color: "black",
                          }}
                          onClick={() => deleteItem(index)}
                        >
                          Delete
                        </button>{" "}
                        {/* Modified this line */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className="additional-details"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p style={{ fontSize: 12 }}>
                  <strong>Total Paybal Amount:</strong> {totalAmount}
                </p>
                {/* <p style={{ fontSize: 12 }}><strong>Discount:</strong> {invoiceData.discount}</p> */}
                <p style={{ fontSize: 12 }}>
                  <strong>Labor:</strong> {invoiceData.labor}
                </p>
                {/* <p><strong>Tax:</strong> {invoiceData.tax}</p> */}
                <p style={{ fontSize: 12 }}>
                  <strong>Total Paybal Amount:</strong>{" "}
                  <strong style={{ fontSize: 15 }}>
                    {invoiceData.billAmount}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Flex>
  );
};

export default InvoiceInput;
