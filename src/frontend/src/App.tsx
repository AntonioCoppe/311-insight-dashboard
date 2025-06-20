import './App.css';
import HistoricalLineChart from './components/HistoricalLineChart';
import YearlyBarChart from './components/YearlyBarChart';
import { MapView } from './components/MapView';
import LiquidGlassWrapper from './components/LiquidGlassWrapper';

function App() {
  return (
    <>
      <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight" >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="App page-content">
        <LiquidGlassWrapper className="menu">
          <h1>311 Insight Dashboard</h1>
        </LiquidGlassWrapper>
        <div className="dashboard-grid">
          <HistoricalLineChart />
          <YearlyBarChart />
          <MapView height="60vh" />
        </div>
      </div>
    </>
  );
}

export default App;
