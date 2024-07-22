import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin, Select, Flex, Typography, Statistic, Row, Col } from "antd";
import firestore from "../../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query as firebaseQuery,
} from "firebase/firestore";
import "../ViewBills/PrintPriview.css";
import Grid from "antd/es/card/Grid";
import HeaderCompo from "../Componants/Header";
import { AnimatedText } from "../Componants/AnimatedText";

const { Option } = Select;

const PandLAccount = () => {
  const Text = Typography;
  const navigate = useNavigate();
  const [invoicedata, setInvoices] = useState([]);
  const [creditdata, setCreditData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingCreditData, setLoadingCreditData] = useState(true);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [sortOption, setSortOption] = useState("invoiceNumber");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    combineData();
  }, [invoicedata, creditdata, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "expense"));
      let total = 0;
      querySnapshot.forEach((doc) => {
        total += parseFloat(doc.data().price);
      });
      setTotalExpense(total);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchInvoices(), fetchCreditData()]);
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const customersCollection = collection(firestore, "customers");
      const customersSnapshot = await getDocs(customersCollection);
      const customersData = [];

      for (const doc of customersSnapshot.docs) {
        const customerData = {
          id: doc.id,
          ...doc.data(),
          invoices: [],
        };

        const invoicesCollectionRef = collection(doc.ref, "invoices");
        const invoicesSnapshot = await getDocs(invoicesCollectionRef);

        invoicesSnapshot.forEach((invoiceDoc) => {
          customerData.invoices.push({
            id: invoiceDoc.id,
            ...invoiceDoc.data(),
          });
        });

        customersData.push(customerData);
      }

      setInvoices(customersData);
    } catch (error) {
      console.error("Error fetching invoices: ", error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchCreditData = async () => {
    setLoadingCreditData(true);
    try {
      const creditDataCollection = collection(firestore, "Creditdata");
      const q = firebaseQuery(creditDataCollection, orderBy("customerName"));
      const querySnapshot = await getDocs(q);

      const creditData = [];
      querySnapshot.forEach((doc) => {
        const dataWithId = { id: doc.id, ...doc.data() };
        creditData.push(dataWithId);
      });

      setCreditData(creditData);
    } catch (error) {
      console.error("Error fetching credit data:", error);
    } finally {
      setLoadingCreditData(false);
    }
  };

  const combineData = () => {
    const allInvoices = invoicedata.flatMap((customer) =>
      customer.invoices.map((invoice) => ({
        ...invoice,
        customerName: customer.customerName,
      }))
    );
    const combined = [...allInvoices, ...creditdata];

    combined.sort((a, b) => {
      if (sortOption === "invoiceNumber") {
        return parseInt(a.invoiceNumber) - parseInt(b.invoiceNumber);
      } else if (sortOption === "date") {
        return new Date(a.invoiceDate) - new Date(b.invoiceDate);
      }
      return 0;
    });

    setCombinedData(combined);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    calculateTotalProfit();
  }, [combinedData]);

  const calculateTotalProfit = () => {
    if (combinedData.length === 0) {
      setTotalProfit(0);
      return;
    }

    const total = combinedData.reduce(
      (acc, data) => acc + (data.totalProfit || 0),
      0
    );
    setTotalProfit(total);
  };

  const isLoading = loadingInvoices || loadingCreditData;

  const totalLoss = totalProfit - totalExpense;

  const handleRowClick = (rowData) => {
    navigate("/CreditPrintBill", {
      state: { selectedData: rowData },
    });
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  return (
    <>
      <Grid style={{ alignItems: 'center', justifyContent: 'center' }} className="container">

        <HeaderCompo title={"Profit and Loss"} />
        <Flex className="non-printable" align="center" justify="space-around" >
          <Row gutter={[12, 16]}>
            <Col xs={24} sm={12} md={8} lg={24}>
              <Select value={sortOption} onChange={handleSortChange} style={{ width: '100%' }}>
                <Option value="invoiceNumber">Sort by Invoice Number</Option>
                {/* <Option value="date">Sort by Date</Option> */}
              </Select>
            </Col>
          </Row>
          <Col xs={8} sm={8} md={8} lg={6}>
            <Button type="primary" onClick={handlePrint}>
              Print
            </Button>
          </Col>

        </Flex>
        {isLoading ? (
          <Grid
            style={{
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <Spin size="large" />
          </Grid>
        ) : (
          <>
            <Flex justify="space-around">
              <h3>Profit: {totalProfit}</h3>
              <h3 >Total Expense: {totalExpense}</h3>
              <h3 >Total Profit: {totalLoss}</h3>
            </Flex>
            <Grid style={{ padding: 25, overflowX: 'scroll' }}>
              <table border="1" style={{ width: "100%", marginTop: "20px" }}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Date</th>
                    <th>Invoice Number</th>
                    <th>Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedData.map((data, index) => (
                    <tr key={data.id} onClick={() => handleRowClick(data)}>
                      <td>{index + 1}</td>
                      <td>{data.invoiceDate}</td>
                      <td>{data.invoiceNumber}</td>
                      <td>{data.totalProfit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>
          </>
        )}

      </Grid>
    </>
  );
};

export default PandLAccount;
