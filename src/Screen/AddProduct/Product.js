import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./Productstyle.css";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import firestore from "../../firebase";
import useCheckLogin from "../../utils/CheckLogin";
import Grid from "antd/es/card/Grid";
import { Col, Flex, Input, Table } from "antd";
import { Group } from "antd/es/avatar";
import HeaderCompo from "../Componants/Header";
import { inputstyle } from "../../utils/Theam";

function ProductManagement() {
  useCheckLogin();

  const [formData, setFormData] = useState({
    _id:"",
    name: "",
    price: "",
    salePrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firebasedata, setFirebasedata] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // const fetchProducts = async () => {
  //   setLoading(true);
  //   try {
  //     const querySnapshot = await getDocs(collection(firestore, "products"));
  //     const productsData = [];
  //     querySnapshot.forEach((doc) => {
  //       productsData.push({ id: doc.id, ...doc.data() });
  //     });
  //     setFirebasedata(productsData);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching products: ", error);
  //     setLoading(false);
  //   }
  // };
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/products"
      );
      const productsData = await response.json();
      setFirebasedata(productsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products: ", error);
      setLoading(false);
    }
  };

  // const saveProduct = async () => {
  //   setLoading(true); // Show loader
  //   const { name, price, salePrice } = formData;
  //   // Check if the name already exists
  //   const existingProduct = firebasedata.find(
  //     (product) => product.name.toLowerCase() === name.toLowerCase()
  //   );

  //   if (existingProduct) {
  //     alert(
  //       "Product with the same name already exists. Please enter a different name."
  //     );
  //     setLoading(false); // Hide loader
  //     return; // Exit the function
  //   }
  //   if (name.trim() !== "" && price.trim() !== "" && salePrice.trim() !== "") {
  //     try {
  //       const docRef = await addDoc(
  //         collection(firestore, "products"),
  //         formData
  //       );
  //       setFormData({
  //         name: "",
  //         price: "",
  //         salePrice: "",
  //       });
  //       fetchProducts();
  //     } catch (error) {
  //       console.error("Error adding document: ", error);
  //       setLoading(false); // Hide loader on error
  //     }
  //   } else {
  //     alert("Please fill in all fields.");
  //     setLoading(false); // Hide loader on validation failure
  //   }
  // };
  const saveProduct = async () => {
    setLoading(true); // Show loader
    const { name, price, salePrice } = formData;
    // Check if the name already exists
    const existingProduct = firebasedata.find(
      (product) => product.name.toLowerCase() === name.toLowerCase()
    );

    if (existingProduct) {
      alert(
        "Product with the same name already exists. Please enter a different name."
      );
      setLoading(false); // Hide loader
      return; // Exit the function
    }
    if (name.trim() !== "" && price.trim() !== "" && salePrice.trim() !== "") {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/productsUpdate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        if (!response.ok) {
          throw new Error("Error adding product");
        }
        setFormData({
          name: "",
          price: "",
          salePrice: "",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error adding product: ", error);
        setLoading(false); // Hide loader on error
      }
    } else {
      alert("Please fill in all fields.");
      setLoading(false); // Hide loader on validation failure
    }
  };

  // const updateProduct = async () => {
  //   setLoading(true); // Show loader
  //   const { id, name, price, salePrice } = formData;
  //   if (id && name && price && salePrice) {
  //     try {
  //       await updateDoc(doc(firestore, "products", id), {
  //         name,
  //         price,
  //         salePrice,
  //       });
  //       fetchProducts();
  //       // Clear the form data after updating
  //       setFormData({
  //         name: "",
  //         price: "",
  //         salePrice: "",
  //       });
  //     } catch (error) {
  //       console.error("Error updating product: ", error);
  //       setLoading(false); // Hide loader on error
  //     }
  //   } else {
  //     alert("Please select a product to update.");
  //     setLoading(false); // Hide loader on validation failure
  //   }
  // };
  const updateProduct = async () => {
    setLoading(true);
    const { _id, name, price, salePrice } = formData;
    console.log("id", _id);
    if (_id && name && price && salePrice) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/products/${_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, price, salePrice }),
          }
        );
        if (!response.ok) {
          throw new Error("Error updating product");
        }
        fetchProducts();
        setFormData({
          id: "",
          name: "",
          price: "",
          salePrice: "",
        });
      } catch (error) {
        console.error("Error updating product: ", error);
        setLoading(false);
      }
    } else {
      alert("Please select a product to update.");
      setLoading(false);
    }
  };
  const deleteProduct = async () => {
    const { _id } = formData;
    if (_id) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/products/${_id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error deleting product');
        }
        fetchProducts();
        setFormData({
          name: "",
          price: "",
          salePrice: "",
        });
      } catch (error) {
        console.error('Error deleting product: ', error);
      }
    } else {
      alert("Please select a product to delete.");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = firebasedata.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Purchase Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
    },
  ];

  const onRowClick = (record) => {
    setFormData(record);
  };

  return (
    <>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <Grid className="container">
          <HeaderCompo title="Product" />
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
                Search
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </Flex>

              <Flex align="center" justify="space-between">
                Product Name:
                <Input
                  style={{ width: inputstyle }}
                  autoFocus
                  type="text"
                  id="productName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Purchase Price:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="productPrice"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </Flex>
              <Flex align="center" justify="space-between">
                Sale Price:
                <Input
                  style={{ width: inputstyle }}
                  type="text"
                  id="newField"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, salePrice: e.target.value })
                  }
                />
              </Flex>
            </Grid>
          </Col>
          <Flex justify="center" gap={10}>
            <button onClick={saveProduct}>Save</button>
            <button onClick={updateProduct}>Update</button>
            <button onClick={deleteProduct}>Delete</button>
          </Flex>
          <Table
            id="delerProductTable"
            columns={columns}
            dataSource={filteredProducts}
            onRow={(record) => ({
              onClick: () => onRowClick(record),
            })}
          />
        </Grid>
      )}
    </>
  );
}

export default ProductManagement;
