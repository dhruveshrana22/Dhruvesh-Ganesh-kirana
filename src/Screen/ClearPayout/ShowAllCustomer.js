import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import firestore from "../../firebase";
import { v4 as uuidv4 } from "uuid";
import "./ClearPayout.css";
import useCheckLogin from "../../utils/CheckLogin";
import Grid from "antd/es/card/Grid";
import HeaderCompo from "../Componants/Header";
import { Button, Flex, Input, Typography } from "antd";

const AllCustomer = () => {
  useCheckLogin();
  const Text = Typography;
  const [dealers, setDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    dealerName: "",
    mobileNumber: "",
    location: "",
    description: "",
  });
  const [expandedRowId, setExpandedRowId] = useState(null);
  // useEffect(() => {
  //     const fetchData = async () => {
  //         const dealerCollection = collection(firestore, 'dealers');
  //         const snapshot = await getDocs(dealerCollection);
  //         const dealerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //         setDealers(dealerData);
  //     };
  //     fetchData();
  // }, []);
  const calculateTotalReceivedAmount = (dealer) => {
    let totalReceived = 0;
    dealer.amounts.forEach((amount) => {
      totalReceived += amount.RecivedAmount;
    });
    return totalReceived;
  };
  useEffect(() => {
    const fetchData = async () => {
      const dealersCollection = collection(firestore, "customers");
      const snapshot = await getDocs(dealersCollection);
      const dealersData = [];

      snapshot.forEach(async (dealerDoc) => {
        const dealerId = dealerDoc.id;
        const dealerData = dealerDoc.data();

        // Fetch invoices for this dealer
        const invoicesCollection = collection(
          firestore,
          "customers",
          dealerId,
          "invoices"
        );
        const invoicesSnapshot = await getDocs(invoicesCollection);
        const invoicesData = invoicesSnapshot.docs.map((invoiceDoc) => ({
          id: invoiceDoc.id,
          ...invoiceDoc.data(),
        }));

        // Fetch amounts for this dealer
        const amountsCollection = collection(
          firestore,
          "customers",
          dealerId,
          "amount"
        );
        const amountsSnapshot = await getDocs(amountsCollection);
        const amountsData = amountsSnapshot.docs.map((amountDoc) => ({
          id: amountDoc.id,
          ...amountDoc.data(),
        }));

        dealersData.push({
          id: dealerId,
          ...dealerData,
          invoices: invoicesData,
          amounts: amountsData,
        });
      });

      setDealers(dealersData);
    };

    fetchData();
  }, []);
  async function saveDealer() {
    const { dealerName, mobileNumber, location, description } = formData;
    if (
      dealerName.trim() !== "" &&
      mobileNumber.trim() !== "" &&
      location.trim() !== "" &&
      description.trim() !== ""
    ) {
      try {
        // Check if a dealer with the same name already exists
        const q = query(
          collection(firestore, "dealers"),
          where("dealerName", "==", dealerName)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          alert("A dealer with the same name already exists.");
          return;
        }

        const dealerDocRef = await addDoc(collection(firestore, "dealers"), {
          dealerName,
          mobileNumber,
          location,
          description,
        });
        setDealers([
          ...dealers,
          {
            id: dealerDocRef.id,
            dealerName,
            mobileNumber,
            location,
            description,
          },
        ]);
        setFormData({
          id: null,
          dealerName: "",
          mobileNumber: "",
          location: "",
          description: "",
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  }

  async function deleteDealerData(id) {
    try {
      await deleteDoc(doc(firestore, "dealers", id));
      const filteredDealers = dealers.filter((dealer) => dealer.id !== id);
      setDealers(filteredDealers);
      setFormData({
        id: null,
        dealerName: "",
        mobileNumber: "",
        location: "",
        description: "",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }

  function handleSearch(value) {
    setSearchQuery(value);
  }

  // Filter dealers based on search query
  const filteredDealers = dealers.filter((dealer) =>
    dealer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  function toggleRowExpansion(rowId) {
    setExpandedRowId(rowId === expandedRowId ? null : rowId);
  }
  const calculateInvoiceTotal = (invoice) => {
    return parseFloat(invoice.billAmount);
  };

  const calculateTotalInvoiceAmount = (invoices) => {
    let total = 0;
    invoices.forEach((invoice) => {
      total += parseFloat(invoice.billAmount);
    });
    return total;
  };
  const calculateRemainingAmount = (dealer) => {
    const totalInvoiceAmount = calculateTotalInvoiceAmount(dealer.invoices);
    const totalReceivedAmount = calculateTotalReceivedAmount(dealer);
    return totalInvoiceAmount - totalReceivedAmount;
  };

  const totalRemainingAmount = dealers.reduce(
    (accumulator, dealer) => accumulator + calculateRemainingAmount(dealer),
    0
  );
  // .....................handle PrintOut Button .....................
  const handlePrint = () => {
    window.print();
  };

  return (
    <Grid id="container3">
      <div id="nonPrint">
        <HeaderCompo title={"CustomerPayout"} />
        <Flex justify="space-between">
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button type="primary" onClick={handlePrint}>Print</Button>
        </Flex>
      </div>
      <Text style={{ fontSize: 20 }}>
        Total of RemainigAmount:{totalRemainingAmount}
      </Text>

    <Grid style={{overflowX:"auto"}}>
    <table>
        <thead>
          <tr>
            <th>Name</th>
            {/* <th>Mobile Number</th> */}
            <th>Location</th>
            <th>Description</th>
            <th>Total Invoice Amount</th>
            <th>TotalRicivableAmount</th>
            <th>RemainigAmount</th>
          </tr>
        </thead>
        <tbody>
          {filteredDealers.map((dealer) => (
            <React.Fragment key={dealer.id}>
              <tr onClick={() => toggleRowExpansion(dealer.id)}>
                <td>{dealer.customerName}</td>
                {/* <td>{dealer.mobileNumber}</td> */}
                <td>{dealer.villageName}</td>
                <td>{dealer.description}</td>
                <td> {calculateTotalInvoiceAmount(dealer.invoices)}</td>
                <td>{calculateTotalReceivedAmount(dealer)}</td>
                <td>{calculateRemainingAmount(dealer)}</td>
              </tr>
              {expandedRowId === dealer.id && (
                <tr id="hovernon">
                  <td colSpan="6">
                    {/* Render additional details here */}
                    {/* Example: Render invoices */}
                    {dealer.invoices.map((invoice) => (
                      <div key={invoice.id}>
                        <h3>Invoice Details</h3>
                        <div id="invoicedetail">
                          <p>Invoice Number: {invoice.invoiceNumber}</p>
                          <p>Invoice Date: {invoice.invoiceDate}</p>
                          <p>Customer Name: {invoice.customerName}</p>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.invoiceItems.map((item, index) => (
                              <tr key={index}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>{item.productPrice}</td>
                                <td>{item.quantity * item.productPrice}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p>Total Amount: {calculateInvoiceTotal(invoice)}</p>
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Grid>
    </Grid>
  );
};

export default AllCustomer;
  