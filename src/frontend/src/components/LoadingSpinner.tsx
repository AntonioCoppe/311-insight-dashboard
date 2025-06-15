import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => (
  <div className="loading-spinner">
    <div className="skyline-wrapper">
      <div className="skyline-progress">
        <img src={process.env.PUBLIC_URL + '/Skyline.svg'} alt="Loading" />
      </div>
    </div>
    {text && <div className="loading-text">{text}</div>}
  </div>
);

export default LoadingSpinner;
