import React, { useEffect, useState } from 'react'
import axios from 'axios'
import API_CONFIG from '../../utils/apiConfig'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        axios.get(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD.GET_ALL}`,
            { withCredentials: true }
        )
            .then(response => {
                const mappedFoods = response.data.foodItems.map(item => ({
                    _id: item._id,
                    name: item.name,
                    video: item.video,
                    description: item.description,
                    likeCount: item.likeCount,
                    savesCount: item.savesCount,
                    commentsCount: item.commentCount,
                    foodPartner: item.foodPartner,
                }))
                setVideos(mappedFoods)
            })
            .catch(err => {
                console.error('❌ Error fetching food items:', err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    async function likeVideo(item) {
        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD.LIKE}`,
            { foodId: item._id },
            { withCredentials: true }
        )

        setVideos(prev =>
            prev.map(v =>
                v._id === item._id
                    ? { ...v, likeCount: v.likeCount + (response.data.like ? 1 : -1) }
                    : v
            )
        )
    }

    async function saveVideo(item) {
        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD.SAVE}`,
            { foodId: item._id },
            { withCredentials: true }
        )

        setVideos(prev =>
            prev.map(v =>
                v._id === item._id
                    ? { ...v, savesCount: v.savesCount + (response.data.save ? 1 : -1) }
                    : v
            )
        )
    }

    return (
        <div
            style={{
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: 'black',
                transform: 'translateY(-14px)' // 🔼 small upward shift
            }}
        >
            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                emptyMessage="No videos available."
                isLoading={loading}
            />
        </div>
    )

}

export default Home
