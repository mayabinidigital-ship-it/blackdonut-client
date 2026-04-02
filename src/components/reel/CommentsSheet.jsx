import React from 'react'

const CommentsSheet = ({
    comments,
    loading,
    isOpen,
    onClose,
    onDelete,
    onSubmit,
    commentText,
    setCommentText,
    submitting,
    isMobile
}) => {
    if (!isOpen) return null

    // Desktop View
    if (!isMobile) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'flex-end',
                    overflow: 'hidden'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: '#000',
                        width: '600px',
                        height: '70vh',
                        borderRadius: '12px',
                        position: 'absolute',
                        left: '50%',
                        bottom: '80px',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
                        animation: 'slideUp 0.3s ease-out',
                        margin: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 16px 12px',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                            Comments ({comments.length})
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#999',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px 8px'
                            }}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Comments List */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            minHeight: 0
                        }}
                    >
                        {loading ? (
                            <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                Loading comments...
                            </div>
                        ) : comments.length === 0 ? (
                            <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment._id}
                                    style={{
                                        background: '#111',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #333'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        {comment.user?.profileImage && (
                                            <img
                                                src={comment.user.profileImage}
                                                alt={comment.user.fullName}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#fff',
                                                    marginBottom: '2px'
                                                }}
                                            >
                                                {comment.user?.fullName || comment.user?.name || 'User'}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#ddd',
                                                    lineHeight: '1.4',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {comment.text}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDelete(comment._id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#999',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '4px 8px',
                                                flexShrink: 0
                                            }}
                                            title="Delete"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {/* Partner Reply */}
                                    {comment.reply && (
                                        <div
                                            style={{
                                                background: '#222',
                                                borderLeft: '3px solid #1e6aff',
                                                padding: '10px 12px',
                                                borderRadius: '4px',
                                                marginTop: '8px',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <div style={{ fontWeight: '600', color: '#1e6aff', marginBottom: '4px' }}>
                                                {comment.reply.author?.fullName || comment.reply.author?.name || 'Store'}
                                            </div>
                                            <div style={{ color: '#ddd' }}>{comment.reply.text}</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <div
                        style={{
                            padding: '12px 16px',
                            borderTop: '1px solid #333',
                            display: 'flex',
                            gap: '8px',
                            background: '#000'
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    onSubmit()
                                }
                            }}
                            disabled={submitting}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                background: '#111',
                                border: '1px solid #333',
                                color: '#fff',
                                borderRadius: '20px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={onSubmit}
                            disabled={!commentText.trim() || submitting}
                            style={{
                                padding: '10px 16px',
                                background: commentText.trim() ? '#1e6aff' : '#666',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '20px',
                                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background 0.2s',
                                flexShrink: 0
                            }}
                        >
                            {submitting ? '...' : 'Post'}
                        </button>
                    </div>
                </div>
                <style>{`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(100%);
            }
            to {
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
            </div>
        )
    }

    // Mobile View
    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 99,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={onClose}
            />

            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000',
                    borderRadius: '12px',
                    border: '1px solid #333',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '60vh',
                    width: '90%',
                    maxWidth: '400px',
                    animation: 'slideUpMobile 0.3s ease-out',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}
                >
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                        Comments ({comments.length})
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#999',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px 8px'
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Comments List - Compact */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minHeight: 0
                    }}
                >
                    {loading ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '15px' }}>
                            Loading...
                        </div>
                    ) : comments.length === 0 ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '15px', fontSize: '12px' }}>
                            No comments yet
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment._id}
                                style={{
                                    background: '#111',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #333'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '6px',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    {comment.user?.profileImage && (
                                        <img
                                            src={comment.user.profileImage}
                                            alt={comment.user.fullName}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                flexShrink: 0
                                            }}
                                        />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#fff',
                                                marginBottom: '1px'
                                            }}
                                        >
                                            {comment.user?.fullName || comment.user?.name || 'User'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: '#ddd',
                                                lineHeight: '1.3',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {comment.text}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#999',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '2px 4px',
                                            flexShrink: 0
                                        }}
                                        title="Delete"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input - Compact */}
                <div
                    style={{
                        padding: '8px 12px',
                        borderTop: '1px solid #333',
                        display: 'flex',
                        gap: '6px',
                        background: '#000',
                        flexShrink: 0
                    }}
                >
                    <input
                        type="text"
                        placeholder="Comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                onSubmit()
                            }
                        }}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '8px 10px',
                            background: '#111',
                            border: '1px solid #333',
                            color: '#fff',
                            borderRadius: '16px',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={!commentText.trim() || submitting}
                        style={{
                            padding: '8px 12px',
                            background: commentText.trim() ? '#1e6aff' : '#666',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '16px',
                            cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                            flexShrink: 0
                        }}
                    >
                        {submitting ? '...' : 'Post'}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes slideUpMobile {
          from {
            transform: translate(-50%, 100%);
          }
          to {
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
        </>
    )
}

export default CommentsSheet
