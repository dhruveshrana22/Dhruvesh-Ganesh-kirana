import { useLocation } from 'react-router-dom';

const PrintPreviewData = () => {
    const location = useLocation();
    const selectedCustomerData = location.state.selectedCustomerData;

    // Render selected customer data in the print preview screen

    return (
        // JSX to render the print preview screen with selected customer data
        // Example:
        <div>
            <h2>Print Preview</h2>
            {selectedCustomerData && (
                <div>
                    <p>Customer Name: {selectedCustomerData.customerName}</p>
                    {/* Render other customer data as needed */}
                </div>
            )}
        </div>
    );
};

export default PrintPreviewData;
