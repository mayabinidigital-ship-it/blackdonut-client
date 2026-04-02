import React from 'react'
import { useNavigate } from 'react-router-dom'
import ShinyText from '../../components/ShinyText'
import '../../styles/tagline-shiny.css'
import '../../styles/intro.css'

const IntroDekstop = () => {
  const navigate = useNavigate()

  const handleButtonClick = () => {
    navigate('/home')
  }

  return (
    <div className="intro-page">
      {/* Background with cinematic depth */}
      <div className="hero-background" />
      <div className="hero-overlay" />

      {/* Top Header Section */}
      <header className="intro-header">
        <div className="brand-wrapper">
          <img
            src="/bottombardonot.png"
            alt="Black Donut"
            className="brand-logo"
          />
          <ShinyText
            text="Black Donut"
            speed={3}
            className="brand-name-shiny"
            style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '2px' }}
          />
        </div>
        {/* Optional Sign In button can be added here for a more Netflix feel */}
        {/* <button className="signin-button">Sign In</button> */}
      </header>

      {/* Main Center Content */}
      <main className="hero-content">
        <h1 className="hero-title">
          STORIES BEHIND
          <br />
          <span className="high-contrast-text">EVERY BITE</span>
        </h1>

        <p className="hero-subtitle">
          Discover hidden food gems and extraordinary flavors crafted for the modern palate.
        </p>

        <button
          onClick={handleButtonClick}
          className="cta-button"
        >
          Explore Now
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </main>

      {/* Copyright Footer */}
      <footer className="intro-footer desktop-only">
        {String.fromCharCode(...[169, 32, 50, 48, 50, 53, 32, 83, 97, 110, 106, 105, 98, 32, 75, 117, 109, 97, 114, 32, 68, 101, 107, 97, 32, 8212, 32, 65, 108, 108, 32, 82, 105, 103, 104, 116, 115, 32, 82, 101, 115, 101, 114, 118, 101, 100])}
      </footer>
    </div>
  )
}

export default IntroDekstop
