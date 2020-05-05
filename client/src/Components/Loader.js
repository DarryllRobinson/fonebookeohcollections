import React from 'react';

const Loader = () => {
    return (
        <div className="backdrop">
            <div className="loader text-center">
                <h2>Loading, please wait...</h2>
                <div className="spinner-border" />
            </div>
        </div>
    );
}
export default Loader;