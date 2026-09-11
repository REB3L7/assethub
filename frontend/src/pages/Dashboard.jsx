import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "../App.css"

function Dashboard() {
  const [assets, setAssets] = useState([])
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const [newAsset, setNewAsset] = useState({
    asset_tag: "",
    asset_type: "",
    brand: "",
    model: "",
  })

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

  const handleAddAsset = async (event) => {
    event.preventDefault()
    setError("")

    const token = localStorage.getItem("token")

    try {
      const response = await api.post("/assets/", newAsset, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setAssets((currentAssets) => [
        ...currentAssets,
        response.data,
      ])

      setNewAsset({
        asset_tag: "",
        asset_type: "",
        brand: "",
        model: "",
      })

      setShowAddForm(false)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not create asset"
      )
    }
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
        <div className="page-header dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Manage and monitor your organization’s assets.</p>
          </div>

          <button
            className="add-asset-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add Asset
          </button>
        </div>

        {showAddForm && (
          <div className="asset-form-container">
            <div className="asset-form-header">
              <h2>Add Asset</h2>

              <button
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="asset-form">
              <div className="form-group">
                <label>Asset Tag</label>

                <input
                  type="text"
                  value={newAsset.asset_tag}
                  onChange={(event) =>
                    setNewAsset({
                      ...newAsset,
                      asset_tag: event.target.value,
                    })
                  }
                  placeholder="LAP-002"
                  required
                />
              </div>

              <div className="form-group">
                <label>Asset Type</label>

                <input
                  type="text"
                  value={newAsset.asset_type}
                  onChange={(event) =>
                    setNewAsset({
                      ...newAsset,
                      asset_type: event.target.value,
                    })
                  }
                  placeholder="Laptop"
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand</label>

                <input
                  type="text"
                  value={newAsset.brand}
                  onChange={(event) =>
                    setNewAsset({
                      ...newAsset,
                      brand: event.target.value,
                    })
                  }
                  placeholder="Apple"
                  required
                />
              </div>

              <div className="form-group">
                <label>Model</label>

                <input
                  type="text"
                  value={newAsset.model}
                  onChange={(event) =>
                    setNewAsset({
                      ...newAsset,
                      model: event.target.value,
                    })
                  }
                  placeholder="MacBook Air M2"
                  required
                />
              </div>

              <div className="asset-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        )}

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