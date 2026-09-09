import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "../App.css"

function Dashboard() {
  const [assets, setAssets] = useState([])
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAssets = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/")
        return
      }

      try {
        const response = await api.get("/assets/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setAssets(response.data)
      } catch (err) {
        console.error(err)

        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/")
        } else {
          setError("Could not load assets")
        }
      }
    }

    fetchAssets()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const totalAssets = assets.length

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
  ).length

  const assignedAssets = assets.filter(
    (asset) => asset.status === "Assigned"
  ).length

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AssetHub</h2>

        <p>Dashboard</p>
        <p>Assets</p>
        <p>Users</p>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Manage and monitor your organization’s assets.</p>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Total Assets</h3>
            <p>{totalAssets}</p>
          </div>

          <div className="card">
            <h3>Available</h3>
            <p>{availableAssets}</p>
          </div>

          <div className="card">
            <h3>Assigned</h3>
            <p>{assignedAssets}</p>
          </div>

          <div className="card">
            <h3>Maintenance</h3>
            <p>{maintenanceAssets}</p>
          </div>
        </div>

        <section className="table-section">
          <h2>Assets</h2>

          {error && <p className="error">{error}</p>}

          {assets.length === 0 ? (
            <p>No assets found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Type</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.asset_tag}</td>
                    <td>{asset.asset_type}</td>
                    <td>{asset.brand}</td>
                    <td>{asset.model}</td>

                    <td>
                      <span
                        className={`status status-${asset.status.toLowerCase()}`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    <td>
                      {asset.assigned_user
                        ? asset.assigned_user.name
                        : "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard