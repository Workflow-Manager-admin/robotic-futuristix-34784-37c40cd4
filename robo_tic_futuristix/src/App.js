import React from 'react';
import './App.css';
import RoboTicFuturistix from './RoboTicFuturistix';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app" style={{ minHeight: "100vh", background: "#1A1A2E" }}>
      <nav className="navbar" style={{ background: "#141a2f", border: 0, boxShadow: "0 4px 30px #00d2df17" }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: "#00D2DF" }}>🤖</span> RoboTic Futuristix
            </div>
            <div style={{ fontWeight: 400, fontSize: "1.02rem", color: "#0ff9", letterSpacing: ".02em" }}>
              <span style={{fontFamily:'Orbitron, monospace'}}>Metallic / Neon</span>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <RoboTicFuturistix />
      </main>
    </div>
  );
}

export default App;