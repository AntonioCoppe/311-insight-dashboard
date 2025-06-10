import React from 'react';

interface LiquidGlassWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const LiquidGlassWrapper: React.FC<LiquidGlassWrapperProps> = ({
  children,
  className = '',
}) => (
  <div className={`liquidGlass-wrapper ${className}`}>
    <div className="liquidGlass-effect" />
    <div className="liquidGlass-tint" />
    <div className="liquidGlass-shine" />
    <div className="liquidGlass-text">{children}</div>
  </div>
);

export default LiquidGlassWrapper;
