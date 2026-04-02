import React from 'react'
import { Link } from 'react-router-dom'

const ReelInfo = ({ item, isOpen, onToggle, onClose, onRef }) => {
    return (
        <div
            className="reel-content"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, width: '100%' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <div className="reel-name" style={{ fontWeight: 600 }}>{item.name ?? item.title ?? 'Untitled'}</div>

                <div style={{ marginLeft: 8 }}>
                    <button
                        aria-label="More"
                        title="More"
                        onClick={(e) => { e.stopPropagation(); onToggle(item._id) }}
                        style={{
                            width: 34,
                            height: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#000',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: 0,
                            borderRadius: 8,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1.4" />
                            <circle cx="12" cy="12" r="1.4" />
                            <circle cx="12" cy="19" r="1.4" />
                        </svg>
                    </button>
                </div>
            </div>

            {item.foodPartner && (
                <Link
                    className="reel-btn"
                    to={"/food-partner/" + item.foodPartner}
                    aria-label="Visit store"
                    style={{ marginTop: 2, alignSelf: 'flex-start' }}
                >
                    Visit store
                </Link>
            )}

            {/* Popover rendered inline; visibility controlled by openPopupId (isOpen prop) */}
            <div
                ref={onRef}
                style={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 56,
                    padding: '14px 16px',
                    background: '#000',
                    color: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    transformOrigin: 'center bottom',
                    zIndex: 40,
                    display: isOpen ? 'block' : 'none'
                }}
            >
                <div style={{ marginBottom: 8, fontSize: 14, lineHeight: '1.2', fontWeight: 700 }}>
                    {`Description of ${item.name ?? item.title ?? 'food'}`}
                </div>
                <div style={{ fontSize: 13, lineHeight: '1.4', color: '#eee', maxHeight: '160px', overflowY: 'auto' }}>
                    {item.description ?? 'No description'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(item._id) }}
                        style={{
                            background: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReelInfo
