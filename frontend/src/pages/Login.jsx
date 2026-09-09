import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "../App.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      localStorage.setItem("token", response.data.access_token)
      navigate("/dashboard")
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login failed"
      )
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="brand-logo">A</div>

          <div>
            <h1>AssetHub</h1>
            <p>IT Asset Management Platform</p>
          </div>
        </div>

        <div className="login-content">
          <h2>Welcome back</h2>
          <p className="login-subtitle">
            Sign in to manage your organization&apos;s assets.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button type="submit" className="login-button">
              Sign in
            </button>
          </form>
        </div>
      </div>

      <div className="login-visual">
        <div className="visual-content">
          <h2>Keep every asset accounted for.</h2>

          <p>
            Track equipment, assignments, availability, and maintenance
            from one centralized dashboard.
          </p>

          <div className="visual-stat">
            <span>AssetHub</span>
            <strong>Simple. Secure. Organized.</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login