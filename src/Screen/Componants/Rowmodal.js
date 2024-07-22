import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';

const RowDetailsModal = ({ visible, rowData, onClose, onUpdate, onDelete }) => {
    const [updatedInvoiceDate, setUpdatedInvoiceDate] = useState(rowData.InvoiceDate);
    const [updatedRecivedAmount, setUpdatedRecivedAmount] = useState(rowData.RecivedAmount);

    const handleInvoiceDateChange = (e) => {
        setUpdatedInvoiceDate(e.target.value);
    };

    const handleRecivedAmountChange = (e) => {
        setUpdatedRecivedAmount(e.target.value);
    };

    return (
        <Modal
            title="Row Details"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="update" type="primary" onClick={() => onUpdate(updatedInvoiceDate, updatedRecivedAmount)}>Update</Button>,
                <Button key="delete" danger onClick={onDelete}>Delete</Button>,
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
            ]}
        >
            {rowData && (
                <div>
                    <p>Invoice Date:</p>
                    <Input value={updatedInvoiceDate} onChange={handleInvoiceDateChange} />

                    <p>Received Amount:</p>
                    <Input value={updatedRecivedAmount} onChange={handleRecivedAmountChange} />
                </div>
            )}
        </Modal>
    );
};

export default RowDetailsModal;
