import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import firestore from '../../firebase';
import { Table, Input, Button, Space, Flex, Col } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import Grid from 'antd/es/card/Grid';
import HeaderCompo from '../Componants/Header';

const { Search } = Input;

const AddDealers = () => {
    const [dealers, setDealers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        id: null,
        dealerName: '',
        mobileNumber: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const dealerCollection = collection(firestore, 'dealers');
            const snapshot = await getDocs(dealerCollection);
            const dealerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDealers(dealerData);
        };
        fetchData();
    }, []);

    async function saveDealer() {
        const { dealerName, mobileNumber, location, description } = formData;
        if (dealerName.trim() !== '' && mobileNumber.trim() !== '' && location.trim() !== '' && description.trim() !== '') {
            try {
                // Check if a dealer with the same name already exists
                const q = query(collection(firestore, "dealers"), where("dealerName", "==", dealerName));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    alert('A dealer with the same name already exists.');
                    return;
                }

                const dealerDocRef = await addDoc(collection(firestore, "dealers"), {
                    dealerName,
                    mobileNumber,
                    location,
                    description
                });
                setDealers([...dealers, { id: dealerDocRef.id, dealerName, mobileNumber, location, description }]);
                setFormData({ id: null, dealerName: '', mobileNumber: '', location: '', description: '' });
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    }

    async function updateDealerData() {
        const { id, dealerName, mobileNumber, location, description } = formData;
        if (id && dealerName.trim() !== '' && mobileNumber.trim() !== '' && location.trim() !== '' && description.trim() !== '') {
            try {
                await updateDoc(doc(firestore, "dealers", id), {
                    dealerName,
                    mobileNumber,
                    location,
                    description
                });
                const updatedDealers = dealers.map(dealer => {
                    if (dealer.id === id) {
                        return { ...dealer, dealerName, mobileNumber, location, description };
                    }
                    return dealer;
                });
                setDealers(updatedDealers);
                setFormData({ id: null, dealerName: '', mobileNumber: '', location: '', description: '' });
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    }

    async function deleteDealerData(id) {
        try {
            await deleteDoc(doc(firestore, "dealers", id));
            const filteredDealers = dealers.filter(dealer => dealer.id !== id);
            setDealers(filteredDealers);
            setFormData({ id: null, dealerName: '', mobileNumber: '', location: '', description: '' });
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }

    function handleSearch(value) {
        setSearchQuery(value);
    }

    const filteredDealers = dealers.filter(dealer =>
        dealer.dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.mobileNumber.includes(searchQuery)
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'dealerName',
            key: 'dealerName',
        },
        {
            title: 'Mobile Number',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <a onClick={() => setFormData({ ...record })}>Edit</a>
                    <a onClick={() => deleteDealerData(record.id)}>Delete</a>
                </Space>
            ),
        },
    ];

    return (
        <Grid className="container">
            <HeaderCompo title={"Dealer Management"} />

            <Flex className="search-input">
                <Search placeholder="Search" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} enterButton />
            </Flex>
            <Flex className="input-group">
                <Input placeholder="Dealer Name" value={formData.dealerName} onChange={e => setFormData({ ...formData, dealerName: e.target.value })} />
            </Flex>
            <Flex className="input-group">
                <Input placeholder="Mobile Number" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
            </Flex>
            <Flex className="input-group">
                <Input placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </Flex>
            <Flex className="input-group">
                <Input placeholder="description." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Flex>
            <Flex className="btn-group" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Button type="primary" onClick={saveDealer}>Save</Button>
                <Button type="primary" onClick={updateDealerData}>Update</Button>
            </Flex>

            <Col>
                <Table columns={columns} dataSource={filteredDealers} rowKey="id" style={{ overflowX: "scroll" }} />
            </Col>
        </Grid>
    );
}

export default AddDealers;
