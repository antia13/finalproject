import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import { apiRequest } from './services/api'
import './App.css'

function App() {
  const [search, setSearch] = useState('')
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  // Interaction checker states
const [medication1, setMedication1] = useState('')
const [medication2, setMedication2] = useState('')
const [interactionResult, setInteractionResult] = useState(null)
const [interactionLoading, setInteractionLoading] = useState(false)
const [interactionError, setInteractionError] = useState('')

  const [token, setToken] = useState(
    () => localStorage.getItem('health_token')
  )

  const [checkingLogin, setCheckingLogin] = useState(true)

  // Verify the user's login token
  useEffect(() => {
    async function verifyLogin() {
      if (!token) {
        setCheckingLogin(false)
        return
      }

      try {
        await apiRequest('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch {
        localStorage.removeItem('health_token')
        setToken(null)
      } finally {
        setCheckingLogin(false)
      }
    }

    verifyLogin()
  }, [token])

  // Handle successful login
  function handleLogin(accessToken) {
    localStorage.setItem('health_token', accessToken)
    setToken(accessToken)
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('health_token')
    setToken(null)
  }

  // Search medications using the RxNorm backend endpoint
  async function handleMedicationSearch(event) {
    event.preventDefault()

    const medicationName = search.trim()

    if (!medicationName) {
      setSearchError('Please enter a medication name.')
      setMedications([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setSearchError('')
    setHasSearched(false)
    setMedications([])

    try {
      const results = await apiRequest(
        `/medications/search?name=${encodeURIComponent(medicationName)}`
      )

      setMedications(results.medications || [])
      setHasSearched(true)
    } catch (error) {
      setSearchError(
        error.message || 'Unable to search medications. Please try again.'
      )
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }
  
  // Check interactions between two medications
  async function handleInteractionCheck(event) {
    event.preventDefault()

    if (!medication1.trim() || !medication2.trim()) {
      setInteractionError('Please enter both medications.')
      setInteractionResult(null)
      return
    }

    if (
      medication1.trim().toLowerCase() ===
      medication2.trim().toLowerCase()
    ) {
      setInteractionError('Please select two different medications.')
      setInteractionResult(null)
      return
    }

    setInteractionLoading(true)
    setInteractionError('')
    setInteractionResult(null)

    try {
      // Find the first medication in the local database
      const firstMedication = await apiRequest(
        `/medications/lookup?name=${encodeURIComponent(medication1.trim())}`
      )

      // Find the second medication in the local database
      const secondMedication = await apiRequest(
        `/medications/lookup?name=${encodeURIComponent(medication2.trim())}`
      )

      // Check the interaction using the local database IDs
      const result = await apiRequest(
        `/interactions/check?medication1_id=${firstMedication.medication_id}&medication2_id=${secondMedication.medication_id}`
      )

      setInteractionResult({
        ...result,
        medication1: firstMedication.drug_name,
        medication2: secondMedication.drug_name,
      })
    } catch (error) {
      setInteractionError(
        error.message || 'Unable to check this medication combination.'
      )
    } finally {
      setInteractionLoading(false)
    }
  }

    // Show loading screen while checking login
    if (checkingLogin) {
      return <div className="loading-screen">Loading...</div>
    }

    // Show login and registration page
    if (!token) {
      return <Auth onLogin={handleLogin} />
    }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✚</span>
          <span>HEALTHCARE</span>
        </div>

        <p className="nav-label">MENU</p>

        <nav>
          <a className="nav-item active" href="#dashboard">
            Dashboard
          </a>

          <a className="nav-item" href="#medications">
            My Medications
          </a>

          <a className="nav-item" href="#interactions">
            Interactions
          </a>

          <a className="nav-item" href="#drug-info">
            Drug Information
          </a>

          <a className="nav-item" href="#profile">
            My Profile
          </a>
        </nav>

        <div className="sidebar-note">
          <span>ⓘ</span>
          <p>
            Stay informed about your medications and discuss concerns with
            your healthcare professional.
          </p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL HEALTH SPACE</p>
            <h1>Health Dashboard</h1>
          </div>

          <div className="profile-badge">
            <span className="avatar">U</span>
            <span>My Account</span>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-label">
              WELCOME TO YOUR HEALTH LIBRARY
            </p>

            <h2>Manage your medications with more confidence.</h2>

            <p className="welcome-text">
              Search medications, review drug information, and check
              possible medication interactions.
            </p>
          </div>

          <div className="welcome-icon" aria-hidden="true">
            ✚
          </div>
        </section>

        <section className="section-heading" id="medications">
          <div>
            <h2>Medication tools</h2>
          </div>
        </section>

        <section className="tool-grid">
          {/* Medication Search */}
          <article className="tool-card">
            <div className="tool-icon search-icon">⌕</div>

            <h3>Search Medications</h3>

            <p>
              Find medication names and information available in RxNorm.
            </p>

            <form
              className="search-form"
              onSubmit={handleMedicationSearch}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. ibuprofen"
                aria-label="Medication name"
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {loading && (
              <p className="search-status">
                Searching medications...
              </p>
            )}

            {searchError && (
              <p className="search-error">
                {searchError}
              </p>
            )}

            {hasSearched && !searchError && medications.length === 0 && (
              <p className="search-status">
                No matching medications found.
              </p>
            )}

            {medications.length > 0 && (
              <div className="search-results">
                <h4>Search Results ({medications.length})</h4>

                {medications.map((medication, index) => (
                  <div
                    className="search-result"
                    key={medication.rxcui || index}
                  >
                    <h5>{medication.name}</h5>

                    {medication.rxcui && (
                      <p>RxNorm ID: {medication.rxcui}</p>
                    )}

                    {medication.type && (
                      <p>Type: {medication.type}</p>
                    )}

                    {medication.synonym && (
                      <p>Synonym: {medication.synonym}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Interaction Checker */}
          <article className="tool-card" id="interactions">
            <div className="tool-icon interaction-icon">⚕</div>

            <h3>Check Interactions</h3>

            <p>
              Enter two medication names to check for possible interactions.
            </p>

            <form
              className="search-form interaction-form"
              onSubmit={handleInteractionCheck}
            >
              <input
                type="text"
                value={medication1}
                onChange={(event) => setMedication1(event.target.value)}
                placeholder="First medication"
                aria-label="First medication"
              />

              <input
                type="text"
                value={medication2}
                onChange={(event) => setMedication2(event.target.value)}
                placeholder="Second medication"
                aria-label="Second medication"
              />

              <button type="submit" disabled={interactionLoading}>
                {interactionLoading ? 'Checking...' : 'Check Interaction'}
              </button>
            </form>

            {interactionError && (
              <p className="search-error">{interactionError}</p>
            )}

            {interactionResult && (
              <div className="interaction-results">
                <h4>Interaction Results</h4>

                <p>
                  <strong>Medication 1:</strong> {interactionResult.medication1}
                </p>

                <p>
                  <strong>Medication 2:</strong> {interactionResult.medication2}
                </p>

                {interactionResult.interaction_found ? (
                  <>
                    <p>
                      <strong>Severity:</strong> {interactionResult.severity}
                    </p>

                    <p>
                      <strong>Description:</strong> {interactionResult.description}
                    </p>
                  </>
                ) : (
                  <p>{interactionResult.message}</p>
                )}
              </div>
            )}
          </article>

          {/* Drug Information */}
          <article className="tool-card" id="drug-info">
            <div className="tool-icon info-icon">ⓘ</div>

            <h3>Drug Information</h3>

            <p>
              Explore available uses, warnings, and label information.
            </p>

            <a className="card-link" href="#drug-info">
              Explore information <span>→</span>
            </a>
          </article>
        </section>

        <section className="notice">
          <span className="notice-icon">ⓘ</span>

          <div>
            <h3>Important health reminder</h3>

            <p>
              This application provides informational support, not a
              diagnosis or a substitute for professional medical advice.
              Never start, stop, or change medication based only on the
              information provided by this application. When in doubt,
              always consult a pharmacist or healthcare professional
              about concerns.
            </p>
          </div>
        </section>

        <footer>
          <span>
            HEALTHCARE · Medication management within your reach
          </span>

          <span>For informational purposes only</span>
        </footer>
      </main>
    </div>
  )
}

export default App
