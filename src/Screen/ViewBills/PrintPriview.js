// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './PrintPriview.css';

// const PrintPreview = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const invoiceData = location.state.invoiceData;

//     if (!invoiceData || !invoiceData.invoiceItems) {
//         return <div>No invoice data available</div>;
//     }

//     const handleBack = () => {
//         navigate(-1, { state: { invoiceData } }); // Pass invoiceData back to previous page
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     return (
//         <div className="print-preview-container">
//             <h2>Print Preview</h2>
//             <button onClick={handleBack}>Back</button>
//             <button onClick={handlePrint}>Print</button>
//             <div className="invoice-details">
//                 <p><strong>Invoice Number:</strong> <strong>{invoiceData.invoiceNumber}</strong></p>
//                 <p><strong>Customer Name:</strong> {invoiceData.customerName}</p>
//                 <p><strong>MoNo:</strong> {invoiceData.MoNo}</p>
//                 <p><strong>Date:</strong> {invoiceData.invoiceDate}</p>
//             </div>
//             <div className="invoice-items">
//                 <h3>Invoice Items</h3>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>SiNo</th>
//                             <th>Product Name</th>
//                             <th>Price</th>
//                             <th>Qty</th>
//                             <th>Amount</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {invoiceData.invoiceItems.map((item, index) => (
//                             <tr key={index}>
//                                 <td>{index + 1}</td>
//                                 <td>{item.productName}</td>
//                                 <td>{item.productPrice}</td>
//                                 <td>{item.quantity}</td>
//                                 <td>{item.amount}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             <div className="additional-details">
//                 <p><strong>Discount:</strong> {invoiceData.discount}</p>
//                 <p><strong>Labor:</strong> {invoiceData.labor}</p>
//                 <p><strong>Tax:</strong> {invoiceData.tax}</p>
//                 <p><strong>Total Bill Amount:</strong> {invoiceData.billAmount}</p>
//             </div>
//         </div>
//     );
// };

// export default PrintPreview;



// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Button, Input, DatePicker, Table, Select } from 'antd';
// import { styles } from './ViewBillsStyles'; // Importing styles
// import moment from 'moment';
// import { useHistory, useNavigate } from 'react-router-dom';
// const { Option } = Select;
// const ViewBills = () => {
//     const invoicedata = useSelector(state => state.Bill.invoices);
//     console.log("InvoicData standers", invoicedata)
//     const [fromDate, setFromDate] = useState('');
//     const [toDate, setToDate] = useState('');
//     const [billNo, setBillNo] = useState('');
//     const [totalBillAmount, setTotalBillAmount] = useState(0);
//     const [totalBills, setTotalBills] = useState(0);
//     const [filteredData, setFilteredData] = useState([]);
//     const [selectedBillNo, setSelectedBillNo] = useState('');
//     const [selectedPerson, setSelectedPerson] = useState('');

//     useEffect(() => {
//         calculateTotals();
//         setFilteredData(invoicedata); // Initialize filteredData with all data initially
//     }, [invoicedata]);

//     const calculateTotals = () => {
//         let totalAmount = 0;
//         let numberOfBills = invoicedata.length;

//         invoicedata.forEach(bill => {
//             totalAmount += parseFloat(bill.billAmount); // Convert bill amount to number and add
//         });

//         setTotalBillAmount(totalAmount.toFixed(2)); // Keep two decimal places
//         setTotalBills(numberOfBills);
//     };

//     const handleViewBills = () => {
//         // Filtering logic can be implemented here if needed
//     };

//     const handleDeleteBill = () => {
//         // Logic to handle deleting a bill
//     };

//     const handleBack = () => {
//         window.history.back();
//     };

//     const handleSearch = (value) => {
//         const searchText = value.toLowerCase();
//         setSelectedCustomer(value); // Update selected customer
//         setSelectedPerson(searchText); // Update selected person for filtering

//         // Filtering logic to update filtered data based on search text
//         let filtered = invoicedata.filter(item => {
//             return (
//                 item.customerName.toLowerCase().includes(searchText) ||
//                 item.MoNo.toLowerCase().includes(searchText)
//             );
//         });

//         // Calculate the total bill amount for the filtered data
//         let totalAmount = 0;
//         filtered.forEach(bill => {
//             totalAmount += parseFloat(bill.billAmount); // Convert bill amount to number and add
//         });

//         setTotalBillAmount(totalAmount.toFixed(2)); // Update total bill amount

//         // Sort filtered data based on bill amount
//         filtered = filtered.sort((a, b) => a.billAmount - b.billAmount);

//         setFilteredData(filtered); // Update filtered data
//     };


//     const handleRowClick = (record) => {
//         setSelectedBillNo(record.invoiceNumber); // Set the selected bill number when a row is clicked
//     };

//     const navigate = useNavigate();

//     const handleRowDoubleClick = (record) => {
//         console.log("Clicked record:", record);
//         navigate({
//             pathname: '/UpdateBill',
//             state: { recordData: record }
//         });
//     };

//     const calculateTotalSale = () => {
//         if (!selectedPerson) return 0; // If no person is selected, return 0

//         // Filter bills based on the selected person's name
//         const personBills = invoicedata.filter(item => item.customerName.toLowerCase() === selectedPerson.toLowerCase());

//         // Calculate the total bill amount for the selected person
//         const totalSale = personBills.reduce((total, bill) => total + parseFloat(bill.billAmount), 0);

//         return totalSale.toFixed(2); // Keep two decimal places
//     };

//     const columns = [
//         {
//             title: 'Bill No',
//             dataIndex: 'invoiceNumber',
//             key: 'invoiceNumber',
//         },
//         {
//             title: 'Bill Date',
//             dataIndex: 'invoiceDate',
//             key: 'invoiceDate',
//         },
//         {
//             title: 'Bill Amount',
//             dataIndex: 'billAmount',
//             key: 'billAmount',
//         },
//         {
//             title: 'Customer Name',
//             dataIndex: 'customerName',
//             key: 'customerName',
//         },
//         {
//             title: 'Mobile No',
//             dataIndex: 'MoNo',
//             key: 'MoNo',
//         },
//     ];
//     const [selectedCustomer, setSelectedCustomer] = useState(null);
//     const [manuallyEnteredAmount, setManuallyEnteredAmount] = useState('');

//     const handleManualAmountChange = (e) => {
//         setManuallyEnteredAmount(e.target.value);
//     };

//     const dataSourceWithTotal = [
//         ...filteredData,
//         { invoiceNumber: 'Recived', billAmount: manuallyEnteredAmount },
//         { invoiceNumber: 'Total', billAmount: totalBillAmount },
//     ];


//     return (
//         <div style={styles.container}>
//             <div style={{ alignSelf: 'flex-start' }}>
//                 <Button onClick={handleBack}>Back</Button>
//             </div>
//             <div style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
//                 <div style={{ ...styles.inputContainer, gap: '5%' }}>
//                     <Select
//                         showSearch
//                         placeholder="Search by Customer Name or Mobile Number"
//                         optionFilterProp="children"
//                         value={selectedCustomer}
//                         onChange={handleSearch}
//                         style={{ width: '100%' }}
//                     >
//                         {invoicedata.map((item, index) => (
//                             <Option key={index} value={item.customerName}>{`${item.customerName} - ${item.MoNo}`}</Option>
//                         ))}
//                     </Select>
//                     <Button type="danger" onClick={handleDeleteBill}>Delete Bill</Button>
//                 </div>

//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', }}>
//                         <label>Total Bills</label>
//                         <Input placeholder="" value={totalBills} readOnly style={{ width: '50%' }} />
//                     </div>
//                     <Input placeholder="Bill No" value={selectedBillNo} readOnly style={{ width: '20%' }} />
//                     <label>Total Sale of That Person:</label>
//                     <Input placeholder="" value={totalBillAmount} readOnly style={{ width: '10%' }} />
//                     <label>Total Recived Ammount of That Person:</label>
//                     <Input
//                         placeholder="Enter Manual Amount"
//                         value={manuallyEnteredAmount}
//                         onChange={handleManualAmountChange}
//                         style={{ width: '10%' }}
//                     />

//                 </div>

//                 <div>
//                     <Table
//                         dataSource={selectedCustomer ? dataSourceWithTotal : []}
//                         columns={columns}
//                         onRow={(record) => ({
//                             onClick: () => handleRowClick(record),
//                             onDoubleClick: () => handleRowDoubleClick(record),
//                         })}
//                     />

//                 </div>
//             </div>
//         </div>
//     );
// };



// export default ViewBills;
