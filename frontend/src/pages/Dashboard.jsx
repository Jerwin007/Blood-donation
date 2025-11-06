import React, { useState } from 'react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [donors, setDonors] = useState([])
  const [supplies, setSupplies] = useState([])
  const [donorForm, setDonorForm] = useState({ name: '', bloodGroup: '', contact: '' })
  const [supplyForm, setSupplyForm] = useState({ bloodGroup: '', quantity: '' })

  const handleDonorChange = e => setDonorForm({ ...donorForm, [e.target.name]: e.target.value })
  const handleSupplyChange = e => setSupplyForm({ ...supplyForm, [e.target.name]: e.target.value })

  const addDonor = e => {
    e.preventDefault()
    if (!donorForm.name || !donorForm.bloodGroup || !donorForm.contact)
      return alert('Please fill all fields')
    setDonors([...donors, donorForm])
    setDonorForm({ name: '', bloodGroup: '', contact: '' })
    alert('✅ Donor added successfully')
  }

  const addSupply = e => {
    e.preventDefault()
    if (!supplyForm.bloodGroup || !supplyForm.quantity)
      return alert('Please fill all fields')

    // convert to number and update or add
    const existing = supplies.find(s => s.bloodGroup === supplyForm.bloodGroup)
    let updatedSupplies
    if (existing) {
      updatedSupplies = supplies.map(s =>
        s.bloodGroup === supplyForm.bloodGroup
          ? { ...s, quantity: parseInt(s.quantity) + parseInt(supplyForm.quantity) }
          : s
      )
    } else {
      updatedSupplies = [...supplies, { ...supplyForm, quantity: parseInt(supplyForm.quantity) }]
    }

    setSupplies(updatedSupplies)
    setSupplyForm({ bloodGroup: '', quantity: '' })
    alert('🩸 Blood supply updated successfully')
  }

  return (
    <div className="dashboard-container">
      <h1>🩸 Blood Donation Dashboard</h1>

      <div className="nav">
        <button onClick={() => setActiveTab('home')}>🏠 Home</button>
        <button onClick={() => setActiveTab('donor')}>➕ Add Donor</button>
        <button onClick={() => setActiveTab('supply')}>🏥 Add Supply</button>
        <button onClick={() => setActiveTab('list')}>📋 View Donors</button>
        <button onClick={() => setActiveTab('stock')}>💉 Supply Overview</button>
      </div>

      <div className="content">
        {activeTab === 'home' && (
          <div className="card">
            <h2>Welcome to Blood Donation Portal</h2>
            <p>
              Manage donors and available blood supplies efficiently.  
              Use the menu above to add donors, record new supplies, or check stock levels.
            </p>
          </div>
        )}

        {activeTab === 'donor' && (
          <div className="card">
            <h2>Add Donor</h2>
            <form onSubmit={addDonor}>
              <input
                name="name"
                value={donorForm.name}
                placeholder="Donor Name"
                onChange={handleDonorChange}
                required
              />
              <input
                name="bloodGroup"
                value={donorForm.bloodGroup}
                placeholder="Blood Group (A+, O-, etc.)"
                onChange={handleDonorChange}
                required
              />
              <input
                name="contact"
                value={donorForm.contact}
                placeholder="Contact Number"
                onChange={handleDonorChange}
                required
              />
              <button type="submit">Add Donor</button>
            </form>
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="card">
            <h2>Add Blood Supply</h2>
            <form onSubmit={addSupply}>
              <input
                name="bloodGroup"
                value={supplyForm.bloodGroup}
                placeholder="Blood Group"
                onChange={handleSupplyChange}
                required
              />
              <input
                name="quantity"
                type="number"
                value={supplyForm.quantity}
                placeholder="Quantity (in units)"
                onChange={handleSupplyChange}
                required
              />
              <button type="submit">Add / Update Supply</button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="card">
            <h2>Registered Donors</h2>
            {donors.length === 0 ? (
              <p>No donors added yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.bloodGroup}</td>
                      <td>{d.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="card">
            <h2>💉 Current Blood Supply Stock</h2>
            {supplies.length === 0 ? (
              <p>No blood supply records yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Available Units</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((s, i) => (
                    <tr key={i}>
                      <td>{s.bloodGroup}</td>
                      <td>{s.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
