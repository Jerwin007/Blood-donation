import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      
      alert('✅ Login successful!')
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.msg || '❌ Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #e63946, #ff6b6b, #f7b267)',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          width: '350px',
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h2 style={{ marginBottom: '25px', color: '#e63946' }}>🔐 Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              transition: '0.3s',
            }}
            onFocus={e => (e.target.style.border = '1px solid #e63946')}
            onBlur={e => (e.target.style.border = '1px solid #ddd')}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              transition: '0.3s',
            }}
            onFocus={e => (e.target.style.border = '1px solid #e63946')}
            onBlur={e => (e.target.style.border = '1px solid #ddd')}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#aaa' : '#e63946',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: '0.3s',
            }}
            onMouseOver={e => !loading && (e.target.style.background = '#d62828')}
            onMouseOut={e => !loading && (e.target.style.background = '#e63946')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
