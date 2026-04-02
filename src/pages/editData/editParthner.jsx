import React, { useEffect, useState } from 'react'
import axios from 'axios'
import API_CONFIG from '../../utils/apiConfig'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import '../../styles/edit-partner.css'

const EditPartner = () => {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [originalAddress, setOriginalAddress] = useState('')
  const [originalContactName, setOriginalContactName] = useState('')
  const [originalPhone, setOriginalPhone] = useState('')
  const [customerServed, setCustomerServed] = useState(0)
  const [originalCustomerServed, setOriginalCustomerServed] = useState(0)
  const [editingName, setEditingName] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingContactName, setEditingContactName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingCustomerServed, setEditingCustomerServed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch current profile data
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.GET_ME}`, {
        withCredentials: true
      })
      const data = res.data.foodPartner
      setName(data.name || '')
      setAddress(data.address || '')
      setContactName(data.contactName || '')
      setPhone(data.phone || '')
      setCustomerServed(data.customerServed || 0)
      setOriginalName(data.name || '')
      setOriginalAddress(data.address || '')
      setOriginalContactName(data.contactName || '')
      setOriginalPhone(data.phone || '')
      setOriginalCustomerServed(data.customerServed || 0)
    } catch (err) {
      // console.error('Fetch profile error:', err)
      if (err.response && err.response.status === 401) {
        navigate('/food-partner/login', { replace: true })
      } else {
        setError('Failed to load profile data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }
    if (!address.trim()) {
      setError('Address cannot be empty')
      return
    }
    if (!contactName.trim()) {
      setError('Contact name cannot be empty')
      return
    }
    if (!phone.trim()) {
      setError('Phone number cannot be empty')
      return
    }

    setSaving(true)
    const startTime = Date.now()

    try {
      // Update name
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.UPDATE_NAME}`, 
        { name },
        { withCredentials: true }
      )

      // Update address
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.UPDATE_ADDRESS}`,
        { address },
        { withCredentials: true }
      )

      // Update contact name
      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.UPDATE_CONTACT_NAME}`,
        { contactName },
        { withCredentials: true }
      )

      // Update phone
      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.UPDATE_CONTACT_NUMBER}`,
        { phone },
        { withCredentials: true }
      )

      // Update customer served
      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.UPDATE_CUSTOMER_SERVED}`,
        { customerServed: Number(customerServed) },
        { withCredentials: true }
      )

      // Ensure minimum 2 second loading time
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime))
      }

      setEditingName(false)
      setEditingAddress(false)
      setEditingContactName(false)
      setEditingPhone(false)
      setEditingCustomerServed(false)
      setOriginalName(name)
      setOriginalAddress(address)
      setOriginalContactName(contactName)
      setOriginalPhone(phone)
      setOriginalCustomerServed(customerServed)

      // Navigate back to profile
      setTimeout(() => {
        navigate('/food-partner/profile', { replace: true })
      }, 300)
    } catch (err) {
      // console.error('Save error:', err)
      
      // Ensure minimum 2 second loading time even on error
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime))
      }

      if (err.response && err.response.status === 401) {
        navigate('/food-partner/login', { replace: true })
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(originalName)
    setAddress(originalAddress)
    setContactName(originalContactName)
    setPhone(originalPhone)
    setCustomerServed(originalCustomerServed)
    setEditingName(false)
    setEditingAddress(false)
    setEditingContactName(false)
    setEditingPhone(false)
    setEditingCustomerServed(false)
    navigate('/food-partner/profile', { replace: true })
  }

  if (loading) {
    return (
      <main className="edit-partner-page">
        <div className="edit-partner-loading">Loading profile...</div>
      </main>
    )
  }

  return (
    <main className="edit-partner-page">

      {/* ── Sticky Header Bar ── */}
      <div className="edit-partner-header">
        <button
          onClick={handleCancel}
          className="edit-partner-btn cancel-btn"
          disabled={saving}
          aria-label="Cancel"
        >
          Cancel
        </button>

        <h1 className="edit-partner-title">Edit Profile</h1>

        <button
          onClick={handleSave}
          className="edit-partner-btn save-btn"
          disabled={saving || (name === originalName && address === originalAddress && contactName === originalContactName && phone === originalPhone && customerServed === originalCustomerServed)}
          aria-label="Save changes"
        >
          {saving ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="loading-spinner">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : 'Done'}
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="edit-partner-error">
          {error}
        </div>
      )}

      {/* ── Avatar Section ── */}
      <div className="edit-partner-avatar-section">
        <div className="edit-partner-avatar-ring">
          <img
            className="edit-partner-avatar-img"
            src="https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
            alt="Profile"
          />
          <div className="edit-partner-avatar-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
        <button
          className="edit-partner-avatar-btn"
          onClick={() => navigate('/food-partner/edit-picture')}
          disabled={saving}
        >
          Change profile photo
        </button>
      </div>

      {/* ── Edit Fields ── */}
      <div className="edit-partner-content">

        {/* Business Name */}
        <div className={`edit-partner-section ${editingName ? 'is-editing' : ''}`}>
          <div className="edit-partner-label">
            <span className="edit-partner-label-text">Business Name</span>
            <button
              onClick={() => setEditingName(!editingName)}
              className="edit-partner-pencil"
              disabled={saving}
              aria-label="Edit name"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          {editingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="edit-partner-input"
              placeholder="Enter your business name"
              autoFocus
            />
          ) : (
            <div className="edit-partner-display">
              {name || 'No name set'}
            </div>
          )}
        </div>

        {/* Address */}
        <div className={`edit-partner-section ${editingAddress ? 'is-editing' : ''}`}>
          <div className="edit-partner-label">
            <span className="edit-partner-label-text">Address</span>
            <button
              onClick={() => setEditingAddress(!editingAddress)}
              className="edit-partner-pencil"
              disabled={saving}
              aria-label="Edit address"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          {editingAddress ? (
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="edit-partner-input edit-partner-textarea"
              placeholder="Enter your business address"
              rows="2"
              autoFocus
            />
          ) : (
            <div className="edit-partner-display">
              {address || 'No address set'}
            </div>
          )}
        </div>

        {/* Contact Name */}
        <div className={`edit-partner-section ${editingContactName ? 'is-editing' : ''}`}>
          <div className="edit-partner-label">
            <span className="edit-partner-label-text">Contact Name</span>
            <button
              onClick={() => setEditingContactName(!editingContactName)}
              className="edit-partner-pencil"
              disabled={saving}
              aria-label="Edit contact name"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          {editingContactName ? (
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="edit-partner-input"
              placeholder="Enter contact name"
              autoFocus
            />
          ) : (
            <div className="edit-partner-display">
              {contactName || 'No contact name set'}
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div className={`edit-partner-section ${editingPhone ? 'is-editing' : ''}`}>
          <div className="edit-partner-label">
            <span className="edit-partner-label-text">Phone Number</span>
            <button
              onClick={() => setEditingPhone(!editingPhone)}
              className="edit-partner-pencil"
              disabled={saving}
              aria-label="Edit phone number"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          {editingPhone ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="edit-partner-input"
              placeholder="Enter phone number"
              autoFocus
            />
          ) : (
            <div className="edit-partner-display">
              {phone || 'No phone number set'}
            </div>
          )}
        </div>

        {/* Customers Served */}
        <div className={`edit-partner-section ${editingCustomerServed ? 'is-editing' : ''}`}>
          <div className="edit-partner-label">
            <span className="edit-partner-label-text">Customers Served</span>
            <button
              onClick={() => setEditingCustomerServed(!editingCustomerServed)}
              className="edit-partner-pencil"
              disabled={saving}
              aria-label="Edit customer served count"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          {editingCustomerServed ? (
            <input
              type="number"
              value={customerServed}
              onChange={(e) => setCustomerServed(Math.max(0, parseInt(e.target.value) || 0))}
              className="edit-partner-input"
              placeholder="Enter number of customers served"
              min="0"
              autoFocus
            />
          ) : (
            <div className="edit-partner-display">
              {customerServed}
            </div>
          )}
        </div>
      </div>

      {/* ── Saving overlay ── */}
      {saving && (
        <div className="edit-partner-overlay">
          <div className="edit-partner-spinner">
            <div className="spinner-dot" />
            <div className="spinner-dot" />
            <div className="spinner-dot" />
          </div>
          <p>Saving changes…</p>
        </div>
      )}
    </main>
  )
}

export default EditPartner
