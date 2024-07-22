import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import "../AddProduct/Productstyle.css";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import firestore from '../../firebase';
import useCheckLogin from '../../utils/CheckLogin';
import Grid from 'antd/es/card/Grid';
import HeaderCompo from '../Componants/Header';
import { Button, Col, Flex, Input, Table } from 'antd';
import { inputstyle } from '../../utils/Theam';

function Kharcho() {
  useCheckLogin();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [firebasedata, setFirebasedata] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'expense'));
      const productsData = [];
      querySnapshot.forEach(doc => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setFirebasedata(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products: ', error);
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    setLoading(true); // Show loader
    const { name, price, date } = formData;
    // Check if the name already exists

    if (name.trim() !== '' && price.trim() !== '' && date.trim() !== '') {
      try {
        const docRef = await addDoc(collection(firestore, 'expense'), formData);
        setFormData({
          name: '',
          price: '',
          date: ''
        });
        fetchProducts();
      } catch (error) {
        console.error("Error adding document: ", error);
        setLoading(false); // Hide loader on error
      }
    } else {
      alert('Please fill in all fields.');
      setLoading(false); // Hide loader on validation failure
    }
  };

  const updateProduct = async () => {
    setLoading(true); // Show loader
    const { id, name, price, date } = formData;
    if (id && name && price && date) {
      try {
        await updateDoc(doc(firestore, 'expense', id), {
          name,
          price,
          date
        });
        fetchProducts();
        // Clear the form data after updating
        setFormData({
          name: '',
          price: '',
          date: ''
        });
      } catch (error) {
        console.error("Error updating product: ", error);
        setLoading(false); // Hide loader on error
      }
    } else {
      alert('Please select a product to update.');
      setLoading(false); // Hide loader on validation failure
    }
  };


  const deleteProduct = async () => {
    const { id } = formData;
    if (id) {
      try {
        await deleteDoc(doc(firestore, 'expense', id));
        fetchProducts();
        // Clear the form data after deleting
        setFormData({
          name: '',
          price: '',
          date: ''
        });
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    } else {
      alert('Please select a product to delete.');
    }
  };


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = firebasedata.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total price
  const totalPrice = filteredProducts.reduce((total, product) => total + parseFloat(product.price), 0);
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];
  return (
    <>
      {loading ? (<Grid className="loader"></Grid>) : (
        <Grid className="container">
          <HeaderCompo title={"Expanse Management"} />
          <Flex justify="space-between" align="center">
            Search:
            <Input style={{ width: inputstyle }} type="text" id="search" value={searchQuery} onChange={handleSearch} />
          </Flex>

          <Flex justify="space-between" align="center">
            Expanse Name:
            <Input style={{ width: inputstyle }} type="text" id="productName" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </Flex>
          <Flex justify="space-between" align="center">
            Expanse Price:
            <Input style={{ width: inputstyle }} type="text" id="productPrice" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </Flex>
          <Flex justify="space-between" align="center">
            <label htmlFor="productDate">Date:</label>
            <Input style={{ width: inputstyle }} type="date" id="productDate" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </Flex>
          <Col xs={24} xl={12}>
            <Flex justify="space-between" align="center">
              <Button type='primary' onClick={saveProduct}>Save</Button>
              <Button type='primary' onClick={updateProduct}>Update</Button>
              <Button type='primary' onClick={deleteProduct}>Delete</Button>
            </Flex>
          </Col>
          <Flex align="center" justify='center' style={{ backgroundColor: 'gold' }}>
            <label> Total Loss:{totalPrice}</label>
          </Flex>
          <Flex justify='center'>
            <Table
              dataSource={filteredProducts}
              columns={columns}
              rowKey="id"
              onRow={(record) => {
                return {
                  onClick: () => setFormData(record), // Click row
                };
              }}
              scroll={{ x: "100%" }}
            />
          </Flex>
        </Grid>
      )}
    </>
  );
}

export default Kharcho;
