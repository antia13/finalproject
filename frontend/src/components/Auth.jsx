
import { useState } from 'react'
import { apiRequest } from '../services/api'
import './Auth.css'

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    //Password confirmation

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    //React communicates with the backend
    try {
      if (isRegistering) {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        })
      }


      //Login request
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    
      //Handling the authentication token
      onLogin(result.access_token)
    } catch (err) {
      setError(err.message || 'Unable to complete your request.')
    } finally {
      setLoading(false)
    }
  }

  // Interface for the authentication page
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">✚</span>
          <h1>Health<span>Care</span></h1>
        </div>

        <p className="auth-eyebrow">YOUR PERSONAL HEALTH SPACE</p>

        <h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>

        <p className="auth-description">
          {isRegistering
            ? 'Create an account to start managing your medications.'
            : 'Sign in to access your medication dashboard.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                minLength={3}
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          {isRegistering && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegistering
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering
            ? 'Already have an account?'
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError('')
              setPassword('')
              setConfirmPassword('')
            }}
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </button>
        </p>

        <p className="auth-disclaimer">
          For informational purposes only. This application does not replace
          professional medical advice.
        </p>
      </div>
    </div>
  )
}

export default Auth
