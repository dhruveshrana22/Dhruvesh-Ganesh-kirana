import React, { useState } from 'react';
import { DatePicker } from 'antd';

const DateRangeFilter = ({ onChange }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        onChange(start, end);
    };

    return (
        <DatePicker.RangePicker
            format="YYYY-MM-DD"
            value={[startDate, endDate]}
            onChange={handleDateChange}
        />
    );
};

export default DateRangeFilter;
