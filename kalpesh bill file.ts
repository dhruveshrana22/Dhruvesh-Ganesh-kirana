import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addBill, updateBill, deleteBill } from '../../redux/Addinvoiceitem/CreditBillAmmount';
import { useNavigate } from 'react-router-dom';
import { storeInvoiceData, updateInvoiceData } from '../../redux/Addinvoiceitem/AddInvoiceBill_Redux';
import { updateInvoiceItem } from '../../redux/Addinvoiceitem/Addinvoiceiemredux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../App.css'
const YourModalComponent = ({ visible, onClose, recordData }) => {
    const [manuallyEnteredAmount, setManuallyEnteredAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(null); // State to hold the selected date
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const invoicedata = useSelector(state => state.Bill.invoices);
    console.log("Dhruvesh", invoicedata)

    useEffect(() => {
        calculateTotalAmount();
    }, [recordData, manuallyEnteredAmount, selectedDate, invoicedata]);

    const calculateTotalAmount = () => {
        const totalSale = parseFloat(recordData?.RecivedbillAmount || recordData?.billAmount) || 0;
        const manualAmount = parseFloat(manuallyEnteredAmount) || 0;
        const calculatedTotalAmount = totalSale - manualAmount;

        setSelectedRecord(prevState => ({
            ...prevState,
            totalAmount: calculatedTotalAmount.toFixed(2)
        }));
    };

    const [selectedRecord, setSelectedRecord] = useState({
        totalBillAmount: 0,
        totalAmount: 0
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleManualAmountChange = (e) => {
        const value = e.target.value;
        setManuallyEnteredAmount(value);

        // Check if total received amount is greater than total amount
        const totalReceivedAmount = parseFloat(value) || 0;
        if (totalReceivedAmount > parseFloat(selectedRecord.totalAmount)) {
            setErrorMessage("Total received amount cannot be greater than total amount.");
        } else {
            setErrorMessage('');
        }
    };

    const handleDateChange = (date, dateString) => {
        setSelectedDate(dateString); // Update the selected date
    };

    const handleSave = () => {
        const totalSale = parseFloat(recordData?.RecivedbillAmount || recordData?.billAmount) || 0;
        const manualAmount = parseFloat(manuallyEnteredAmount) || 0;
        const calculatedTotalAmount = totalSale - manualAmount;

        if (manualAmount > totalSale) {
            // Show alert if the manually entered amount is greater than the total sale amount
            alert("Total Received Amount cannot be greater than Total Amount");
            return;
        }

        // Dispatch action to add bill
        dispatch(addBill({
            ...recordData,
            date: selectedDate, // Use selected date here
            RicevedAmt: manuallyEnteredAmount,
            totalAmount: calculatedTotalAmount.toFixed(2)
        }));

        const updatedInvoiceData = invoicedata.map(item => {
            if (item.id === recordData.id) {
                return { ...item, RecivedbillAmount: calculatedTotalAmount.toFixed(2) }; // Update the bill amount
            }
            return item;
        });

        dispatch(updateInvoiceData(updatedInvoiceData)); // Dispatch the updated invoice data
        console.log("updatedInvoiceData", dispatch(updateInvoiceData(updatedInvoiceData)))
        toast.success("You will navigate to the Home page You data Has Been Updated", {
            position: "bottom-right", // Change the position as needed
            autoClose: 3000, // Auto close the toast after 3 seconds
            hideProgressBar: true, // Hide the progress bar
            closeOnClick: true, // Close the toast when clicked
            pauseOnHover: true, // Pause the timer when hovered
            draggable: true, // Make the toast draggable
        });
        onClose();
        setManuallyEnteredAmount('');
        setSelectedDate(null); // Reset selected date after save
        navigate('/');
    };


    const handleUpdate = () => {
        // Dispatch action to update bill
        dispatch(updateBill({
            ...recordData,
            manualAmount: manuallyEnteredAmount,
            totalAmount: selectedRecord.totalAmount
        }));
        onClose();
    };

    const handleDelete = () => {
        // Dispatch action to delete bill
        dispatch(deleteBill(recordData.billNo));
        onClose();
    };

    return (
        <Modal
            title="Your Modal Title"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="delete" onClick={handleDelete}>Delete</Button>,
                <Button key="update" onClick={handleUpdate}>Update</Button>,
                <Button key="save" type="primary" onClick={handleSave}>Save</Button>
            ]}
        >
            <h1>{recordData?.customerName} </h1>

            <div style={{ display: 'flex' }}>
                <div>
                    <label style={{ fontSize: 16 }}>Bill No:</label>
                    <Input placeholder="" value={recordData?.invoiceNumber} readOnly style={{}} />
                </div>
                <div>
                    <label style={{ fontSize: 16 }}>Bill Date:</label>
                    <DatePicker onChange={handleDateChange} />
                </div>
                <div>
                    <label style={{ fontSize: 16 }}>Bill Amount:</label>
                    <Input placeholder="" value={recordData?.billAmount} readOnly style={{}} />
                </div>
            </div>

            {/* Add other fields as needed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <label>Total Received Amount:</label>
                <Input
                    placeholder="Enter Manual Amount"
                    value={manuallyEnteredAmount}
                    onChange={handleManualAmountChange}
                    style={{ width: '30%' }}
                />
                <label>Total Amount:</label>
                <Input
                    placeholder="Total Amount"
                    value={selectedRecord.totalAmount || 0}
                    readOnly
                    style={{ width: '30%' }}
                />
            </div>
        </Modal>
    );
};

export default YourModalComponent;


















// this is the view bill give the code 



import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Input, DatePicker, Table, Select, Divider } from 'antd';
import { styles } from './ViewBillsStyles'; // Importing styles
import moment from 'moment';
import { useHistory, useNavigate } from 'react-router-dom';
import YourModalComponent from '../Componants/Modalcompo';
import './PrintPriview.css'
const { Option } = Select;

const ViewBills = () => {
    const invoicedata = useSelector(state => state.Bill.invoices);
    const CreditBillReducer = useSelector(state => state.CreditBillReducer.bills);
    console.log("InvoicData standers", invoicedata)
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
    useEffect(() => {
        calculateTotals();
        setFilteredData(invoicedata);
        filterCreditAndDebitData(); // Initialize filteredData with all data initially
    }, [invoicedata]);

    useEffect(() => {
        filterCreditAndDebitData(); // Update credit and debit data when selected person changes
    }, [selectedPerson]);

    const filterCreditAndDebitData = () => {
        // Filter credit data for the selected person
        const filteredCreditData = CreditBillReducer.filter(item => {
            return invoicedata.some(bill => bill.invoiceNumber === item.invoiceNumber);
        });

        // Filtered debit data based on matching invoiceNumber
        const filteredDebitData = CreditBillReducer.filter(item => {
            return invoicedata.some(bill => bill.invoiceNumber === item.invoiceNumber);
        });

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
        let numberOfBills = invoicedata.length;

        invoicedata.forEach(bill => {
            totalAmount += parseFloat(bill.billAmount); // Convert bill amount to number and add
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
        window.history.back();
    };

    const handleSearch = (value) => {
        const searchText = value ? value.toLowerCase() : ''; // Ensure value is not undefined before using toLowerCase

        setSelectedCustomer(value); // Update selected customer
        setSelectedPerson(searchText); // Update selected person for filtering

        // Filtering logic to update filtered data based on search text
        let filtered = invoicedata.filter(item => {
            return (
                (item.customerName && item.customerName.toLowerCase().includes(searchText)) ||
                (item.MoNo && item.MoNo.toLowerCase().includes(searchText))
            );
        });

        // Calculate the total bill amount for the filtered data
        let totalAmount = 0;
        filtered.forEach(bill => {
            totalAmount += parseFloat(bill.billAmount); // Convert bill amount to number and add
        });

        setTotalBillAmount(totalAmount.toFixed(2)); // Update total bill amount

        // Sort filtered data based on bill amount
        filtered = filtered.sort((a, b) => a.billAmount - b.billAmount);

        // Update filtered data, ensuring it's always an array
        setFilteredData(Array.isArray(filtered) ? filtered : []);
    };



    const handleRowClick = (record) => {
        setSelectedBillNo(record.invoiceNumber); // Set the selected bill number when a row is clicked
    };

    const navigate = useNavigate();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleRowDoubleClick = (record) => {

        setSelectedRecord(record);
        setModalVisible(true);
    };
    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const calculateTotalSale = () => {
        if (!selectedPerson) return 0; // If no person is selected, return 0

        // Filter bills based on the selected person's name
        const personBills = invoicedata.filter(item => item.customerName.toLowerCase() === selectedPerson.toLowerCase());

        // Calculate the total bill amount for the selected person
        const totalSale = personBills.reduce((total, bill) => total + parseFloat(bill.billAmount), 0);

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
        {
            title: 'Recive Ammount',
            dataIndex: 'RecivedbillAmount',
            key: 'RecivedbillAmount',

        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Mobile No',
            dataIndex: 'MoNo',
            key: 'MoNo',
        },
    ];
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [manuallyEnteredAmount, setManuallyEnteredAmount] = useState('');

    const handleManualAmountChange = (e) => {
        setManuallyEnteredAmount(e.target.value);
    };

    const dataSourceWithTotal = [
        ...(Array.isArray(filteredData) ? filteredData : []),


        { invoiceNumber: 'Total', billAmount: totalBillAmount },
    ];

    const creditColumns = [
        // {
        //     title: 'Credit Bill No',
        //     dataIndex: 'invoiceNumber',
        //     key: 'invoiceNumber',
        // },
        {
            title: 'Credit Bill Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Credit Bill Amount',
            dataIndex: 'RicevedAmt',
            key: 'RicevedAmt',
        }
    ];

    const filteredCreditData = CreditBillReducer.filter(item => item.customerName.toLowerCase() === selectedPerson.toLowerCase());
    const calculateTotalCreditAmount = () => {
        // Sum up the RicevedAmt from the CreditBillReducer data
        const totalCreditAmount = filteredCreditData.reduce((total, item) => total + parseFloat(item.RicevedAmt || 0), 0);
        return totalCreditAmount.toFixed(2); // Keep two decimal places
    };

    const debitColumns = [
        {
            title: 'Debit Bill No',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
        },
        {
            title: 'Debit Bill Date',
            dataIndex: 'invoiceDate',
            key: 'invoiceDate',
        },
        {
            title: 'Debit Bill Amount',
            dataIndex: 'billAmount',
            key: 'billAmount',
        }
    ];

    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const calculatedTotalAmount = (parseFloat(totalBillAmount) - parseFloat(manuallyEnteredAmount)).toFixed(2);
        setTotalAmount(calculatedTotalAmount);
    }, [totalBillAmount, manuallyEnteredAmount]);


    const uniqueCustomers = Array.isArray(invoicedata) ? invoicedata.reduce((acc, curr) => {
        if (!acc.find(item => item.customerName === curr.customerName && item.MoNo === curr.MoNo)) {
            acc.push(curr);
        }
        return acc;
    }, []) : [];




    const handlePrint = () => {
        window.print();
    };



    return (
        <div style={styles.container}>
            <div style={{ alignSelf: 'flex-start' }}>
                <Button id='Button' onClick={handleBack}>Back</Button>
            </div>
            <div style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
                <div style={{ ...styles.inputContainer, gap: '5%' }}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Search by Customer Name or Mobile Number"
                        optionFilterProp="children"
                        value={selectedCustomer}
                        onChange={handleSearch}
                        style={{ width: '100%' }}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {uniqueCustomers.map((item, index) => (
                            <Option key={index} value={item.customerName}>{`${item.customerName} - ${item.MoNo}`}</Option>
                        ))}
                    </Select>


                    <Button type="danger" onClick={handleDeleteBill}>Delete Bill</Button>
                </div>

                <div style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <label>Select Date :</label>

                        <DatePicker />

                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>

                            <label>Total Bills</label>
                            <Input placeholder="" value={totalBills} readOnly style={{ width: '50%' }} />
                        </div> */}
                        <label>Bill No:</label>

                        <Input placeholder="Bill No" value={selectedBillNo} readOnly style={{ width: '10%' }} />

                        <label style={{ fontSize: 16 }}>Total Sale of That Person:</label>
                        <Input placeholder="" value={totalBillAmount} readOnly style={{ width: '10%' }} />
                    </div>

                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <label>Total Received Amount:</label>
                        <Input
                            placeholder="Enter Manual Amount"
                            value={manuallyEnteredAmount}
                            onChange={handleManualAmountChange}
                            style={{ width: '15%' }}
                        />
                        <label>Total Amount:</label>
                        <Input
                            placeholder="Total Amount"
                            value={totalAmount || 0}
                            readOnly
                            style={{ width: '15%' }}
                        />

                    <Button   >Save</Button>
                    <Button   >Update</Button>
                    <Button  >Delete</Button>
                </div> */}

                </div>

                {/* Your existing code */}

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>

                    <div className="print-only">
                        <PrintButton id="PrintCustomerdata" onClick={handlePrint} />
                        <div>
                            <h5>
                                Customer Name:{invoicedata.customerName}  Mobile no :{invoicedata.MoNo}
                            </h5>
                        </div>

                        <Table style={{ cursor: 'pointer' }}
                            dataSource={selectedCustomer ? dataSourceWithTotal : []}
                            columns={columns}
                            id='cutomerdata'
                            onRow={(record) => ({
                                onClick: () => handleRowClick(record),
                                onDoubleClick: () => handleRowDoubleClick(record),
                            })}
                        />
                    </div>


                    <YourModalComponent
                        visible={modalVisible}
                        onClose={handleCloseModal}
                        recordData={selectedRecord}
                        totalBillAmount={totalBillAmount}
                        totalAmount={totalAmount}
                        updatedBillAmount={selectedRecord?.invoiceNumber ? updatedBillAmounts[selectedRecord.invoiceNumber] : null} // Use optional chaining to prevent accessing properties of null
                    />

                    {selectedPerson && (
                        // <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%', alignItems: 'center' }}>
                        //     <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                        //         <h2>Debit Details</h2>
                        //         <Table dataSource={creditData} columns={debitColumns} />
                        //     </div>
                        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', width: '60%', }}>
                            <div style={{ justifyContent: 'flex-start', width: '20%' }}>
                                <label style={{ fontSize: 16 }}>Total of the credit ammount :</label>
                                <Input placeholder="" value={calculateTotalCreditAmount()} readOnly style={{}} />
                            </div>

                            <div>
                                <h2>Credit Details</h2>
                                <Table dataSource={filteredCreditData} columns={creditColumns} />
                            </div>

                        </div>

                        //</div>
                    )}


                </div>
            </div>

        </div >


    );
};

function PrintButton({ onClick }) {
    return (
        <Button type="primary" id='Button' onClick={onClick} style={styles.printButton}>
            Print
        </Button>
    );
}

export default ViewBills;
































