import React, { useState, useEffect } from 'react';
import { Input, Button, Form, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import firestore from '../../firebase';
import { useDispatch, useSelector } from "react-redux";
import actions from "../../redux/actions";
const { Title } = Typography;

export const fetchData = async () => {
    try {
        const userCollectionRef = collection(firestore, 'user');
        const dataSnapshot = await getDocs(userCollectionRef);
        const users = [];
        dataSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error; // Re-throw the error to handle it elsewhere if needed
    }
};
const { setCurrentUserData } = actions;
const LoginForm = () => {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDataAndSetUserData = async () => {
            try {
                setLoading(true);
                const users = await fetchData();
                setUserData(users);
            } catch (error) {
                setError('Error fetching user data. Please try again later.');
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndSetUserData();
    }, []);
    const { currentUserData } = useSelector((s) => s.currentUser);
    const handleLogin = (values) => {
        const { email, password } = values;

        const matchedUser = userData.find(user => user.email === email && user.password === password);

        if (matchedUser) {
            navigate('/DhruveshHome');
            dispatch(setCurrentUserData(matchedUser));
            setError('');
        } else {
            setError('Invalid email or password');
        }
    };

    const goToSignup = () => {
        navigate('/Signup');
    };

    return (
        <div id="main" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <Title level={2}>Login</Title>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Form form={form} onFinish={handleLogin}>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Login</Button>
                    </Form.Item>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </Form>
            )}
            {/* <Button type="link" onClick={goToSignup}>Sign up</Button>  */}
        </div>
    );
};

export default LoginForm;
