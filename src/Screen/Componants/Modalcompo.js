import React, { useState } from 'react';
import { Modal, Input, Button, Table, Popconfirm } from 'antd';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import firestore from '../../firebase';
import { useNavigate } from 'react-router-dom';
const YourModalComponent = ({ visible, onClose, recordData, onUpdate, onDelete }) => {
    // Define columns for the invoice items table
    const navigate = useNavigate();
    const columns = [
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Product Price',
            dataIndex: 'productPrice',
            key: 'productPrice',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    {/* <Button onClick={() => handleUpdate(record)}>Update</Button>
                    <Popconfirm
                        title="Are you sure delete this item?"
                        onConfirm={() => handleDelete(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button>Delete</Button>
                    </Popconfirm> */}
                </span>
            ),
        },
    ];

    const handleUpdate = async () => {
        try {
            const invoiceRef = doc(firestore, 'invoices', recordData.id);
            // Update the invoice document in Firestore with the new data
            await updateDoc(invoiceRef, {
                // Update fields with new values
                // Example: 'fieldName': newValue
            });
         
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };

    const handleDelete = async () => {
        try {
           
            const invoiceRef = doc(firestore, 'invoices', recordData.id);
            // Delete the invoice document from Firestore
            await deleteDoc(invoiceRef);
            
            onClose(); // Close the modal after deleting
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };


    return (
        <Modal
            title="Invoice Details"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="update" onClick={onUpdate}>Update</Button>,
                <Button key="Delete" onClick={onDelete}>Delete</Button>,
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            width={800} // Increased width of the modal
        >
            <h2>Invoice Information</h2>
            <div style={{ marginBottom: '20px', display: 'flex' }}>
                <div>
                    <label>Invoice Number:</label>
                    <Input value={recordData.invoiceNumber} readOnly />
                </div>
                <div>
                    <label>Invoice Mo.NO:</label>
                    <Input value={recordData.MoNo} readOnly />
                </div>
                <div>
                    <label>Customer Name:</label>
                    <Input value={recordData.customerName} readOnly />
                </div>
                <div>
                    <label>Invoice Date:</label>
                    <Input value={recordData.invoiceDate} readOnly />
                </div>

            </div>

            <div>
                <h2>Invoice Items</h2>
                <Table
                    columns={columns}
                    dataSource={recordData.invoiceItems}
                    pagination={false} // Disable pagination
                />
            </div>
            <div style={{ marginBottom: '20px', display: 'flex' }}>

                <div>
                    <label>Total Bill Amount:</label>
                    <Input value={recordData.billAmount} />
                </div>
                <div>
                    <label>Discount:</label>
                    <Input value={recordData.discount} />
                </div>
                <div>
                    <label>Labor:</label>
                    <Input value={recordData.labor} />
                </div>
                <div>
                    <label>Tax:</label>
                    <Input value={recordData.tax} />
                </div>
            </div>
        </Modal>
    );
};

export default YourModalComponent;
