import React, { useRef } from 'react'

const ReelActionButtons = ({
    item,
    isLiked,
    likeCount,
    isSaved,
    saveCount,
    commentCount,
    isMuted,
    onMuteToggle,
    onLike,
    onSave,
    onComment
}) => {
    const likeBtnRef = useRef(null)

    const animateHeart = async () => {
        if (!likeBtnRef.current) return
        try {
            const mod = await import('gsap')
            const gsap = mod?.default || mod
            const svg = likeBtnRef.current.querySelector('svg')
            if (svg) {
                gsap.fromTo(svg, { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 })
            }
        } catch (e) {
            console.error('GSAP animation error:', e)
        }
    }

    const handleLike = (e) => {
        e.stopPropagation()
        if (onLike) {
            // Trigger animation if turning to "liked" state (or just always trigger it?)
            // Original code triggers it on click.
            // We can trigger it optimistically.
            // Actually, original code called animateHeart inside the click handler.
            // We'll call it here.
            // Check if we are liking (not unliking) to animate? 
            // Original code: animateHeart(item._id, newLikeState)
            // We don't know the new state for sure here unless we calculate it, but usually toggle.
            // Let's assume onLike handles logic, we just animate.
            // Wait, original code: animateHeart(item._id, newLikeState).
            // Here we can just animate.
            animateHeart()
            onLike()
        }
    }

    return (
        <div className="reel-actions">
            <div className="reel-action-group" style={{ order: '-1' }}>
                <button
                    onClick={onMuteToggle}
                    className="reel-action mute-toggle"
                    aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                    {isMuted ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="reel-action-group">
                <button
                    ref={likeBtnRef}
                    onClick={handleLike}
                    className="reel-action"
                    aria-label="Like"
                >
                    {isLiked ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff3b30" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                    )}
                </button>
                <div className="reel-action__count">{likeCount}</div>
            </div>

            <div className="reel-action-group">
                <button
                    className="reel-action"
                    onClick={onSave}
                    aria-label="Bookmark"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                </button>
                <div className="reel-action__count">{saveCount}</div>
            </div>

            <div className="reel-action-group">
                <button
                    className="reel-action"
                    aria-label="Comments"
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        pointerEvents: 'auto',
                        touchAction: 'manipulation'
                    }}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onComment(item._id)
                    }}
                    onTouchEnd={(e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault()
                            e.stopPropagation()
                            onComment(item._id)
                        }
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                </button>
                <div className="reel-action__count">{commentCount}</div>
            </div>
        </div>
    )
}

export default ReelActionButtons
