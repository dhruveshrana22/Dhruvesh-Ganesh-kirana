import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomer,
  deleteCustomer,
  updateCustomer,
} from "../../redux/AddCustomer/Addcustomerredux";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import firestore from "../../firebase";
import { Button, Col, Flex, Input, Space, Spin, Table } from "antd";
import useCheckLogin from "../../utils/CheckLogin";
import Grid from "antd/es/card/Grid";
import HeaderCompo from "../Componants/Header";
import { inputstyle } from "../../utils/Theam";
import axios from "axios";

const Addcustomers = () => {
  useCheckLogin();

  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    _id: "",
    customerName: "",
    mobileNumber: "",
    villageName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    // Fetch customers from Firestore
    fetchData();
  }, []);
  // const fetchData = async () => {
  //   setLoading(true); // Set loading to true when fetching data
  //   const customerCollection = collection(firestore, "customers");
  //   const snapshot = await getDocs(customerCollection);
  //   const customersData = snapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //   }));
  //   setCustomers(customersData);
  //   setLoading(false); // Set loading to false when data is fetched
  // };
  const fetchData = async () => {
    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customers/allCustomer"
      );
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
    setLoading(false); // Set loading to false when data is fetched
  };
  // async function saveCustomer() {
  //   setLoading(true); // Set loading to true when saving data
  //   const { customerName, mobileNumber, villageName, description } = formData;
  //   if (
  //     customerName.trim() !== "" &&
  //     mobileNumber.trim() !== "" &&
  //     villageName.trim() !== "" &&
  //     description.trim() !== ""
  //   ) {
  //     // Check if customer name already exists
  //     const existingCustomer = customers.find(
  //       (customer) =>
  //         customer.customerName.toLowerCase() === customerName.toLowerCase()
  //     );
  //     if (existingCustomer) {
  //       setLoading(false); // Set loading to false if validation fails
  //       alert("Customer with the same name already exists!");
  //       return; // Exit function
  //     }
  //     try {
  //       // Add the customer to the "customers" collection
  //       const customerDocRef = await addDoc(
  //         collection(firestore, "customers"),
  //         {
  //           customerName,
  //           mobileNumber,
  //           villageName,
  //           description,
  //         }
  //       );

  //       // Create a new collection named "invoices" for the customer
  //       const invoicesCollectionRef = collection(customerDocRef, "invoices");

  //       // Add a sample invoice document to the "invoices" collection

  //       // Update state with new customer data
  //       setCustomers([
  //         ...customers,
  //         {
  //           id: customerDocRef.id,
  //           customerName,
  //           mobileNumber,
  //           villageName,
  //           description,
  //         },
  //       ]);
  //       setFormData({
  //         id: null,
  //         customerName: "",
  //         mobileNumber: "",
  //         villageName: "",
  //         description: "",
  //       });
  //       setLoading(false); // Set loading to false after data is saved
  //     } catch (error) {
  //       setLoading(false); // Set loading to false if an error occurs
  //       console.error("Error adding document: ", error);
  //     }
  //   } else {
  //     setLoading(false); // Set loading to false if validation fails
  //     alert("Please fill in all fields.");
  //   }
  // }
  async function saveCustomer() {
    setLoading(true); // Set loading to true when saving data
    const { customerName, mobileNumber, villageName, description } = formData;
    if (
      customerName.trim() !== "" &&
      mobileNumber.trim() !== "" &&
      villageName.trim() !== "" &&
      description.trim() !== ""
    ) {
      // Check if customer name already exists
      const existingCustomer = customers.find(
        (customer) =>
          customer.customerName.toLowerCase() === customerName.toLowerCase()
      );
      if (existingCustomer) {
        setLoading(false); // Set loading to false if validation fails
        alert("Customer with the same name already exists!");
        return; // Exit function
      }
      try {
        const response = await axios.post(
          "http://localhost:5000/api/customers/createCustomer",
          {
            customerName,
            mobileNumber,
            villageName,
            description,
          }
        );

        // Update state with new customer data
        setCustomers([...customers, response.data]);
        setFormData({
          id: null,
          customerName: "",
          mobileNumber: "",
          villageName: "",
          description: "",
        });
      } catch (error) {
        console.error("Error adding customer: ", error);
      }
      setLoading(false); // Set loading to false after data is saved
    } else {
      setLoading(false); // Set loading to false if validation fails
      alert("Please fill in all fields.");
    }
  }
  // async function updateCustomerData() {
  //   setLoading(true); // Set loading to true when updating data
  //   const { id, customerName, mobileNumber, villageName, description } =
  //     formData;
  //   if (
  //     id &&
  //     customerName.trim() !== "" &&
  //     mobileNumber.trim() !== "" &&
  //     villageName.trim() !== "" &&
  //     description.trim() !== ""
  //   ) {
  //     try {
  //       await updateDoc(doc(firestore, "customers", id), {
  //         customerName,
  //         mobileNumber,
  //         villageName,
  //         description,
  //       });
  //       const updatedCustomers = customers.map((customer) => {
  //         if (customer.id === id) {
  //           return {
  //             ...customer,
  //             customerName,
  //             mobileNumber,
  //             villageName,
  //             description,
  //           };
  //         }
  //         return customer;
  //       });
  //       setCustomers(updatedCustomers);
  //       setFormData({
  //         id: null,
  //         customerName: "",
  //         mobileNumber: "",
  //         villageName: "",
  //         description: "",
  //       });
  //       setLoading(false); // Set loading to false after data is updated
  //     } catch (error) {
  //       setLoading(false); // Set loading to false if an error occurs
  //       console.error("Error updating document: ", error);
  //     }
  //   } else {
  //     setLoading(false); // Set loading to false if validation fails
  //     alert("Please fill in all fields.");
  //   }
  // }
  async function updateCustomerData() {
    setLoading(true); // Set loading to true when updating data
    const { _id, customerName, mobileNumber, villageName, description } =
      formData;
    if (
      _id &&
      customerName.trim() !== "" &&
      mobileNumber.trim() !== "" &&
      villageName.trim() !== "" &&
      description.trim() !== ""
    ) {
      try {
        await axios.put(
          `http://localhost:5000/api/customers/updateCustomer/${_id}`,
          {
            customerName,
            mobileNumber,
            villageName,
            description,
          }
        );

        const updatedCustomers = customers.map((customer) => {
          if (customer._id === _id) {
            return {
              ...customer,
              customerName,
              mobileNumber,
              villageName,
              description,
            };
          }
          return customer;
        });
        setCustomers(updatedCustomers);
        setFormData({
          id: null,
          customerName: "",
          mobileNumber: "",
          villageName: "",
          description: "",
        });
      } catch (error) {
        console.error("Error updating customer: ", error);
      }
      setLoading(false); // Set loading to false after data is updated
    } else {
      setLoading(false); // Set loading to false if validation fails
      alert("Please fill in all fields.");
    }
  }
  // async function deleteCustomerData(id) {
  //   setLoading(true); // Set loading to true when deleting data
  //   try {
  //     await deleteDoc(doc(firestore, "customers", id));
  //     const filteredCustomers = customers.filter(
  //       (customer) => customer.id !== id
  //     );
  //     setCustomers(filteredCustomers);
  //     setFormData({
  //       id: null,
  //       customerName: "",
  //       mobileNumber: "",
  //       villageName: "",
  //       description: "",
  //     });
  //     setLoading(false); // Set loading to false after data is deleted
  //   } catch (error) {
  //     setLoading(false); // Set loading to false if an error occurs
  //     console.error("Error deleting document: ", error);
  //   }
  // }

  async function deleteCustomerData(_id) {
    setLoading(true); // Set loading to true when deleting data
    if (
      _id 
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/delete/${_id}`);
        const filteredCustomers = customers.filter(
          (customer) => customer._id !== _id
        );
        setCustomers(filteredCustomers);
        setFormData({
          id: "",
          customerName: "",
          mobileNumber: "",
          villageName: "",
          description: "",
        });
      } catch (error) {
        console.error("Error deleting customer: ", error);
      }

      setLoading(false); // Set loading to false after data is deleted
    } else {
      setLoading(false); // Set loading to false if validation fails
      alert("Please fill in all fields.");
    }
  }
  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.mobileNumber.includes(searchQuery)
  );
  // Columns for Ant Design Table
  const columns = [
    {
      title: "Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Village Name",
      dataIndex: "villageName",
      key: "villageName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (text, record) => (
    //     <Space size="middle">
    //       <Button type="primary" onClick={() => setFormData({ ...record })}>
    //         Edit
    //       </Button>
    //       <Button type="danger" onClick={() => deleteCustomerData(record.id)}>
    //         Delete
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <>
      {loading ? (
        <Grid
          style={{
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large"></Spin>
        </Grid>
      ) : (
        <div className="container">
          <HeaderCompo title={"Customer Management"} />
          <Col
            xs={{ span: 48 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 12 }}
          >
            <Grid
              style={{
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Flex align="center" justify="space-between">
                Search:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Customer Name:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Mobile Number:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Village Name:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="villageName"
                  value={formData.villageName}
                  onChange={(e) =>
                    setFormData({ ...formData, villageName: e.target.value })
                  }
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Description:
                <Input.TextArea
                  style={{ width: inputstyle }}
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Flex>
            </Grid>
          </Col>

          <Flex justify="center" gap={10}>
            <button onClick={saveCustomer}>
              {loading ? "Saving..." : "Save"}
            </button>

            <button onClick={updateCustomerData}>
              {loading ? "Updating..." : "Update"}
            </button>
            <button onClick={() => deleteCustomerData(formData._id)}>
              {loading ? "Deleting..." : "Delete"}
            </button>
          </Flex>

          {/* <table id="customerTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Village Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setFormData({ ...customer })}
                >
                  <td>{customer.customerName}</td>
                  <td>{customer.mobileNumber}</td>
                  <td>{customer.villageName}</td>
                  <td>{customer.description}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey={(customer) => customer.id}
            onRow={(customer) => ({
              onClick: () => setFormData({ ...customer }),
            })}
            scroll={{ x: "100%" }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
    </>
  );
};

export default Addcustomers;
