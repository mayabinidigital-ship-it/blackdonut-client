import React, { useState, useRef } from 'react'

const ReelVideo = ({ src, isMuted, videoRef, children }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [centerOverlay, setCenterOverlay] = useState({ visible: false, type: '' })
    const overlayTimeoutRef = useRef(null)

    // Local ref to access video for play/pause toggle
    // We also need to pass the element to the parent via videoRef prop
    const localVideoRef = useRef(null)

    const handleRef = (el) => {
        localVideoRef.current = el
        if (videoRef) videoRef(el)
    }

    const handleCenterToggle = () => {
        const vid = localVideoRef.current
        if (!vid) return

        if (vid.paused) {
            setCenterOverlay({ visible: true, type: 'play' })
            vid.play().catch(() => { })
        } else {
            setCenterOverlay({ visible: true, type: 'pause' })
            vid.pause()
        }

        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current)
        overlayTimeoutRef.current = setTimeout(() => {
            setCenterOverlay({ visible: false, type: '' })
        }, 700)
    }

    return (
        <>
            <video
                ref={handleRef}
                className="reel-video"
                src={src}
                muted={isMuted}
                playsInline
                loop
                preload="metadata"
                onLoadedData={() => setIsLoaded(true)}
            />

            {!isLoaded && (
                <div className="video-shimmer-overlay">
                    <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, color: 'white', opacity: 0.5 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                    </div>
                </div>
            )}

            <div className="reel-overlay">
                <div className="reel-overlay-gradient" aria-hidden="true" />

                {/* Center Click Area */}
                <div
                    onClick={handleCenterToggle}
                    role="button"
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: '20%',
                        right: '20%',
                        top: '20%',
                        bottom: '40%',
                        pointerEvents: 'auto',
                        background: 'transparent',
                        zIndex: 1,
                    }}
                />

                {/* Center Overlay Icon */}
                {centerOverlay.visible && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            background: 'rgba(0,0,0,0.45)',
                            color: '#fff'
                        }}
                    >
                        {centerOverlay.type === 'pause' ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        )}
                    </div>
                )}

                {/* Children (Actions and Info) */}
                {children}
            </div>
        </>
    )
}

export default ReelVideo
