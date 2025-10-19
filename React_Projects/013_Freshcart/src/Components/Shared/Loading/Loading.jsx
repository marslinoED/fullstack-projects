import React from 'react'

export default function Loading() {
  return (
    <div className='Loading-Content'>
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '800px' }}>
        <div className="spinner-border" role="status" style={{ color: 'var(--bs-primary)', width: '6rem', height: '6rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5 text-secondary">Loading...</p>
      </div>
    </div>
  )
}
