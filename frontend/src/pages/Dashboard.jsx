import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "../App.css"

function Dashboard() {
  const [assets, setAssets] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [assigningAsset, setAssigningAsset] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState("")

  const [newAsset, setNewAsset] = useState({
    asset_tag: "",
    asset_type: "",
    brand: "",
    model: "",
  })

  const [editAsset, setEditAsset] = useState({
    asset_tag: "",
    asset_type: "",
    brand: "",
    model: "",
    status: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/")
        return
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      try {
        const assetsResponse = await api.get("/assets/", config)
        setAssets(assetsResponse.data)

        const usersResponse = await api.get("/users/", config)
        setUsers(usersResponse.data)
      } catch (err) {
        console.error(err)

        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/")
        } else {
          setError(
            err.response?.data?.detail ||
            "Could not load dashboard data"
          )
        }
      }
    }

    fetchData()
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

  const handleEditClick = (asset) => {
    setShowAddForm(false)
    setAssigningAsset(null)
    setEditingAsset(asset)

    setEditAsset({
      asset_tag: asset.asset_tag,
      asset_type: asset.asset_type,
      brand: asset.brand,
      model: asset.model,
      status: asset.status,
    })
  }

  const handleEditAsset = async (event) => {
    event.preventDefault()
    setError("")

    const token = localStorage.getItem("token")

    try {
      const response = await api.put(
        `/assets/${editingAsset.id}`,
        editAsset,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === editingAsset.id
            ? response.data
            : asset
        )
      )

      setEditingAsset(null)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not update asset"
      )
    }
  }

  const handleAssignClick = (asset) => {
    setShowAddForm(false)
    setEditingAsset(null)
    setAssigningAsset(asset)

    if (asset.assigned_to) {
      setSelectedUserId(String(asset.assigned_to))
    } else {
      setSelectedUserId("")
    }
  }

  const handleAssignAsset = async (event) => {
    event.preventDefault()
    setError("")

    if (!selectedUserId) {
      setError("Please select a user")
      return
    }

    const token = localStorage.getItem("token")

    try {
      const response = await api.post(
        `/assets/${assigningAsset.id}/assign/${selectedUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === assigningAsset.id
            ? response.data
            : asset
        )
      )

      setAssigningAsset(null)
      setSelectedUserId("")
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not assign asset"
      )
    }
  }

  const handleUnassignAsset = async () => {
    setError("")

    const token = localStorage.getItem("token")

    try {
      const response = await api.post(
        `/assets/${assigningAsset.id}/unassign`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === assigningAsset.id
            ? response.data
            : asset
        )
      )

      setAssigningAsset(null)
      setSelectedUserId("")
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not unassign asset"
      )
    }
  }

  const handleDeleteAsset = async (asset) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${asset.asset_tag}?`
    )

    if (!confirmed) {
      return
    }

    setError("")

    const token = localStorage.getItem("token")

    try {
      await api.delete(`/assets/${asset.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setAssets((currentAssets) =>
        currentAssets.filter(
          (currentAsset) => currentAsset.id !== asset.id
        )
      )

      if (editingAsset?.id === asset.id) {
        setEditingAsset(null)
      }

      if (assigningAsset?.id === asset.id) {
        setAssigningAsset(null)
        setSelectedUserId("")
      }
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not delete asset"
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

        <button onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">

        {/* PAGE HEADER */}

        <div className="page-header dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Manage and monitor your organization&apos;s assets.
            </p>
          </div>

          <button
            className="add-asset-button"
            onClick={() => {
              setEditingAsset(null)
              setAssigningAsset(null)
              setShowAddForm(true)
            }}
          >
            + Add Asset
          </button>
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        {/* ADD ASSET */}

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

            <form
              onSubmit={handleAddAsset}
              className="asset-form"
            >
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

        {/* EDIT ASSET */}

        {editingAsset && (
          <div className="asset-form-container">
            <div className="asset-form-header">
              <h2>Edit Asset</h2>

              <button
                className="close-button"
                onClick={() => setEditingAsset(null)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleEditAsset}
              className="asset-form"
            >
              <div className="form-group">
                <label>Asset Tag</label>

                <input
                  type="text"
                  value={editAsset.asset_tag}
                  onChange={(event) =>
                    setEditAsset({
                      ...editAsset,
                      asset_tag: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Asset Type</label>

                <input
                  type="text"
                  value={editAsset.asset_type}
                  onChange={(event) =>
                    setEditAsset({
                      ...editAsset,
                      asset_type: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand</label>

                <input
                  type="text"
                  value={editAsset.brand}
                  onChange={(event) =>
                    setEditAsset({
                      ...editAsset,
                      brand: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Model</label>

                <input
                  type="text"
                  value={editAsset.model}
                  onChange={(event) =>
                    setEditAsset({
                      ...editAsset,
                      model: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  value={editAsset.status}
                  onChange={(event) =>
                    setEditAsset({
                      ...editAsset,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Assigned">
                    Assigned
                  </option>

                  <option value="Maintenance">
                    Maintenance
                  </option>

                  <option value="Retired">
                    Retired
                  </option>
                </select>
              </div>

              <div className="asset-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingAsset(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ASSIGN / UNASSIGN ASSET */}

        {assigningAsset && (
          <div className="asset-form-container">
            <div className="asset-form-header">
              <div>
                <h2>Assign Asset</h2>
                <p>
                  {assigningAsset.asset_tag} —{" "}
                  {assigningAsset.brand}{" "}
                  {assigningAsset.model}
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => {
                  setAssigningAsset(null)
                  setSelectedUserId("")
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAssignAsset}
              className="asset-form"
            >
              <div className="form-group">
                <label>Assign To</label>

                <select
                  value={selectedUserId}
                  onChange={(event) =>
                    setSelectedUserId(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a user
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name} — {user.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="asset-form-actions">

                {assigningAsset.assigned_to && (
                  <button
                    type="button"
                    className="unassign-button"
                    onClick={handleUnassignAsset}
                  >
                    Unassign
                  </button>
                )}

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setAssigningAsset(null)
                    setSelectedUserId("")
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Assign Asset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OVERVIEW CARDS */}

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

        {/* ASSET TABLE */}

        <section className="table-section">
          <h2>Assets</h2>

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
                  <th>Actions</th>
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
                        className={
                          `status status-${asset.status.toLowerCase()}`
                        }
                      >
                        {asset.status}
                      </span>
                    </td>

                    <td>
                      {asset.assigned_user
                        ? asset.assigned_user.name
                        : "Unassigned"}
                    </td>

                    <td>
                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEditClick(asset)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="assign-button"
                          onClick={() =>
                            handleAssignClick(asset)
                          }
                        >
                          {asset.assigned_to
                            ? "Manage"
                            : "Assign"}
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteAsset(asset)
                          }
                        >
                          Delete
                        </button>

                      </div>
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