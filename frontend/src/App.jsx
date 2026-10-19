
import { useState } from 'react'
import './App.css'

function App() {
  const [search, setSearch] = useState('')
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const name = search.trim()

    if (!name) {
      setError('Please enter a medication name.')
      setMedications([])
      return
    }

    setLoading(true)
    setError('')
    setMedications([])

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/medications/search?name=${encodeURIComponent(name)}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to search medications.')
      }

      // Support either a list or an object containing a results list.
      const results = Array.isArray(data)
        ? data
        : data.results ?? data.medications ?? []

      setMedications(results)

      if (results.length === 0) {
        setError('No medications were found. Try another name.')
      }
    } catch (err) {
      setError(
        err.message || 'Could not connect to the backend. Make sure it is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✚</span>
          <span>
            HEALTHCARE
          </span>
        </div>

        <p className="nav-label">MENU</p>

        <nav>
          <a className="nav-item active" href="#dashboard"> Dashboard</a>
          <a className="nav-item" href="#medications"> My Medications</a>
          <a className="nav-item" href="#interactions"> Interactions</a>
          <a className="nav-item" href="#drug-info"> Drug Information</a>
          <a className="nav-item" href="#profile"> My Profile</a>
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
          </div>
        </header>

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
          <div>
            <h2>Medication tools</h2>
          </div>
        </section>

        <section className="tool-grid">
          <article className="tool-card">
            <div className="tool-icon search-icon">⌕</div>
            <h3>Search Medications</h3>
            <p>Find medication names and  inforamtion aailiable inRxNorm.</p>

            <form className="search-form" onSubmit={handleSearch}>
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

            {error && (
              <p className="search-message" role="status">
                {error}
              </p>
            )}

            {medications.length > 0 && (
              <div className="search-results" aria-live="polite">
                <h4>Search results</h4>

                {medications.map((medication, index) => (
                  <div
                    className="medication-result"
                    key={medication.rxcui ?? medication.id ?? index}
                  >
                    <strong>
                      {medication.name ??
                        medication.display_name ??
                        medication.str ??
                        'Medication'}
                    </strong>

                    {(medication.rxcui ?? medication.id) && (
                      <span>
                        RxCUI / ID: {medication.rxcui ?? medication.id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="tool-card" id="interactions">
            <div className="tool-icon interaction-icon">⚕</div>
            <h3>Check Interactions</h3>
            <p>Review possible interactions between two medication records.</p>
            <a className="card-link" href="#interactions">
              Check medications <span>→</span>
            </a>
          </article>

          <article className="tool-card" id="drug-info">
            <div className="tool-icon info-icon">ⓘ</div>
            <h3>Drug Information</h3>
            <p>Explore available uses, warnings, and label information.</p>
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
              This application provides informational support, not a diagnosis
              or a substitute for professional medical advice. Never start,
              stop, or change medication based only on the information provided by this application.
              When in doubt always consulta pharmacist or healthcare professional about concerns.
            </p>
          </div>
        </section>

        <footer>
          <span>HEALTHCARE · Medication management within your reach  </span>
          <span>For informational purposes only</span>
        </footer>
      </main>
    </div>
  )
}

export default App

