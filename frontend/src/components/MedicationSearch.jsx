
import { useState } from 'react'
import { apiRequest } from '../services/api'
import './MedicationSearch.css'

function MedicationSearch() {
  const [search, setSearch] = useState('')
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()

    const medicationName = search.trim()

    if (!medicationName) {
      setError('Please enter a medication name.')
      return
    }

    setLoading(true)
    setError('')
    setMedications([])
    setSearched(false)

    try {
      const results = await apiRequest(
        `/medications/search?name=${encodeURIComponent(medicationName)}`
      )

      setMedications(Array.isArray(results) ? results : results.results || [])
      setSearched(true)
    } catch (err) {
      setError(err.message || 'Unable to search medications.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="medication-search">
      <div className="medication-search-heading">
        <span className="medication-search-icon">⌕</span>
        <div>
          <h2>Medication Search</h2>
          <p>Search the RxNorm medication database.</p>
        </div>
      </div>

     <form
        className="search-form"
        onSubmit={async (event) => {
            event.preventDefault()

            if (!search.trim()) return

            try {
            const results = await apiRequest(
                `/medications/search?name=${encodeURIComponent(search.trim())}`
            )

            console.log('Medication search results:', results)
            alert(`Search successful! Found ${results.length} results. Check the browser console for details.`)
            } catch (error) {
            alert(`Medication search failed: ${error.message}`)
            }
        }}
        >

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="medication-error">{error}</p>}

      {searched && medications.length === 0 && (
        <p className="medication-empty">
          No matching medications were found.
        </p>
      )}

      {medications.length > 0 && (
        <div className="medication-results">
          <h3>Search Results</h3>

          {medications.map((medication, index) => (
            <article
              className="medication-result-card"
              key={medication.rxcui || index}
            >
              <div>
                <h4>{medication.name}</h4>
                <p>RxNorm ID: {medication.rxcui}</p>
                {medication.type && <p>Type: {medication.type}</p>}
                {medication.synonym && (
                  <p>Synonym: {medication.synonym}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="medication-disclaimer">
        Search results are informational. Always verify medication details
        with a healthcare professional.
      </p>
    </section>
  )
}

export default MedicationSearch
