// src/App.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css"; // <-- change from fullpage.css to app.css
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [currentUser, setCurrentUser] = useState(null);

  // Auth States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Donor States
  const [donors, setDonors] = useState([]);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorBloodGroup, setDonorBloodGroup] = useState("");
  const [donorAge, setDonorAge] = useState("");
  const [donorAddress, setDonorAddress] = useState("");

  // Request States
  const [requests, setRequests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [requestBloodGroup, setRequestBloodGroup] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [contactNumber, setContactNumber] = useState("");

  // Inventory States
  const [inventory, setInventory] = useState([]);
  const [inventoryBloodGroup, setInventoryBloodGroup] = useState("");
  const [inventoryUnits, setInventoryUnits] = useState("");

  // Statistics
  const [stats, setStats] = useState({});

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const API_URL = "http://localhost:7000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) verifyToken(token);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === "success") {
        setIsLoggedIn(true);
        setCurrentUser(response.data.user);
        loadDashboard();
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  };

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        fullName, email, username, password, confirmPassword
      });
      if (response.data.status === "success") {
        showMessage(response.data.message, "success");
        clearRegisterForm();
        setShowLogin(true);
      } else {
        showMessage(response.data.message, "danger");
      }
    } catch {
      showMessage("Registration failed. Please try again.", "danger");
    }
  };

  const clearRegisterForm = () => {
    setFullName(""); setEmail(""); setUsername(""); setPassword(""); setConfirmPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        usernameOrEmail, password: loginPassword
      });
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        setIsLoggedIn(true);
        setCurrentUser(response.data.user);
        showMessage(response.data.message, "success");
        clearLoginForm();
        loadDashboard();
      } else {
        showMessage(response.data.message, "danger");
      }
    } catch {
      showMessage("Login failed. Please try again.", "danger");
    }
  };

  const clearLoginForm = () => {
    setUsernameOrEmail(""); setLoginPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab("dashboard");
    showMessage("Logged out successfully", "info");
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadDashboard = () => {
    loadDonors(); loadRequests(); loadInventory(); loadStatistics();
  };

  const loadDonors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/donors/viewAll`, getAuthHeaders());
      setDonors(response.data);
    } catch (err) { console.log(err); }
  };

  const loadRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/requests/viewAll`, getAuthHeaders());
      setRequests(response.data);
    } catch (err) { console.log(err); }
  };

  const loadInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory/viewAll`, getAuthHeaders());
      setInventory(response.data);
    } catch (err) { console.log(err); }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/statistics`, getAuthHeaders());
      setStats(response.data);
    } catch (err) { console.log(err); }
  };

  const addDonor = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/donors/add`, {
        name: donorName, email: donorEmail, phone: donorPhone, 
        bloodGroup: donorBloodGroup, age: donorAge, address: donorAddress
      }, getAuthHeaders());
      showMessage(response.data.message, response.data.status === "success" ? "success" : "danger");
      if (response.data.status === "success") {
        clearDonorForm(); loadDonors(); loadStatistics();
      }
    } catch { showMessage("Error adding donor", "danger"); }
  };

  const clearDonorForm = () => {
    setDonorName(""); setDonorEmail(""); setDonorPhone(""); 
    setDonorBloodGroup(""); setDonorAge(""); setDonorAddress("");
  };

  const deleteDonor = async (id) => {
    if (window.confirm("Are you sure you want to delete this donor?")) {
      try {
        const response = await axios.post(`${API_URL}/api/donors/delete`, { id }, getAuthHeaders());
        showMessage(response.data.message, "success");
        loadDonors(); loadStatistics();
      } catch { showMessage("Error deleting donor", "danger"); }
    }
  };

  const addRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/requests/add`, {
        patientName, hospitalName, bloodGroup: requestBloodGroup, 
        unitsNeeded, urgency, contactNumber
      }, getAuthHeaders());
      showMessage(response.data.message, response.data.status === "success" ? "success" : "danger");
      if (response.data.status === "success") {
        clearRequestForm(); loadRequests(); loadStatistics();
      }
    } catch { showMessage("Error adding request", "danger"); }
  };

  const clearRequestForm = () => {
    setPatientName(""); setHospitalName(""); setRequestBloodGroup(""); 
    setUnitsNeeded(""); setUrgency("Normal"); setContactNumber("");
  };

  const deleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const response = await axios.post(`${API_URL}/api/requests/delete`, { id }, getAuthHeaders());
        showMessage(response.data.message, "success");
        loadRequests(); loadStatistics();
      } catch { showMessage("Error deleting request", "danger"); }
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.post(`${API_URL}/api/requests/updateStatus`, { id, status }, getAuthHeaders());
      showMessage(response.data.message, "success");
      loadRequests(); loadStatistics();
    } catch { showMessage("Error updating status", "danger"); }
  };

  const updateInventory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/inventory/update`, {
        bloodGroup: inventoryBloodGroup, unitsAvailable: inventoryUnits
      }, getAuthHeaders());
      showMessage(response.data.message, response.data.status === "success" ? "success" : "danger");
      if (response.data.status === "success") {
        setInventoryBloodGroup(""); setInventoryUnits("");
        loadInventory(); loadStatistics();
      }
    } catch { showMessage("Error updating inventory", "danger"); }
  };

  // LOGIN/REGISTER UI (FULL-WIDTH)
  if (!isLoggedIn) {
    return (
      <div className="app-full" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container-fluid px-0">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh', margin: 0 }}>
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div className="text-center py-5" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
                  <div style={{ fontSize: '60px' }}>🩸</div>
                  <h2 className="text-white fw-bold mb-2">Blood Donation Portal</h2>
                  <p className="text-white-50 mb-0">Save Lives, Donate Blood</p>
                </div>

                <div className="card-body p-5">
                  <div className="btn-group w-100 mb-4" role="group">
                    <button
                      type="button"
                      className={`btn btn-lg ${showLogin ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setShowLogin(true)}
                      style={{ borderRadius: '10px 0 0 10px', fontWeight: '600' }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`btn btn-lg ${!showLogin ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setShowLogin(false)}
                      style={{ borderRadius: '0 10px 10px 0', fontWeight: '600' }}
                    >
                      Register
                    </button>
                  </div>

                  {message && (
                    <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                      {message}
                      <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                    </div>
                  )}

                  {showLogin ? (
                    <form onSubmit={handleLogin}>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary">Username or Email</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Enter your username or email"
                          value={usernameOrEmail}
                          onChange={(e) => setUsernameOrEmail(e.target.value)}
                          required
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary">Password</label>
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-danger btn-lg w-100 fw-semibold"
                        style={{ borderRadius: '10px', padding: '12px' }}
                      >
                        Login to Account
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Choose a username (min 3 characters)"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          minLength="3"
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Create password (min 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength="6"
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-danger btn-lg w-100 fw-semibold"
                        style={{ borderRadius: '10px', padding: '12px' }}
                      >
                        Create Account
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-white">
                  <small>🩸 Every donation saves 3 lives • Be a hero today!</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD UI (FULL-WIDTH)
  return (
    <div className="app-full" style={{ backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', margin: 0, padding: '1rem 3rem' }}>
        <div className="w-100 d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1" style={{ fontSize: '24px' }}>
            <span style={{ fontSize: '32px' }}>🩸</span> <strong>Blood Donation Management System</strong>
          </span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white" style={{ fontSize: '16px' }}>
              Welcome, <strong>{currentUser?.fullName}</strong>
            </span>
            <button className="btn btn-light btn-lg" onClick={handleLogout} style={{ borderRadius: '25px', padding: '10px 30px', fontWeight: '600' }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="w-100" style={{ padding: '0 3rem', backgroundColor: '#fff', borderBottom: '2px solid #e0e0e0' }}>
        <ul className="nav nav-tabs border-0" style={{ gap: '15px', paddingTop: '15px' }}>
          {['dashboard', 'donors', 'requests', 'inventory'].map(tab => (
            <li className="nav-item" key={tab}>
              <button 
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: 'none',
                  borderRadius: '12px 12px 0 0',
                  fontWeight: '700',
                  fontSize: '18px',
                  padding: '15px 35px',
                  color: activeTab === tab ? '#dc3545' : '#6c757d',
                  backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                  borderBottom: activeTab === tab ? '4px solid #dc3545' : 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'donors' && '👥 Donor Management'}
                {tab === 'requests' && '📋 Blood Requests'}
                {tab === 'inventory' && '🏥 Blood Inventory'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Message Display */}
      {message && (
        <div className="w-100" style={{ padding: '20px 3rem 0 3rem' }}>
          <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert" style={{ fontSize: '16px' }}>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="w-100" style={{ padding: '40px 3rem' }}>
          <h2 className="mb-5 fw-bold" style={{ fontSize: '36px', color: '#2c3e50' }}>📊 Dashboard Overview</h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4" style={{ margin: 0 }}>
            <div className="col">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '200px' }}>
                <div className="card-body text-white text-center py-5">
                  <div style={{ fontSize: '56px', marginBottom: '15px' }}>👥</div>
                  <h1 className="fw-bold" style={{ fontSize: '52px', marginBottom: '10px' }}>{stats.totalDonors || 0}</h1>
                  <p className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>Total Donors</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '200px' }}>
                <div className="card-body text-white text-center py-5">
                  <div style={{ fontSize: '56px', marginBottom: '15px' }}>✅</div>
                  <h1 className="fw-bold" style={{ fontSize: '52px', marginBottom: '10px' }}>{stats.availableDonors || 0}</h1>
                  <p className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>Available Donors</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', minHeight: '200px' }}>
                <div className="card-body text-white text-center py-5">
                  <div style={{ fontSize: '56px', marginBottom: '15px' }}>⏳</div>
                  <h1 className="fw-bold" style={{ fontSize: '52px', marginBottom: '10px' }}>{stats.pendingRequests || 0}</h1>
                  <p className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>Pending Requests</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', minHeight: '200px' }}>
                <div className="card-body text-white text-center py-5">
                  <div style={{ fontSize: '56px', marginBottom: '15px' }}>🩸</div>
                  <h1 className="fw-bold" style={{ fontSize: '52px', marginBottom: '10px' }}>{stats.totalBloodUnits || 0}</h1>
                  <p className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>Total Blood Units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donors Tab */}
      {activeTab === "donors" && (
        <div className="w-100" style={{ padding: '40px 3rem' }}>
          <h2 className="fw-bold mb-4" style={{ fontSize: '36px', color: '#2c3e50' }}>👥 Donor Management</h2>
          
          <form onSubmit={addDonor} className="card p-5 mb-5 border-0 shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
            <h4 className="mb-4 fw-bold" style={{ color: '#dc3545', fontSize: '24px' }}>➕ Add New Donor</h4>
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control form-control-lg" placeholder="Enter full name" value={donorName} onChange={(e) => setDonorName(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Email Address</label>
                <input type="email" className="form-control form-control-lg" placeholder="Enter email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Phone Number</label>
                <input type="tel" className="form-control form-control-lg" placeholder="Enter phone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Blood Group</label>
                <select className="form-control form-control-lg" value={donorBloodGroup} onChange={(e) => setDonorBloodGroup(e.target.value)} required style={{ borderRadius: '12px' }}>
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Age</label>
                <input type="number" className="form-control form-control-lg" placeholder="Enter age" value={donorAge} onChange={(e) => setDonorAge(e.target.value)} required min="18" max="65" style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Address</label>
                <input type="text" className="form-control form-control-lg" placeholder="Enter address" value={donorAddress} onChange={(e) => setDonorAddress(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-danger btn-lg mt-4 fw-bold" style={{ borderRadius: '12px', padding: '14px 50px' }}>
              ➕ Add Donor
            </button>
          </form>

          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white py-4" style={{ borderRadius: '20px 20px 0 0', borderBottom: '2px solid #f0f0f0' }}>
              <h3 className="fw-bold mb-0" style={{ fontSize: '26px', color: '#2c3e50' }}>📋 Registered Donors List</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '16px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="py-4 px-4 fw-bold">#</th>
                      <th className="py-4 fw-bold">Name</th>
                      <th className="py-4 fw-bold">Email</th>
                      <th className="py-4 fw-bold">Phone</th>
                      <th className="py-4 fw-bold">Blood Group</th>
                      <th className="py-4 fw-bold">Age</th>
                      <th className="py-4 fw-bold">Address</th>
                      <th className="py-4 fw-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-5 text-muted" style={{ fontSize: '18px' }}>No donors registered yet</td></tr>
                    ) : (
                      donors.map((donor, index) => (
                        <tr key={donor._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="py-4">{donor.name}</td>
                          <td className="py-4">{donor.email}</td>
                          <td className="py-4">{donor.phone}</td>
                          <td className="py-4"><span className="badge bg-danger px-4 py-2" style={{ fontSize: '15px', fontWeight: '600' }}>{donor.bloodGroup}</span></td>
                          <td className="py-4">{donor.age}</td>
                          <td className="py-4">{donor.address}</td>
                          <td className="py-4">
                            <button className="btn btn-danger btn-sm fw-bold" onClick={() => deleteDonor(donor._id)} style={{ borderRadius: '10px', padding: '8px 20px', fontSize: '14px' }}>
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="w-100" style={{ padding: '40px 3rem' }}>
          <h2 className="fw-bold mb-4" style={{ fontSize: '36px', color: '#2c3e50' }}>📋 Blood Request Management</h2>
          
          <form onSubmit={addRequest} className="card p-5 mb-5 border-0 shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
            <h4 className="mb-4 fw-bold" style={{ color: '#dc3545', fontSize: '24px' }}>➕ Create New Blood Request</h4>
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Patient Name</label>
                <input type="text" className="form-control form-control-lg" placeholder="Enter patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Hospital Name</label>
                <input type="text" className="form-control form-control-lg" placeholder="Enter hospital name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-bold">Blood Group Required</label>
                <select className="form-control form-control-lg" value={requestBloodGroup} onChange={(e) => setRequestBloodGroup(e.target.value)} required style={{ borderRadius: '12px' }}>
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
              </div>
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold">Units Needed</label>
                <input type="number" className="form-control form-control-lg" placeholder="Units" value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} required min="1" style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold">Urgency Level</label>
                <select className="form-control form-control-lg" value={urgency} onChange={(e) => setUrgency(e.target.value)} required style={{ borderRadius: '12px' }}>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="col-lg-6 col-md-12">
                <label className="form-label fw-bold">Contact Number</label>
                <input type="tel" className="form-control form-control-lg" placeholder="Enter contact number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required style={{ borderRadius: '12px' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-danger btn-lg mt-4 fw-bold" style={{ borderRadius: '12px', padding: '14px 50px' }}>
              ➕ Submit Request
            </button>
          </form>

          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white py-4" style={{ borderRadius: '20px 20px 0 0', borderBottom: '2px solid #f0f0f0' }}>
              <h3 className="fw-bold mb-0" style={{ fontSize: '26px', color: '#2c3e50' }}>📝 Blood Requests List</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '16px' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="py-4 px-4 fw-bold">#</th>
                      <th className="py-4 fw-bold">Patient</th>
                      <th className="py-4 fw-bold">Hospital</th>
                      <th className="py-4 fw-bold">Blood Group</th>
                      <th className="py-4 fw-bold">Units</th>
                      <th className="py-4 fw-bold">Urgency</th>
                      <th className="py-4 fw-bold">Contact</th>
                      <th className="py-4 fw-bold">Status</th>
                      <th className="py-4 fw-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-5 text-muted" style={{ fontSize: '18px' }}>No blood requests yet</td></tr>
                    ) : (
                      requests.map((req, index) => (
                        <tr key={req._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="py-4">{req.patientName}</td>
                          <td className="py-4">{req.hospitalName}</td>
                          <td className="py-4"><span className="badge bg-danger px-4 py-2" style={{ fontSize: '15px', fontWeight: '600' }}>{req.bloodGroup}</span></td>
                          <td className="py-4 fw-bold">{req.unitsNeeded}</td>
                          <td className="py-4">
                            <span className={`badge px-4 py-2 ${req.urgency === "Critical" ? "bg-danger" : req.urgency === "Urgent" ? "bg-warning text-dark" : "bg-info"}`} style={{ fontSize: '15px', fontWeight: '600' }}>
                              {req.urgency}
                            </span>
                          </td>
                          <td className="py-4">{req.contactNumber}</td>
                          <td className="py-4">
                            <select 
                              className="form-select fw-bold" 
                              value={req.status} 
                              onChange={(e) => updateRequestStatus(req._id, e.target.value)} 
                              style={{ borderRadius: '10px', padding: '8px 12px', minWidth: '140px', fontSize: '15px' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Fulfilled">Fulfilled</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4">
                            <button className="btn btn-danger btn-sm fw-bold" onClick={() => deleteRequest(req._id)} style={{ borderRadius: '10px', padding: '8px 20px', fontSize: '14px' }}>
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="w-100" style={{ padding: '40px 3rem' }}>
          <h2 className="fw-bold mb-4" style={{ fontSize: '36px', color: '#2c3e50' }}>🏥 Blood Inventory Management</h2>
          
          <form onSubmit={updateInventory} className="card p-5 mb-5 border-0 shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
            <h4 className="mb-4 fw-bold" style={{ color: '#28a745', fontSize: '24px' }}>📦 Update Blood Stock</h4>
            <div className="row g-4 align-items-end">
              <div className="col-lg-5 col-md-6">
                <label className="form-label fw-bold">Select Blood Group</label>
                <select className="form-control form-control-lg" value={inventoryBloodGroup} onChange={(e) => setInventoryBloodGroup(e.target.value)} required style={{ borderRadius: '12px' }}>
                  <option value="">Choose Blood Group</option>
                  {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
              </div>
              <div className="col-lg-5 col-md-6">
                <label className="form-label fw-bold">Units Available</label>
                <input type="number" className="form-control form-control-lg" placeholder="Enter units" value={inventoryUnits} onChange={(e) => setInventoryUnits(e.target.value)} required min="0" style={{ borderRadius: '12px' }} />
              </div>
              <div className="col-lg-2 col-md-12">
                <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" style={{ borderRadius: '12px', padding: '14px' }}>
                  ✓ Update
                </button>
              </div>
            </div>
          </form>

          <h3 className="fw-bold mb-4" style={{ fontSize: '30px', color: '#2c3e50' }}>📦 Current Blood Stock Levels</h3>
          <div className="row row-cols-2 row-cols-md-4 row-cols-xl-4 g-4" style={{ margin: 0 }}>
            {bloodGroups.map((bg) => {
              const stock = inventory.find(item => item.bloodGroup === bg);
              const units = stock ? stock.unitsAvailable : 0;
              let gradientColor = '';
              let statusLabel = '';
              let statusIcon = '';
              
              if (units === 0) {
                gradientColor = 'linear-gradient(135deg, #868f96 0%, #596164 100%)';
                statusLabel = 'Out of Stock';
                statusIcon = '❌';
              } else if (units < 5) {
                gradientColor = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
                statusLabel = 'Critical Level';
                statusIcon = '⚠️';
              } else if (units < 10) {
                gradientColor = 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)';
                statusLabel = 'Low Stock';
                statusIcon = '📉';
              } else {
                gradientColor = 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)';
                statusLabel = 'Good Stock';
                statusIcon = '✅';
              }
              
              return (
                <div key={bg} className="col">
                  <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: gradientColor, minHeight: '240px' }}>
                    <div className="card-body text-white text-center py-5">
                      <h2 className="fw-bold mb-3" style={{ fontSize: '36px' }}>{bg}</h2>
                      <h1 className="display-4 fw-bold mb-2">{units}</h1>
                      <p className="mb-2 fw-bold">Units Available</p>
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.4)' }}>
                        <p className="mb-0 fw-bold">{statusIcon} {statusLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;