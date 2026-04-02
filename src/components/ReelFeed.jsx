import React, { useEffect, useRef, useState } from 'react'
import ShinyText from './ShinyText'
import axios from 'axios'
import API_CONFIG from '../utils/apiConfig'
import { useAuth } from '../contexts/AuthContext'

// Sub-components
import NewMealsPopup from './reel/NewMealsPopup'
import ReelVideo from './reel/ReelVideo'
import ReelActionButtons from './reel/ReelActionButtons'
import ReelInfo from './reel/ReelInfo'
import CommentsSheet from './reel/CommentsSheet'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.', onLogin, initialIndex = 0, isLoading = false }) => {
  const { role } = useAuth()
  const videoRefs = useRef(new Map())
  const feedRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)
  const [shuffledItems, setShuffledItems] = useState([])

  // New meals popup state
  const [showNewMealsPopup, setShowNewMealsPopup] = useState(false)
  const [newMeals, setNewMeals] = useState([])
  const appendingRef = useRef(false)

  // Observer state
  const currentVisibleRef = useRef(null)

  // Likes/Saves local state
  const likedItems = useRef(new Set())
  const savedItems = useRef(new Set())
  const [itemsWithUpdatedStats, setItemsWithUpdatedStats] = useState({})

  // Info popup state
  const [openPopupId, setOpenPopupId] = useState(null)

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activeCommentsFoodId, setActiveCommentsFoodId] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  const shuffleArray = (arr) => {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = a[i]
      a[i] = a[j]
      a[j] = temp
    }
    return a
  }

  // Intersection observer to play/pause and append on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const reelId = entry.target.dataset.reelId
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const vid = videoRefs.current.get(reelId)
            currentVisibleRef.current = reelId

            // Pause all other videos
            videoRefs.current.forEach((video, id) => {
              if (id !== reelId && !video.paused) {
                video.pause()
              }
            })

            // Play current visible video
            if (vid) {
              vid.currentTime = vid.currentTime || 0
              const p = vid.play()
              if (p?.catch) p.catch(() => { })
            }

            // Check if this is the last reel and append new shuffle
            if (shuffledItems.length > 0) {
              const currentIndex = shuffledItems.findIndex(item => item._id === reelId)
              const isLastReel = currentIndex === shuffledItems.length - 1

              if (isLastReel && !appendingRef.current && items && items.length) {
                appendingRef.current = true
                const newShuffle = shuffleArray(items)
                setNewMeals(newShuffle)
                setShowNewMealsPopup(true)

                // Auto append after 3 seconds
                setTimeout(() => {
                  setShuffledItems((prev) => [...prev, ...newShuffle])
                  setShowNewMealsPopup(false)
                  appendingRef.current = false
                }, 3000)
              }
            }
          } else {
            const vid = videoRefs.current.get(reelId)
            if (vid && !vid.paused) {
              vid.pause()
            }
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    if (feedRef.current) {
      Array.from(feedRef.current.querySelectorAll('[data-reel-id]')).forEach((el) => {
        observer.observe(el)
      })
    }

    return () => observer.disconnect()
  }, [shuffledItems, items])

  // Initialize shuffle on first load
  useEffect(() => {
    if (shuffledItems.length === 0 && items.length > 0) {
      const shuffled = shuffleArray(items)
      setShuffledItems(shuffled)
    }
  }, [items])

  // Initialize saved/liked state from items
  useEffect(() => {
    items.forEach(item => {
      if (item.isLiked) likedItems.current.add(item._id)
      if (item.isSaved) savedItems.current.add(item._id)
    })
    // Also initialize stats state with saved/liked flags
    const newStats = {}
    items.forEach(item => {
      if (item.isSaved || item.isLiked) {
        newStats[`${item._id}-stats`] = {
          isSaved: item.isSaved || false,
          isLiked: item.isLiked || false
        }
      }
    })
    if (Object.keys(newStats).length > 0) {
      setItemsWithUpdatedStats(prev => ({ ...prev, ...newStats }))
    }
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) {
      videoRefs.current.delete(id)
      return
    }
    if (el.dataset) el.dataset.reelId = id
    videoRefs.current.set(id, el)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    videoRefs.current.forEach((video) => {
      video.muted = !isMuted
    })
  }

  // Get current item with updated stats
  const getItemWithStats = (item) => {
    const key = `${item._id}-stats`
    const updatedStats = itemsWithUpdatedStats[key]
    if (updatedStats) {
      return { ...item, ...updatedStats }
    }
    return item
  }

  // --- Comment Logic ---
  const openComments = async (foodId) => {
    setActiveCommentsFoodId(foodId)
    setCommentsOpen(true)
    setLoadingComments(true)
    setCommentText('')

    try {
      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS.GET(foodId)}`
      const response = await axios.get(endpoint, { withCredentials: true })
      setComments(response.data.comments || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setComments([])
      if (err.response?.status !== 401 && err.response?.status !== 403 && err.response?.status !== 404) {
      }
    } finally {
      setLoadingComments(false)
    }
  }

  const closeComments = () => {
    setCommentsOpen(false)
    setActiveCommentsFoodId(null)
    setComments([])
    setCommentText('')
  }

  const submitComment = async () => {
    if (!commentText.trim() || !activeCommentsFoodId) return

    setSubmittingComment(true)
    try {
      const endpoint = role === 'foodPartner'
        ? `${API_CONFIG.BASE_URL}/api/comments/add-by-partner`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS.ADD}`

      const response = await axios.post(
        endpoint,
        { foodId: activeCommentsFoodId, text: commentText },
        { withCredentials: true }
      )

      setComments([response.data.comment, ...comments])
      setCommentText('')

      // Update comment count in shuffled items
      setShuffledItems((prev) =>
        prev.map((item) =>
          item._id === activeCommentsFoodId
            ? { ...item, commentCount: (item.commentCount || 0) + 1 }
            : item
        )
      )
    } catch (err) {
      console.error('Error posting comment:', err)
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        alert('Failed to post comment')
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS.DELETE(commentId)}`,
        { withCredentials: true }
      )
      setComments(comments.filter(c => c._id !== commentId))

      // Update comment count in shuffled items
      setShuffledItems((prev) =>
        prev.map((item) =>
          item._id === activeCommentsFoodId
            ? { ...item, commentCount: Math.max(0, (item.commentCount || 1) - 1) }
            : item
        )
      )
    } catch (err) {
      console.error('Error deleting comment:', err)
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        alert('Failed to delete comment')
      }
    }
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list" ref={feedRef}>
        {items.length === 0 && (
          <div className="empty-state">
            <ShinyText text={emptyMessage} speed={5} className="empty-message-shiny" />
            {onLogin && (
              <button
                onClick={onLogin}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '999px',
                  background: '#222',
                  color: '#fff',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'background 0.2s'
                }}
              >
                Sign In to Explore
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="reels-loading-skeletons">
            {[...Array(3)].map((_, i) => (
              <section key={`skeleton-${i}`} className="reel-skeleton">
                <div className="shimmer" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                <div className="skeleton-content" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="skeleton-line shimmer" />
                  <div className="skeleton-line short shimmer" />
                </div>
                <div className="skeleton-actions" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="skeleton-action-circle shimmer" />
                  <div className="skeleton-action-circle shimmer" />
                  <div className="skeleton-action-circle shimmer" />
                </div>
              </section>
            ))}
          </div>
        )}

        {!isLoading && (shuffledItems && shuffledItems.length ? shuffledItems : items).map((item, index) => {
          const itemWithStats = getItemWithStats(item)

          return (
            <section key={`${item._id}-${index}`} className="reel" role="listitem" style={{ position: 'relative' }}>
              <ReelVideo
                src={item.video}
                isMuted={isMuted}
                videoRef={setVideoRef(item._id)}
              >
                <ReelActionButtons
                  item={item}
                  isLiked={itemWithStats.isLiked || likedItems.current.has(item._id)}
                  likeCount={itemWithStats.likeCount ?? itemWithStats.likesCount ?? itemWithStats.likes ?? 0}
                  isSaved={itemWithStats.isSaved || savedItems.current.has(item._id)}
                  saveCount={itemWithStats.savesCount ?? itemWithStats.bookmarks ?? itemWithStats.saves ?? 0}
                  commentCount={item.commentCount ?? item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}
                  isMuted={isMuted}
                  onMuteToggle={handleMuteToggle}
                  onComment={() => openComments(item._id)}
                  onLike={() => {
                    if (!onLike) return
                    const wasLiked = itemWithStats.isLiked || likedItems.current.has(item._id)
                    const newLikeState = !wasLiked

                    if (newLikeState) {
                      likedItems.current.add(item._id)
                    } else {
                      likedItems.current.delete(item._id)
                    }

                    // Optimistic update of stats
                    const currentLikes = itemWithStats.likeCount ?? itemWithStats.likesCount ?? itemWithStats.likes ?? 0
                    const newLikes = newLikeState ? currentLikes + 1 : Math.max(0, currentLikes - 1)
                    setItemsWithUpdatedStats(prev => ({
                      ...prev,
                      [`${item._id}-stats`]: {
                        ...itemWithStats,
                        likeCount: newLikes,
                        isLiked: newLikeState
                      }
                    }))

                    onLike(item)
                  }}
                  onSave={() => {
                    if (!onSave) return
                    const wasSaved = itemWithStats.isSaved || savedItems.current.has(item._id)
                    const newSaveState = !wasSaved

                    if (newSaveState) {
                      savedItems.current.add(item._id)
                    } else {
                      savedItems.current.delete(item._id)
                    }

                    const currentSaves = itemWithStats.savesCount ?? itemWithStats.bookmarks ?? itemWithStats.saves ?? 0
                    const newSaves = newSaveState ? currentSaves + 1 : Math.max(0, currentSaves - 1)
                    setItemsWithUpdatedStats(prev => ({
                      ...prev,
                      [`${item._id}-stats`]: {
                        ...(prev[`${item._id}-stats`] || itemWithStats),
                        savesCount: newSaves,
                        isSaved: newSaveState
                      }
                    }))

                    onSave(item)
                  }}
                />

                <ReelInfo
                  item={item}
                  isOpen={openPopupId === item._id}
                  onToggle={(id) => {
                    // Toggle logic
                    if (openPopupId === id) setOpenPopupId(null)
                    else setOpenPopupId(id)
                  }}
                  onClose={() => setOpenPopupId(null)}
                />
              </ReelVideo>
            </section>
          )
        })}
      </div>

      {showNewMealsPopup && (
        <NewMealsPopup
          newMealsCount={newMeals.length}
          onLoad={() => {
            setShuffledItems((prev) => [...prev, ...newMeals])
            setShowNewMealsPopup(false)
          }}
          onDismiss={() => setShowNewMealsPopup(false)}
        />
      )}

      <CommentsSheet
        comments={comments}
        loading={loadingComments}
        isOpen={commentsOpen}
        onClose={closeComments}
        onDelete={deleteComment}
        onSubmit={submitComment}
        commentText={commentText}
        setCommentText={setCommentText}
        submitting={submittingComment}
        isMobile={typeof window !== 'undefined' ? window.innerWidth <= 768 : false}
      />
    </div>
  )
}

export default ReelFeed
