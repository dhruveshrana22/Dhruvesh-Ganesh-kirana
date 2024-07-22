import React, { useEffect, useState } from "react";
import firestore from "../../firebase";
import { collection, getDocs, orderBy } from "firebase/firestore";
import { query as firebaseQuery } from "firebase/firestore";

function ProfiCompo() {
  const [invoicedata, setInvoices] = useState([]);
  const [creditData, setCreditData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchInvoices = async () => {
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

    return customersData;
  };

  const fetchCreditData = async () => {
    try {
      const creditDataCollection = collection(firestore, 'Creditdata');
      const q = firebaseQuery(creditDataCollection, orderBy('customerName'));
      const querySnapshot = await getDocs(q);

      const creditData = [];
      querySnapshot.forEach(doc => {
        const dataWithId = { id: doc.id, ...doc.data() };
        creditData.push(dataWithId);
      });

      return creditData;
    } catch (error) {
      console.error('Error fetching credit data:', error);
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoadingData(true);
    const [invoices, credits] = await Promise.all([fetchInvoices(), fetchCreditData()]);
    setInvoices(invoices);
    setCreditData(credits);
    setLoadingData(false);
    console.log("🚀 ~ ProfiCompo ~ creditData:", credits);
  };

  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getCurrentMonth = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}/${year}`;
  };

  const getCurrentYear = () => {
    const today = new Date();
    return today.getFullYear();
  };

  const calculateTotalProfitForToday = () => {
    const todayDate = getTodayDate();
    let totalProfit = 0;

    invoicedata.forEach(customer => {
      customer.invoices.forEach(invoice => {
        if (invoice.invoiceDate === todayDate) {
          totalProfit += parseFloat(invoice.totalProfit) || 0;
        }
      });
    });

    creditData.forEach(credit => {
      if (credit.invoiceDate === todayDate) {
        totalProfit += parseFloat(credit.totalProfit) || 0;
      }
    });

    return totalProfit;
  };

  const calculateTotalProfitForMonth = () => {
    const currentMonth = getCurrentMonth();
    let totalProfit = 0;

    invoicedata.forEach(customer => {
      customer.invoices.forEach(invoice => {
        const [day, month, year] = invoice.invoiceDate.split('/');
        if (`${month}/${year}` === currentMonth) {
          totalProfit += parseFloat(invoice.totalProfit) || 0;
        }
      });
    });

    creditData.forEach(credit => {
      const [day, month, year] = credit.invoiceDate.split('/');
      if (`${month}/${year}` === currentMonth) {
        totalProfit += parseFloat(credit.totalProfit) || 0;
      }
    });

    return totalProfit;
  };

  const calculateTotalProfitForYear = () => {
    const currentYear = getCurrentYear();
    let totalProfit = 0;

    invoicedata.forEach(customer => {
      customer.invoices.forEach(invoice => {
        const [day, month, year] = invoice.invoiceDate.split('/');
        if (parseInt(year, 10) === currentYear) {
          totalProfit += parseFloat(invoice.totalProfit) || 0;
        }
      });
    });

    creditData.forEach(credit => {
      const [day, month, year] = credit.invoiceDate.split('/');
      if (parseInt(year, 10) === currentYear) {
        totalProfit += parseFloat(credit.totalProfit) || 0;
      }
    });

    return totalProfit;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <div>
        {loadingData ? (
          <p>Loading...</p>
        ) : (
          <table border="1" style={{ margin: "auto" }}>
            <thead>
              <tr>
                <th>Total Profit for Today</th>
                <th>Total Profit for This Month</th>
                <th>Total Profit for This Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{calculateTotalProfitForToday()}</td>
                <td>{calculateTotalProfitForMonth()}</td>
                <td>{calculateTotalProfitForYear()}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProfiCompo;
