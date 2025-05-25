import React, { useState } from 'react'
import { Button } from '../components/Button'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="app">
      <h1>Solarx Vite UI - Button Component</h1>
      
      <section className="section">
        <h2>Variants</h2>
        <div className="button-group">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="section">
        <h2>Sizes</h2>
        <div className="button-group">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </section>

      <section className="section">
        <h2>States</h2>
        <div className="button-group">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleLoadingClick}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      <section className="section">
        <h2>With Icons</h2>
        <div className="button-group">
          <Button leftIcon={<span>👈</span>}>Left Icon</Button>
          <Button rightIcon={<span>👉</span>}>Right Icon</Button>
          <Button 
            leftIcon={<span>📧</span>} 
            rightIcon={<span>📤</span>}
            variant="outline"
          >
            Both Icons
          </Button>
        </div>
      </section>

      <section className="section">
        <h2>Full Width</h2>
        <Button fullWidth variant="primary">
          Full Width Button
        </Button>
      </section>
    </div>
  )
}

export default App