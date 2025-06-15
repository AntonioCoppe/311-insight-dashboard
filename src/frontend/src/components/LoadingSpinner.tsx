import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => (
  <div className="loading-spinner">
    <img src={process.env.PUBLIC_URL + '/logo.svg'} alt="Loading" />
    {text && <div className="loading-text">{text}</div>}
  </div>
);

export default LoadingSpinner;
