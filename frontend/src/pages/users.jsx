import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import "../App.css"

function Users() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  })

  const navigate = useNavigate()

  const fetchUsers = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/")
      return
    }

    try {
      const response = await api.get("/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setUsers(response.data)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/")
      } else {
        setError(
          err.response?.data?.detail ||
          "Could not load users"
        )
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async (event) => {
    event.preventDefault()
    setError("")

    const token = localStorage.getItem("token")

    try {
      const response = await api.post(
        "/users/",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUsers((currentUsers) => [
        ...currentUsers,
        response.data,
      ])

      setNewUser({
        name: "",
        email: "",
        department: "",
        password: "",
      })

      setShowAddForm(false)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        "Could not create user"
      )
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AssetHub</h2>

        <p
          onClick={() => navigate("/dashboard")}
          className="sidebar-link"
        >
          Dashboard
        </p>

        <p
          onClick={() => navigate("/dashboard")}
          className="sidebar-link"
        >
          Assets
        </p>

        <p className="sidebar-link active-sidebar-link">
          Users
        </p>

        <button onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <div className="page-header dashboard-header">
          <div>
            <h1>Users</h1>
            <p>
              Manage users who can be assigned
              organization assets.
            </p>
          </div>

          <button
            className="add-asset-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add User
          </button>
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        {showAddForm && (
          <div className="asset-form-container">
            <div className="asset-form-header">
              <h2>Add User</h2>

              <button
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>

            <form
              className="asset-form"
              onSubmit={handleAddUser}
            >
              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      name: event.target.value,
                    })
                  }
                  placeholder="Jordan Smith"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      email: event.target.value,
                    })
                  }
                  placeholder="jordan@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>

                <input
                  type="text"
                  value={newUser.department}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      department: event.target.value,
                    })
                  }
                  placeholder="Information Technology"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      password: event.target.value,
                    })
                  }
                  placeholder="Create a password"
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        <section className="table-section">
          <h2>Organization Users</h2>

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
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

export default Users