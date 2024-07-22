import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import "./PurchaseManagement.css";
// import { addPurchase } from '../../redux/PurchaseData/Purchasedata';
import { useNavigate } from 'react-router-dom';

const PurchaseManagement = () => {
    const navigate = useNavigate();

    // Define states for input fields
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [amount, setAmount] = useState('');

    const dispatch = useDispatch();

    // Function to handle adding a purchase
    const addPurchaseItem = () => {
        if (!productName || !productPrice || !quantity || !amount) {
            alert("Please fill in all fields");
            return;
        }

        const newPurchaseItem = {
            id: uuidv4(),
            productName,
            productPrice,
            quantity,
            amount
        };

        // Dispatch action to add the new purchase item
        // dispatch(addPurchase(newPurchaseItem));

        // Reset input fields after adding item
        setProductName('');
        setProductPrice('');
        setQuantity('');
        setAmount('');
    }

    return (
        <div id="purchaseContainer">
            <h2>Purchase Management</h2>
            <button onClick={() => navigate(-1)} className="goBackButton">
                Go Back
            </button>
            <form id="purchaseForm">
                <div>
                    <label htmlFor="productName">Product Name:</label>
                    <input
                        type="text"
                        id="productName"
                        name="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="productPrice">Product Price:</label>
                    <input
                        type="number"
                        id="productPrice"
                        name="productPrice"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button type="button" id="addPurchaseButton" onClick={addPurchaseItem}>
                    Add Purchase
                </button>
            </form>
        </div>
    );
};

export default PurchaseManagement;
