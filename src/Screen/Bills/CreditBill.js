import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import firestore from '../../firebase';
import { Navigate, useNavigate } from 'react-router-dom';
import useCheckLogin from '../../utils/CheckLogin';
import Grid from 'antd/es/card/Grid';
import { Button, Col, Flex, Input, Row, Table } from 'antd';
import HeaderCompo from '../Componants/Header';

const fetchCreditData = async () => {
    try {
        const creditDataCollection = collection(firestore, 'Creditdata');
        const q = query(creditDataCollection, orderBy('customerName')); // Order the data by customerName
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

const CreditDataTable = () => {
    useCheckLogin();
    const [creditData, setCreditData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchCreditData();
            setCreditData(data);
        };

        fetchData();
    }, []);

    // Filter credit data based on the search term
    const filteredData = creditData.filter(data =>
        data.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleRowDoubleClick = (data) => {
        // Redirect to next page with selected row data

        navigate("/CreditPrintBill", {
            state: { selectedData: data, },
        });
    };
    const handleDeleteCollection = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'Creditdata'));
            const deletePromises = [];

            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });

            await Promise.all(deletePromises);
            setCreditData([]); // Update state to clear the data
            console.log('Collection successfully deleted!');
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };
    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Mobile Number',
            dataIndex: 'MoNo',
            key: 'MoNo',
        },
        {
            title: 'Invoice Date',
            dataIndex: 'invoiceDate',
            key: 'invoiceDate',
        },
    ];


    return (
        <Col style={{ padding: "5%" }}>
            <HeaderCompo title={"Customer Data"} />

            <Flex justify='space-between'>
                <Input.Search
                    placeholder="Search by Customer Name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Button type='primary' onClick={() => handleDeleteCollection()}>Delete Data</Button>
            </Flex>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                onRow={(record) => ({
                    onDoubleClick: () => handleRowDoubleClick(record),
                })}
            />
        </Col>
    );
};

export default CreditDataTable;
