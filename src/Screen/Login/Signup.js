import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Form, Row, Col, message } from 'antd';
// import 'antd/dist/antd.css';
import { useNavigate } from 'react-router-dom';
import { setFormData } from '../../redux/AddUSer';
import { useDispatch } from 'react-redux';
import { addDoc, collection } from 'firebase/firestore';
import firestore from '../../firebase';


const Signup = () => {
    const [form] = Form.useForm();
    const [messageText, setMessageText] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSignup = async (formData) => {




        // Update invoices collection for the selected customer
        try {

            const invoicesCollectionRef = collection(firestore, 'user');
            await addDoc(invoicesCollectionRef, formData);
            dispatch(setFormData(formData));
            navigate('/');

         
        } catch (error) {
            console.error('Error adding invoice data to Firestore:', error);
        }


    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2>Signup</h2>
            {/* <Form form={form} > */}
            <Form form={form} onFinish={handleSignup}>
                <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
                    <Input placeholder="Username" />
                </Form.Item>
                <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
                    <Input type="email" placeholder="Email" />
                </Form.Item>
                <Form.Item name="mobile" rules={[{ required: true, message: 'Please enter your mobile number' }]}>
                    <Input type="tel" placeholder="Mobile" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Signup</Button>
                        </Col>
                        <Col span={12}>
                            <Button type="default" onClick={() => form.resetFields()} style={{ width: '100%' }}>Reset</Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Signup;
