import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Input, DatePicker, Table, Select, Divider, Spin, Popconfirm, Col, Flex, Typography } from 'antd';
import { styles } from './ViewBillsStyles'; // Importing styles
import moment from 'moment';
import { useHistory, useNavigate } from 'react-router-dom';
import YourModalComponent from '../Componants/Modalcompo';
import './PrintPriview.css'
import firestore from '../../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import HeaderCompo from '../Componants/Header';
import Grid from 'antd/es/card/Grid';
const { Option } = Select;

const PurchaseViewBills = () => {
    const CreditBillReducer = useSelector(state => state.CreditBillReducer.bills);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [billNo, setBillNo] = useState('');
    const [totalBillAmount, setTotalBillAmount] = useState(0);
    const [totalBills, setTotalBills] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedBillNo, setSelectedBillNo] = useState('');
    const [selectedPerson, setSelectedPerson] = useState('');
    const [creditData, setCreditData] = useState([]);
    const [debitData, setDebitData] = useState([]);
    const [updatedBillAmounts, setUpdatedBillAmounts] = useState({});
    const [description, setDescription] = useState("");


    const [amount, setAmount] = useState([]);
    console.log("🚀 ~ PurchaseViewBills ~ amount:", amount)
    const [invoicedata, setInvoices] = useState([]);

    const [subtractionValue, setSubtractionValue] = useState(0);
    const [Vatav, setVatav] = useState(0);
    const [loadingData, setLoadingData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [manuallyEnteredAmount, setManuallyEnteredAmount] = useState('');
    const [newRecivedAmount, setNewRecivedAmount] = useState('');
    const [remainingCreditAmount, setRemainingCreditAmount] = useState(0);
    const [VatavAmt, setVatavAmt] = useState(0);
    const [totalamounts, setTotalamount] = useState(0);




    const filteredCreditData = selectedPerson
        ? amount.filter(item => item.customerId === selectedPerson.id)
        : [];


    const totalReceivedAmount = () => {
        // Assuming filteredCreditData is an array of objects
        return filteredCreditData.reduce((total, obj) => total + obj.RecivedAmount, 0);
    }

    // Example usage:
    const totalRecivedAmt = totalReceivedAmount();

    useEffect(() => {
        // Calculate total amount when filteredData changes
        const totalamount = filteredData.reduce((total, item) => total + parseFloat(item.billAmount || 0), 0).toFixed(2);
        setTotalamount(totalamount);
    }, [filteredData]);

    useEffect(() => {
        // Update remaining credit amount when either totalamounts or totalRecivedAmt changes
        setRemainingCreditAmount(parseFloat(totalamounts) - parseFloat(totalRecivedAmt));
    }, [totalamounts, totalRecivedAmt]);


    //useEffect
    useEffect(() => {


        fetchInvoices();
        fetchAmount();
    }, []);


    const fetchInvoices = async () => {
        setLoadingData(true);
        const customersCollection = collection(firestore, 'dealers');
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

        setInvoices(customersData);
        setLoadingData(false); // Corrected to setLoadingData
    };


    const fetchAmount = async () => {
        setLoadingData(true);
        const customersCollection = collection(firestore, 'dealers');

        const customersSnapshot = await getDocs(customersCollection);
        const newAmountData = []; // Create a new array to hold the updated data

        // Initialize an array to store listener unsubscribe functions
        const unsubscribeFunctions = [];

        // Iterate through each customer document
        customersSnapshot.forEach(doc => {
            // Fetch the invoices collection for this customer and listen for real-time updates
            const invoicesCollectionRef = collection(doc.ref, 'amount');
            const unsubscribe = onSnapshot(invoicesCollectionRef, (querySnapshot) => {
                const customerAmountData = [];

                // Map each invoice document to its data and push to the customerAmountData array
                querySnapshot.forEach(invoiceDoc => {
                    customerAmountData.push({
                        customerId: doc.id, // Include the customerId for reference
                        invoiceId: invoiceDoc.id,
                        ...invoiceDoc.data()
                    });
                });

                // Filter out existing data from newAmountData to prevent duplicates
                const filteredNewAmountData = newAmountData.filter(
                    data => !customerAmountData.some(newData => newData.invoiceId === data.invoiceId)
                );

                // Add the new data to filteredNewAmountData
                filteredNewAmountData.push(...customerAmountData);

                // Update the newAmountData with the filtered data
                newAmountData.splice(0, newAmountData.length, ...filteredNewAmountData);

                // Set the state with the updated newAmountData
                setAmount([...newAmountData]); // Make sure to spread the array to create a new reference
                setLoadingData(false)
            });

            // Add the unsubscribe function to the array
            unsubscribeFunctions.push(unsubscribe);
        });

        // Store the unsubscribe functions in a useEffect cleanup function to unsubscribe when the component unmounts
        return () => {
            unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        };
    };





    useEffect(() => {
        calculateTotals();
        setFilteredData(invoicedata);
        filterCreditAndDebitData(); // Initialize filteredData with all data initially
    }, [invoicedata]);

    useEffect(() => {
        filterCreditAndDebitData(); // Update credit and debit data when selected person changes
    }, [selectedPerson]);

    const filterCreditAndDebitData = () => {
        // Check if selectedPerson is a string before calling toLowerCase
        const selectedPersonString = typeof selectedPerson === 'string' ? selectedPerson.toLowerCase() : [];

        // Filter credit data for the selected person if it exists and is a string
        const filteredCreditData = selectedPersonString
            ? CreditBillReducer.filter(item => item.invoiceNumber === selectedPersonString)
            : [];

        // Filtered debit data based on matching invoiceNumber
        const filteredDebitData = selectedPersonString
            ? CreditBillReducer.filter(item => item.invoiceNumber === selectedPersonString)
            : [];

        // Update credit and debit data
        setCreditData(filteredCreditData);
        setDebitData(filteredDebitData);

        // Update bill amounts after deducting received amounts
        const updatedBillAmountsObj = {};
        invoicedata.forEach(bill => {
            const creditBill = filteredCreditData.find(item => item.invoiceNumber === bill.invoiceNumber);
            if (creditBill) {
                const updatedAmount = parseFloat(bill.billAmount) - parseFloat(creditBill.RicevedAmt || 0);
                updatedBillAmountsObj[bill.invoiceNumber] = updatedAmount.toFixed(2);
            }
        });
        setUpdatedBillAmounts(updatedBillAmountsObj);
    };


    const calculateTotals = () => {
        // Check if invoicedata is an array and not empty
        if (!Array.isArray(invoicedata) || invoicedata.length === 0) {
            console.error("invoicedata is not an array or is empty:", invoicedata);
            return;
        }

        let totalAmount = 0;
        let numberOfBills = 0;

        // Filter invoicedata based on the selected person if it's defined
        const filteredInvoices = !selectedPerson
            ? invoicedata.filter(customer => {
                // Check if customer matches the selected person (case-insensitive)
                return customer && customer.dealerName && selectedPerson && typeof selectedPerson === 'string' && customer.dealerName.toLowerCase() === selectedPerson.toLowerCase();


            })
            : invoicedata;

        // Iterate through each invoice of the selected person
        filteredInvoices.forEach(customer => {
            if (customer.invoices && Array.isArray(customer.invoices)) {
                customer.invoices.forEach(invoice => {
                    // Add the bill amount of each invoice to the totalAmount
                    totalAmount += parseFloat(invoice.billAmount || 0);
                    numberOfBills++; // Increment the count of bills
                });
            }
        });

        setTotalBillAmount(totalAmount.toFixed(2)); // Keep two decimal places
        setTotalBills(numberOfBills);
    };



    const handleViewBills = () => {
        // Filtering logic can be implemented here if needed
    };

    const handleDeleteBill = () => {
        // Logic to handle deleting a bill
    };

    const handleBack = () => {
        window.history.back()
    };



    const handleSearch = (customerId) => {
        // Find the customer data based on the selected customer ID
        const customerData = invoicedata.find(customer => customer.id === customerId);


        if (customerData) {
            setSelectedCustomer(customerId); // Update selected customer
            setSelectedCustomerId(customerId); // Update selected customer

            // setSelectedCustomer(customerData.customerName);
            setSelectedPerson(customerData) // Update selected customer
            // Update selected customer
            // Update filtered data with the customer's invoices
            // console.log('Selected Person Invoices IDs:', customerData.invoices.map(invoice => invoice.id));
            setFilteredData(customerData.invoices);
        } else {
            setSelectedCustomer(null); // Clear selected customer if not found
            setFilteredData([]); // Clear filtered data if customer not found
        }
    };




    const handleRowClick = (record) => {
        setSelectedBillNo(record.invoiceNumber); // Set the selected bill number when a row is clicked
    };

    const navigate = useNavigate();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleRowDoubleClick = (record) => {
        const recordId = record.id;

        setSelectedRecord(record);
        navigate('/PurchaseUpdateBill', { state: { recordData: record, customerID: selectedCustomerId, recordId }, onUpdate: handleUpdateInvoice(), onDelete: handleDeleteInvoiceBill });
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const calculateTotalSale = () => {
        if (!selectedPerson) return 0; // If no person is selected, return 0

        // Filter bills based on the selected person's name
        const personBills = invoicedata.filter(item => item.customerName.toLowerCase() === selectedPerson === 'string' ? selectedPerson.toLowerCase() : []);

        // Calculate the total bill amount for the selected person
        const totalSale = personBills.reduce((total, bill) => total + parseFloat(bill.billAmount || 0), 0);

        return totalSale.toFixed(2); // Keep two decimal places
    };


    const columns = [

        {
            title: 'Bill No',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
        },
        {
            title: 'Bill Date',
            dataIndex: 'invoiceDate',
            key: 'invoiceDate',
        },

        {
            title: 'Total Ammount',
            dataIndex: 'billAmount',
            key: 'billAmount',

        },

        // {
        //     title: 'Customer Name',
        //     dataIndex: 'customerName',
        //     key: 'customerName',
        // },
        {
            title: 'Mobile No',
            dataIndex: 'MoNo',
            key: 'MoNo',
        },

    ];

    // const totalamounts = filteredData.reduce((total, item) => total + parseFloat(item.billAmount || 0), 0).toFixed(2)

    const dataSourceWithTotal = [
        ...(Array.isArray(filteredData) ? filteredData : []),
        {
            invoiceNumber: 'Total',
            billAmount: totalamounts,
        },
    ];




    const handleManualAmountChange = (e) => {
        setManuallyEnteredAmount(e.target.value);
    };

    const updateData = async (customerId, invoiceId, newRecivedAmount) => {
        try {
            const invoiceRef = doc(firestore, 'customers', customerId, 'amount', invoiceId);
            await updateDoc(invoiceRef, {
                RecivedAmount: newRecivedAmount
            });

        } catch (error) {
            console.error('Error updating data:', error);
        }
    };



    const handleDeleteCredit = async (customerId, invoiceId) => {
        try {
            const invoiceRef = doc(firestore, 'dealers', customerId, 'amount', invoiceId);
            await deleteDoc(invoiceRef);

            fetchAmount()

        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };


    // Function to handle change in the newRecivedAmount value
    const handleRecivedAmountChange = (record, value) => {
        // Update the newRecivedAmount value in the record
        setCreditData(prevData => prevData.map(item => {
            if (item.invoiceId === record.invoiceId) {
                return {
                    ...item,
                    newRecivedAmount: value
                };
            }
            return item;
        }));

        // Update the newRecivedAmount state
        setNewRecivedAmount(value);
    };








    // const filteredCreditData = invoicedata.filter(item => item.customerName.toLowerCase() === selectedPerson.toLowerCase());

    const calculateTotalCreditAmount = () => {
        // Sum up the RicevedAmt from the CreditBillReducer data
        const totalCreditAmount = filteredCreditData.reduce((total, item) => total + parseFloat(item.RicevedAmt || 0), 0);
        return totalCreditAmount.toFixed(2); // Keep two decimal places
    };



    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const calculatedTotalAmount = (parseFloat(totalBillAmount) - parseFloat(manuallyEnteredAmount)).toFixed(2);
        setTotalAmount(calculatedTotalAmount);
    }, [totalBillAmount, manuallyEnteredAmount]);

    const uniqueCustomers = Array.isArray(invoicedata) ? invoicedata.reduce((acc, curr) => {
        // Check if the current customer's name exists in the accumulator
        const existingCustomer = acc.find(item => item.dealerName === curr.dealerName);

        // Check if the current customer's mobile number exists in the accumulator
        const existingMobileNumber = acc.find(item => item.mobileNumber === curr.mobileNumber);

        // If either customer name or mobile number is not found in the accumulator, add the current customer to the accumulator
        if (!existingCustomer || !existingMobileNumber) {
            acc.push(curr);
        }

        return acc;
    }, []) : [];

    // console.log("🚀 ~ uniqueCustomers ~ uniqueCustomers:", uniqueCustomers)




    const handlePrint = () => {
        window.print();
    };

    // the subtraction of the totalAmount - Recived Amount

    // Assuming you have a function to handle the subtraction value change
    const handleSubtractionChange = (event) => {
        const newValue = event.target.value.trim() === '' ? 0 : parseFloat(event.target.value);
        // Check if the entered value exceeds the remaining credit amount
        if (newValue > remainingCreditAmount) {
            // Display an alert message
            alert("Subtraction value cannot exceed remaining credit amount!");
            return; // Exit the function
        }
        setSubtractionValue(newValue);
    };

    // const handleVatav = (event) => {
    //     const newValue = event.target.value.trim() === '' ? 0 : parseFloat(event.target.value);
    //     setVatav(newValue);
    // };
    const handleVatav = (event) => {
        const newValue = event.target.value.trim() === '' ? 0 : parseFloat(event.target.value);
        // Check if the entered value exceeds the remaining credit amount
        if (newValue > remainingCreditAmount) {
            // Display an alert message
            alert("VATAV value cannot exceed remaining credit amount!");
            return; // Exit the function
        }
        setVatav(newValue);
    };

    // Assuming you have a function to calculate the final value after subtraction
    const calculateFinalValue = () => {
        if (totalBillAmount === '' || subtractionValue === '') {
            return '';
        }
        return remainingCreditAmount - subtractionValue;
    };

    const getCurrentDateFormatted = () => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
        const year = currentDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSave = async () => {
        // Perform any necessary data validation before saving

        // Ensure selectedPerson is defined
        if (!selectedPerson) {
            console.warn('No customer selected. Unable to save data.');
            return;
        }

        try {
            const currentTime = getCurrentDateFormatted();
            // Get a reference to the invoices collection for the selected customer
            const invoicesCollectionRef = collection(firestore, 'dealers', selectedPerson.id, 'amount');

            // Add a new document to the invoices collection with the new data
            await addDoc(invoicesCollectionRef, {
                // Add the document fields as needed
                // For example:
                'RecivedAmount': subtractionValue,
                'PandingAmount': calculateFinalValue(),
                'InvoiceDate': currentTime,
                'Vatav': Vatav,
                'Description': description,
            });

            // Optionally, display a success message or perform other actions

            setSubtractionValue('');
            setVatav('')
        } catch (error) {
            // Handle any errors that occur during the saving process
            console.error('Error adding data:', error);
        }
    };
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };


    const handleDeleteInvoiceBill = async () => {
        try {
            if (!selectedPerson) {
                console.error('No customer selected. Unable to delete data.');
                return;
            }

            // Confirm the deletion action
            const confirmed = window.confirm('Are you sure you want to delete the selected invoice?');
            if (!confirmed) {
                return;
            }



            // Assuming selectedBillNo is the unique identifier for the invoice
            const invoiceToDelete = invoicedata.find(invoice => invoice.invoices.invoiceNumber === selectedBillNo);
            if (!invoiceToDelete) {
                console.error('Invoice not found for deletion.');
                return;
            }

            // Get the reference to the invoice document in Firestore


            const invoiceRef = doc(firestore, 'customers', selectedPerson.id, 'invoices', invoiceToDelete.id);

            // Delete the invoice document
            await deleteDoc(invoiceRef);

        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    const handleUpdateInvoice = async (customerId, invoiceId, newData) => {
        try {
            // Get the reference to the invoice document in Firestore
            const invoiceRef = doc(firestore, 'customers', customerId, 'invoices', invoiceId);

            // Update the invoice document with the new data
            await updateDoc(invoiceRef, newData);


        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };
    const handleDeleteCustomer = async () => {
        try {
            if (!selectedCustomer) {
                console.error("No customer selected. Unable to delete data.");
                return;
            }

            // Confirm the deletion action
            const confirmed = window.confirm(
                "Are you sure you want to delete the selected customer and all associated data?"
            );
            if (!confirmed) {
                return;
            }

            // Get a reference to the customer document
            const customerRef = doc(firestore, "dealers", selectedCustomerId);

            // Create references to the amount collection and invoices subcollection
            const amountCollectionRef = collection(customerRef, "amount");
            const invoicesCollectionRef = collection(customerRef, "invoices");

            // Get all documents from the amount collection and delete them
            const amountQuerySnapshot = await getDocs(amountCollectionRef);
            amountQuerySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            // Get all documents from the invoices subcollection and delete them
            const invoicesQuerySnapshot = await getDocs(invoicesCollectionRef);
            invoicesQuerySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            // Finally, delete the customer document itself
            // await deleteDoc(customerRef);

            // Navigate to the desired location
            navigate("/DhruveshHome");
            toast.success('Customer Deleted Successfully');
        } catch (error) {
            console.error("Error deleting customer and associated data:", error);
        }
    };
    let totalVatav = 0;

    // Iterate through the filteredCreditData to calculate the sum of record.Vatav
    filteredCreditData.forEach(record => {
        totalVatav += parseFloat(record.Vatav || 0);
    });

    return (


        <Grid style={{ padding: 20 }}>
            <HeaderCompo title={"Show Purchases"} />

            {
                loadingData ? (
                    <div style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', height: '100vh' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Grid id='mainCtr' style={{}}  >
                        <Col style={{}}>
                            <Flex style={{ ...styles.inputContainer, gap: '5%', justifyContent: 'center' }}>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Search by Customer Name or Mobile Number"
                                    optionFilterProp="children"
                                    value={selectedCustomer}
                                    onChange={handleSearch} // Pass the customer ID to the handleSearch function
                                    style={{ width: '80%' }}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >

                                    {uniqueCustomers.map((item, index) => (
                                        <Option key={item.id} value={item.id}>{`${item.dealerName} - ${item.mobileNumber}`}</Option>
                                    ))}
                                </Select>



                                {/* <Button type="danger" onClick={handleDeleteBill}>Delete Bill</Button> */}
                            </Flex>


                            {/* Your existing code */}

                            <Flex id="tables" style={{ justifyContent: 'space-around', alignItems: 'center', }}>

                                <Col className="print-only" >
                                    <Flex style={{ justifyContent: "space-around" }}>
                                        <PrintButton id="PrintCustomerdata" onClick={handlePrint} />
                                        <Button id='button' style={styles.printButton} onClick={handleDeleteCustomer}>
                                            Delete Customer
                                        </Button>
                                    </Flex>
                                    {/* <label style={{}}>
                                        Dealer Name :{selectedCustomer}
                                    </label> */}
                                    <Flex style={{ alignItems: 'flex-end', justifyContent: 'flex-end', }}>

                                        <Col xs={"auto"} >
                                            Total Amt:
                                            <Input placeholder="" value={remainingCreditAmount} readOnly />

                                        </Col>

                                        {/* <Input
                                            placeholder=""
                                            value={filteredCreditData.length > 0 ? (totalamounts - filteredCreditData[0].PandingAmount) : totalamounts}
                                            readOnly
                                            style={{ width: '20%' }}
                                        /> */}

                                        <Col>

                                            ------
                                            <Input placeholder="Subtract Value" value={subtractionValue} onChange={handleSubtractionChange} />
                                        </Col>
                                        <Col>
                                            Difference: {isNaN(calculateFinalValue()) ? '' : calculateFinalValue()}
                                            <Input placeholder="Vatav Value" value={Vatav} onChange={handleVatav} />
                                        </Col>




                                    </Flex>
                                    <Col xs={24}>
                                        <label>Description:</label>
                                        <Input
                                            placeholder="Description"
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            style={{ height: "32px" }} // Adjust height as necessary
                                        />
                                        <Button id='button' onClick={handleSave}>Save</Button>
                                    </Col>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ cursor: "pointer", width: "100%" }}>
                                            <thead>
                                                <tr>
                                                    <th >Bill No</th>
                                                    <th >Bill Date</th>
                                                    <th >Total Amount</th>
                                                    <th >Mobile No</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ backgroundColor: "#f0f0f0" }}>
                                                {selectedCustomer && dataSourceWithTotal
                                                    .sort((a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate))
                                                    .map(record => (
                                                        <tr key={record.invoiceNumber} onClick={() => handleRowClick(record)} onDoubleClick={() => handleRowDoubleClick(record, selectedCustomer)}>
                                                            <td>{record.invoiceNumber}</td>
                                                            <td>{record.invoiceDate}</td>
                                                            <td>{record.billAmount}</td>
                                                            <td>{record.MoNo}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </Col>


                                {selectedRecord && (
                                    <YourModalComponent
                                        visible={modalVisible}
                                        onClose={handleCloseModal}
                                        recordData={selectedRecord}
                                        totalBillAmount={totalBillAmount}
                                        totalAmount={totalAmount}
                                        onUpdate={handleUpdateInvoice}
                                        onDelete={handleDeleteInvoiceBill}
                                        updatedBillAmount={selectedRecord.invoiceNumber ? updatedBillAmounts[selectedRecord.invoiceNumber] : null} // Use optional chaining to prevent accessing properties of null
                                    />
                                )}


                                {selectedPerson && (
                                    // <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%', alignItems: 'center' }}>
                                    //     <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    //         <h2>Debit Details</h2>
                                    //         <Table dataSource={creditData} columns={debitColumns} />
                                    //     </div>
                                    <Col>
                                        {/* <div style={{ justifyContent: 'flex-start', width: '20%' }}>
                                            <label style={{ fontSize: 16 }}>Total of the credit ammount :</label>
                                            <Input placeholder="" value={calculateTotalCreditAmount()} readOnly style={{}} />
                                        </div> */}


                                        <Grid id="CustomerDetail">


                                            <h2>Credit Details</h2>
                                            <Flex>
                                                <Typography id="remainingcredit" >
                                                    Remaining Credit Amount{" "}
                                                </Typography>
                                                <Input
                                                    id="remainingcredit"
                                                    value={remainingCreditAmount.toFixed(2)}
                                                ></Input>
                                            </Flex>
                                            {/* <label>Remaining Credit Amount <Input style={{ fontSize: 30, color: 'red' }} value={remainingCreditAmount.toFixed(2)}></Input></label> */}
                                            {/* <Table dataSource={filteredCreditData.sort((a, b) => new Date(a.InvoiceDate) - new Date(b.InvoiceDate))} columns={creditColumns} /> */}
                                            <Col style={{ overflowX: "scroll" }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Credit Bill Date and Time</th>
                                                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Credit Bill Amount</th>
                                                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Vatav Amount</th>
                                                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Description</th>

                                                            <th id='button' style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ backgroundColor: "#f0f0f0" }}>
                                                        {filteredCreditData
                                                            .sort((a, b) => new Date(a.InvoiceDate) - new Date(b.InvoiceDate))
                                                            .map(record => (
                                                                <tr key={`${record.customerId}-${record.invoiceId}`}>
                                                                    <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{record.InvoiceDate}</td>
                                                                    <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{record.RecivedAmount}</td>
                                                                    <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{record.Vatav}</td>
                                                                    <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{record.Description}</td>
                                                                    <td id="button" style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                                                                        <button onClick={() => handleDeleteCredit(record.customerId, record.invoiceId)}>Delete</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        <tr style={{ backgroundColor: "goldenrod" }}>
                                                            <td id="amounts">Total</td>
                                                            <td id="amounts">{totalRecivedAmt}</td>
                                                            <td id="action"></td>
                                                        </tr>
                                                        <tr style={{ backgroundColor: "Highlight" }}>
                                                            <td id="amounts">Remaining CreditAmmount</td>
                                                            <td id="amounts">{remainingCreditAmount}</td>
                                                            <td id="action"></td>
                                                        </tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td>Vatav={totalVatav}</td>
                                                    </tbody>
                                                </table>
                                            </Col>

                                        </Grid>




                                    </Col>

                                    //</div>
                                )}


                            </Flex>
                        </Col>

                    </Grid>
                )
            }
        </Grid >

    );
};

function PrintButton({ onClick }) {
    return (
        <Button type="primary" id='button' onClick={onClick} style={styles.printButton}>
            Print
        </Button>
    );
}

export default PurchaseViewBills;





