import React from 'react'

const NewMealsPopup = ({ newMealsCount, onLoad, onDismiss }) => {
    return (
        <div
            style={{
                position: 'fixed',
                right: 20,
                bottom: 100,
                background: '#000',
                border: '2px solid #1e6aff',
                borderRadius: '12px',
                padding: '16px',
                zIndex: 98,
                width: '280px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                animation: 'slideInRight 0.4s ease-out'
            }}
        >
            <h3 style={{ margin: '0 0 12px 0', color: '#1e6aff', fontSize: '16px', fontWeight: '700' }}>
                🍽️ New Meals Loading...
            </h3>
            <p style={{ margin: '0 0 12px 0', color: '#999', fontSize: '12px' }}>
                Swipe up to explore {newMealsCount} new delicious meals!
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={onLoad}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#1e6aff',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                >
                    Load Now
                </button>
                <button
                    onClick={onDismiss}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#999',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Later
                </button>
            </div>
            <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}

export default NewMealsPopup
