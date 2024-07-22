import React from 'react';
import { useSpring, animated } from 'react-spring';
import { Typography } from 'antd';


const { Text } = Typography;

export const AnimatedText = ({ children, style }) => {
    const props = useSpring({
        transform: 'translateX(0)',
        from: { transform: 'translateX(50%)' },
        config: { duration: 1500 }, // Adjust the duration as needed
    });

    return <animated.div style={props}><Text style={[{ fontWeight: "bold", }]}>{children}</Text></animated.div>;
};
