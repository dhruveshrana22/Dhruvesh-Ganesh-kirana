// import React, { useState } from 'react';
// import { DatePicker, Button, Table } from 'antd';
// import moment from 'moment';
// import { useSelector } from 'react-redux';

// const { RangePicker } = DatePicker;

// function ShowSale() {
//     const invoicedata = useSelector(state => state.Bill.invoices);
//     console.log("InvoicData standers", invoicedata);

//     const [filteredData, setFilteredData] = useState([]);
//     const [dateRange, setDateRange] = useState([]);

//     // Function to handle date range selection
//     const handleDateChange = (dates) => {
//         setDateRange(dates);
//     };

//     // Function to handle form submission
//     const handleSubmit = () => {
//         if (dateRange.length !== 2 || !moment(dateRange[0]).isValid() || !moment(dateRange[1]).isValid()) {
//             // Date range not selected or invalid
//             console.log("Invalid date range");
//             return;
//         }

//         // Convert moment objects to JavaScript Date objects
//         const startDate = dateRange[0].toDate();
//         const endDate = dateRange[1].toDate();

//         console.log("Start Date:", startDate);
//         console.log("End Date:", endDate);

//         // Filter data based on the selected date range
//         const filtered = invoicedata.filter(item => {
//             // Ensure the invoice date is properly formatted
//             const invoiceDate = moment(item.invoiceDate, 'MM/DD/YYYY', true);
//             if (!invoiceDate.isValid()) {
//                 // Handle invalid date format gracefully
//                 console.log("Invoice Date:", item.invoiceDate, "is invalid");
//                 return false; // Exclude invalid entries from filtered data
//             }

//             console.log("Invoice Date:", invoiceDate.format('MM/DD/YYYY'));
//             const isBetween = invoiceDate.isBetween(startDate, endDate, null, '[]');
//             console.log("Is Between:", isBetween);
//             return isBetween;
//         });

//         console.log("Filtered Data:", filtered);

//         // Update filtered data state
//         setFilteredData(filtered);
//     };



//     // Table columns configuration
//     const columns = [
//         {
//             title: 'Invoice Number',
//             dataIndex: 'invoiceNumber',
//             key: 'invoiceNumber',
//         },
//         {
//             title: 'Invoice Date',
//             dataIndex: 'invoiceDate',
//             key: 'invoiceDate',
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
//         {
//             title: 'Bill Amount',
//             dataIndex: 'billAmount',
//             key: 'billAmount',
//         },
//     ];

//     return (
//         <div>
//             <RangePicker onChange={handleDateChange} />
//             <Button type="primary" onClick={handleSubmit}>Submit</Button>
//             <Table dataSource={filteredData} columns={columns} />
//         </div>
//     );
// }


// export default ShowSale;
