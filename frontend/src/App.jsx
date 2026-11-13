import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import { apiRequest } from './services/api'
import './App.css'

function App() {
  // Medication search
  const [search, setSearch] = useState('')
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Interaction checker
  const [medication1, setMedication1] = useState('')
  const [medication2, setMedication2] = useState('')
  const [interactionResult, setInteractionResult] = useState(null)
  const [interactionLoading, setInteractionLoading] = useState(false)
  const [interactionError, setInteractionError] = useState('')

  // Drug information
  const [drugSearch, setDrugSearch] = useState('')
  const [drugInfo, setDrugInfo] = useState(null)
  const [drugLoading, setDrugLoading] = useState(false)
  const [drugError, setDrugError] = useState('')

  // Authentication
  const [token, setToken] = useState(() => localStorage.getItem('health_token'))
  const [checkingLogin, setCheckingLogin] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')

  // User profile (read-only)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  
  // My Medications
  const [myMedications, setMyMedications] = useState([])
  const [myMedicationsLoading, setMyMedicationsLoading] = useState(false)
  const [myMedicationsError, setMyMedicationsError] = useState('')
  const [myMedicationsSuccess, setMyMedicationsSuccess] = useState('')

  // Add medication form
  const [newMedicationName, setNewMedicationName] = useState('')
  const [newMedicationDosage, setNewMedicationDosage] = useState('')
  const [newMedicationFrequency, setNewMedicationFrequency] = useState('')
  const [addingMedication, setAddingMedication] = useState(false)

  // Verify the user's login token
  useEffect(() => {
    let cancelled = false

    async function verifyLogin() {
      if (!token) {
        setCheckingLogin(false)
        return
      }

      setCheckingLogin(true)
      try {
        await apiRequest('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        if (!cancelled) {
          localStorage.removeItem('health_token')
          setToken(null)
        }
      } finally {
        if (!cancelled) setCheckingLogin(false)
      }
    }

    verifyLogin()
    return () => { cancelled = true }
  }, [token])

  // Retrieve profile after authentication
  useEffect(() => {
    if (!token || checkingLogin) return

    let cancelled = false
    async function fetchProfile() {
      setProfileLoading(true)
      setProfileError('')
      try {
        const result = await apiRequest('/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled) setProfile(result)
      } catch (error) {
        if (!cancelled) setProfileError(error.message || 'Unable to load your profile.')
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    fetchProfile()
    return () => { cancelled = true }
  }, [token, checkingLogin])

  function handleLogin(accessToken) {
    localStorage.setItem('health_token', accessToken)
    setToken(accessToken)
    setActivePage('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('health_token')
    setToken(null)
    setProfile(null)
    setProfileError('')
    setActivePage('dashboard')
  }

  // Retrieve the logged-in user's saved medications
  async function loadMyMedications() {
    if (!token) return

    setMyMedicationsLoading(true)
    setMyMedicationsError('')

    try {
      const result = await apiRequest('/user-medications/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMyMedications(result.medications || [])
    } catch (error) {
      setMyMedicationsError(
        error.message || 'Unable to load your medications.'
      )
    } finally {
      setMyMedicationsLoading(false)
    }
  }

  function navigateTo(page, sectionId) {
    setActivePage(page)
    if (sectionId) {
      // Allow React to render the dashboard before scrolling to its section.
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Add a medication to the logged-in user's list
  async function handleAddMedication(event) {
    event.preventDefault()

    const medicationName = newMedicationName.trim()

    if (!medicationName) {
      setMyMedicationsError('Please enter a medication name.')
      return
    }

    setAddingMedication(true)
    setMyMedicationsError('')
    setMyMedicationsSuccess('')

    try {
      // Find the medication in the local database
      const medication = await apiRequest(
        `/medications/lookup?name=${encodeURIComponent(medicationName)}`
      )

      // Save the medication to the user's personal list
      await apiRequest('/user-medications/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medication_id: medication.medication_id,
          dosage: newMedicationDosage.trim() || null,
          frequency: newMedicationFrequency.trim() || null,
        }),
      })

      // Clear the form
      setNewMedicationName('')
      setNewMedicationDosage('')
      setNewMedicationFrequency('')

      // Refresh the saved medication list
      await loadMyMedications()

      setMyMedicationsSuccess('Medication added successfully!')
    } catch (error) {
      setMyMedicationsError(
        error.message || 'Unable to add medication.'
      )
    } finally {
      setAddingMedication(false)
    }
  }

  // Search medications using RxNorm
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
      setSearchError(error.message || 'Unable to search medications. Please try again.')
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }

  // Remove a medication from the logged-in user's list
  async function handleRemoveMedication(userMedId) {
    const confirmed = window.confirm(
      'Are you sure you want to remove this medication from your list?'
    )

    if (!confirmed) return

    setMyMedicationsError('')
    setMyMedicationsSuccess('')

    try {
      await apiRequest(`/user-medications/${userMedId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Refresh the saved medication list
      await loadMyMedications()

      setMyMedicationsSuccess('Medication removed successfully!')
    } catch (error) {
      setMyMedicationsError(
        error.message || 'Unable to remove medication.'
      )
    }
  }

  // Check interactions between two locally stored medications
  async function handleInteractionCheck(event) {
    event.preventDefault()
    if (!medication1.trim() || !medication2.trim()) {
      setInteractionError('Please enter both medications.')
      setInteractionResult(null)
      return
    }
    if (medication1.trim().toLowerCase() === medication2.trim().toLowerCase()) {
      setInteractionError('Please select two different medications.')
      setInteractionResult(null)
      return
    }

    setInteractionLoading(true)
    setInteractionError('')
    setInteractionResult(null)
    try {
      const firstMedication = await apiRequest(
        `/medications/lookup?name=${encodeURIComponent(medication1.trim())}`
      )
      const secondMedication = await apiRequest(
        `/medications/lookup?name=${encodeURIComponent(medication2.trim())}`
      )
      const result = await apiRequest(
        `/interactions/check?medication1_id=${firstMedication.medication_id}&medication2_id=${secondMedication.medication_id}`
      )
      setInteractionResult({
        ...result,
        medication1: firstMedication.drug_name,
        medication2: secondMedication.drug_name,
      })
    } catch (error) {
      setInteractionError(error.message || 'Unable to check this medication combination.')
    } finally {
      setInteractionLoading(false)
    }
  }

  // Search drug labels using openFDA
  async function handleDrugSearch(event) {
    event.preventDefault()
    const medicationName = drugSearch.trim()
    if (!medicationName) {
      setDrugError('Please enter a medication name.')
      setDrugInfo(null)
      return
    }

    setDrugLoading(true)
    setDrugError('')
    setDrugInfo(null)
    try {
      const result = await apiRequest(
        `/drug-info/search?name=${encodeURIComponent(medicationName)}`
      )
      if (!result.found) {
        setDrugError(result.message || 'No matching drug information found.')
      } else {
        setDrugInfo(result)
      }
    } catch (error) {
      setDrugError(error.message || 'Unable to retrieve drug information.')
    } finally {
      setDrugLoading(false)
    }
  }

  if (checkingLogin) return <div className="loading-screen">Loading...</div>
  if (!token) return <Auth onLogin={handleLogin} />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✚</span>
          <span>HEALTHCARE</span>
        </div>

        <p className="nav-label">MENU</p>
        <nav>
          <a
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            href="#dashboard"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('dashboard')
            }}
          >
            Dashboard
          </a>
          <a
            className={`nav-item ${activePage === 'my-medications' ? 'active' : ''}`}
            href="#my-medications"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('my-medications')
              loadMyMedications()
            }}
          >
            My Medications
          </a>
          <a
            className="nav-item"
            href="#interactions"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('dashboard', 'interactions')
            }}
          >
            Interactions
          </a>
          <a
            className="nav-item"
            href="#drug-info"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('dashboard', 'drug-info')
            }}
          >
            Drug Information
          </a>
          <a
            className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
            href="#profile"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('profile')
            }}
          >
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
            <h1>
            {activePage === 'profile'
              ? 'My Profile'
              : activePage === 'my-medications'
                ? 'My Medications'
                : 'Health Dashboard'}
            </h1>
          </div>
          <div className="profile-badge">
            <span className="avatar">U</span>
            <span>My Account</span>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <>
            <section className="welcome">
              <div>
                <p className="welcome-label">WELCOME TO YOUR HEALTH LIBRARY</p>
                <h2>Manage your medications with more confidence.</h2>
                <p className="welcome-text">
                  Search medications, review drug information, and check
                  possible medication interactions.
                </p>
              </div>
              <div className="welcome-icon" aria-hidden="true">✚</div>
            </section>

            <section className="section-heading" id="medications">
              <div><h2>Medication tools</h2></div>
            </section>

            <section className="tool-grid">
              {/* Medication Search */}
              <article className="tool-card">
                <div className="tool-icon search-icon">⌕</div>
                <h3>Search Medications</h3>
                <p>Find medication names and information available in RxNorm.</p>
                <form className="search-form" onSubmit={handleMedicationSearch}>
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
                {loading && <p className="search-status">Searching medications...</p>}
                {searchError && <p className="search-error">{searchError}</p>}
                {hasSearched && !searchError && medications.length === 0 && (
                  <p className="search-status">No matching medications found.</p>
                )}
                {medications.length > 0 && (
                  <div className="search-results">
                    <h4>Search Results ({medications.length})</h4>
                    {medications.map((medication, index) => (
                      <div className="search-result" key={medication.rxcui || index}>
                        <h5>{medication.name}</h5>
                        {medication.rxcui && <p>RxNorm ID: {medication.rxcui}</p>}
                        {medication.type && <p>Type: {medication.type}</p>}
                        {medication.synonym && <p>Synonym: {medication.synonym}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </article>

              {/* Interaction Checker */}
              <article className="tool-card" id="interactions">
                <div className="tool-icon interaction-icon">⚕</div>
                <h3>Check Interactions</h3>
                <p>Enter two medication names to check for possible interactions.</p>
                <form className="search-form interaction-form" onSubmit={handleInteractionCheck}>
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
                {interactionError && <p className="search-error">{interactionError}</p>}
                {interactionResult && (
                  <div className="interaction-results">
                    <h4>Interaction Results</h4>
                    <p><strong>Medication 1:</strong> {interactionResult.medication1}</p>
                    <p><strong>Medication 2:</strong> {interactionResult.medication2}</p>
                    {interactionResult.interaction_found ? (
                      <>
                        <p><strong>Severity:</strong> {interactionResult.severity}</p>
                        <p><strong>Description:</strong> {interactionResult.description}</p>
                      </>
                    ) : (
                      <p>{interactionResult.message}</p>
                    )}
                  </div>
                )}
              </article>

              {/* Drug Information */}
              <article className="tool-card drug-info-card" id="drug-info">
                <div className="tool-icon info-icon">ⓘ</div>
                <h3>Drug Information</h3>
                <p>
                  Search for medication uses, warnings, and other available
                  information from FDA drug labels.
                </p>
                <form className="search-form" onSubmit={handleDrugSearch}>
                  <input
                    type="text"
                    value={drugSearch}
                    onChange={(event) => setDrugSearch(event.target.value)}
                    placeholder="e.g. ibuprofen"
                    aria-label="Medication name for drug information"
                  />
                  <button type="submit" disabled={drugLoading}>
                    {drugLoading ? 'Searching...' : 'Search'}
                  </button>
                </form>
                {drugError && <p className="search-error">{drugError}</p>}
                {drugInfo && (
                  <div className="drug-info-results">
                    <h4>Information for {drugInfo.drug_name}</h4>
                    {drugInfo.brand_names?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Brand Names</h5>
                        <p>{drugInfo.brand_names.join(', ')}</p>
                      </div>
                    )}
                    {drugInfo.generic_names?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Generic Names</h5>
                        <p>{drugInfo.generic_names.join(', ')}</p>
                      </div>
                    )}
                    {drugInfo.purpose?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Purpose</h5>
                        {drugInfo.purpose.map((item, index) => <p key={index}>{item}</p>)}
                      </div>
                    )}
                    {drugInfo.indications_and_usage?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Uses and Indications</h5>
                        {drugInfo.indications_and_usage.map((item, index) => <p key={index}>{item}</p>)}
                      </div>
                    )}
                    {drugInfo.warnings?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Warnings</h5>
                        {drugInfo.warnings.map((item, index) => <p key={index}>{item}</p>)}
                      </div>
                    )}
                    {drugInfo.adverse_reactions?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Adverse Reactions</h5>
                        {drugInfo.adverse_reactions.map((item, index) => <p key={index}>{item}</p>)}
                      </div>
                    )}
                    {drugInfo.contraindications?.length > 0 && (
                      <div className="drug-info-section">
                        <h5>Contraindications</h5>
                        {drugInfo.contraindications.map((item, index) => <p key={index}>{item}</p>)}
                      </div>
                    )}
                    <p className="drug-info-source">Source: {drugInfo.source}</p>
                  </div>
                )}
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
          </>
        )}

        {/* Separate My Medications view */}
        {activePage === 'my-medications' && (
          <section className="my-medications-section" id="my-medications">
            <div className="section-heading">
              <h2>My Medications</h2>
            </div>

            <article className="tool-card my-medications-card">
              <div className="tool-icon">💊</div>

              <h3>Saved Medications</h3>

              <p>
                View and manage the medications saved to your personal list.
              </p>

              {/* Add Medication Form */}
              <form
                className="search-form"
                onSubmit={handleAddMedication}
              >
                <input
                  type="text"
                  value={newMedicationName}
                  onChange={(event) => setNewMedicationName(event.target.value)}
                  placeholder="Medication name (e.g. Carbamazepine)"
                  aria-label="Medication name to add"
                  maxLength={100}
                  required
                />

                <input
                  type="text"
                  value={newMedicationDosage}
                  onChange={(event) => setNewMedicationDosage(event.target.value)}
                  placeholder="Dosage (e.g. 200 mg)"
                  aria-label="Medication dosage"
                  maxLength={255}
                />

                <input
                  type="text"
                  value={newMedicationFrequency}
                  onChange={(event) => setNewMedicationFrequency(event.target.value)}
                  placeholder="Frequency (e.g. Twice daily)"
                  aria-label="Medication frequency"
                  maxLength={255}
                />

                <button type="submit" disabled={addingMedication}>
                  {addingMedication ? 'Adding...' : 'Add Medication'}
                </button>
              </form>

              {myMedicationsLoading && (
                <p className="search-status">
                  Loading your medications...
                </p>
              )}

              {myMedicationsError && (
                <p className="search-error">
                  {myMedicationsError}
                </p>
              )}

              {myMedicationsSuccess && (
                <p className="search-status">
                  {myMedicationsSuccess}
                </p>
              )}

              {!myMedicationsLoading &&
                !myMedicationsError &&
                myMedications.length === 0 && (
                  <p className="search-status">
                    You haven't added any medications yet.
                  </p>
                )}

              {!myMedicationsLoading && myMedications.length > 0 && (
                <div className="search-results">
                  <h4>
                    My Medication List ({myMedications.length})
                  </h4>

                  {myMedications.map((medication) => (
                    <div
                      className="search-result"
                      key={medication.user_med_id}
                    >
                      <h5>{medication.drug_name}</h5>

                      {medication.generic_name && (
                        <p>
                          <strong>Generic Name:</strong>{' '}
                          {medication.generic_name}
                        </p>
                      )}

                      {medication.brand_name && (
                        <p>
                          <strong>Brand Name:</strong>{' '}
                          {medication.brand_name}
                        </p>
                      )}

                      <p>
                        <strong>Dosage:</strong>{' '}
                        {medication.dosage || 'Not specified'}
                      </p>

                      <p>
                        <strong>Frequency:</strong>{' '}
                        {medication.frequency || 'Not specified'}
                      </p>

                      {medication.added_at && (
                        <p>
                          <strong>Date Added:</strong>{' '}
                          {new Date(medication.added_at).toLocaleDateString()}
                        </p>
                      )}

                      <button
                        type="button"
                        className="remove-medication-btn"
                        onClick={() => handleRemoveMedication(medication.user_med_id)}
                      >
                        Remove Medication
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}

        {/* Separate My Profile view */}
        {activePage === 'profile' && (
          <section className="profile-section" id="profile">
            <div className="section-heading">
              <h2>My Profile</h2>
            </div>
            <article className="tool-card profile-card">
              <div className="tool-icon">♙</div>
              <h3>Account Information</h3>
              <p>View your account details.</p>
              {profileLoading && <p className="search-status">Loading your profile...</p>}
              {profileError && <p className="search-error">{profileError}</p>}
              {profile && !profileLoading && (
                <div className="profile-details">
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                </div>
              )}
            </article>
          </section>
        )}

        <footer>
          <span>HEALTHCARE · Medication management within your reach</span>
          <span>For informational purposes only</span>
        </footer>
      </main>
    </div>
  )
}

export default App
