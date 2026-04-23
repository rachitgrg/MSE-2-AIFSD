import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, addItem, updateItem, deleteItem, searchItems } from '../api';
import './Dashboard.css';

const ITEM_TYPES = ['Lost', 'Found'];

const emptyForm = {
  itemName: '',
  description: '',
  type: 'Lost',
  location: '',
  date: new Date().toISOString().split('T')[0],
  contactInfo: ''
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllItems();
      setItems(res.data.items);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Search handler
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchItems();
      return;
    }
    try {
      const res = await searchItems(query);
      setItems(res.data.items);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Filter items by type
  const filteredItems = items.filter(item => {
    if (activeTab === 'mine') return item.reportedBy?._id === user.id;
    if (filterType !== 'All') return item.type === filterType;
    return true;
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Open modal for add or edit
  const openModal = (item = null) => {
    setFormError('');
    setFormSuccess('');
    if (item) {
      setEditItem(item);
      setFormData({
        itemName: item.itemName,
        description: item.description,
        type: item.type,
        location: item.location,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : emptyForm.date,
        contactInfo: item.contactInfo
      });
    } else {
      setEditItem(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData(emptyForm);
    setFormError('');
    setFormSuccess('');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const { itemName, description, type, location, date, contactInfo } = formData;
    if (!itemName || !description || !type || !location || !contactInfo) {
      setFormError('All fields are required');
      setFormLoading(false);
      return;
    }

    try {
      if (editItem) {
        await updateItem(editItem._id, formData);
        setFormSuccess('Item updated successfully!');
      } else {
        await addItem(formData);
        setFormSuccess('Item reported successfully!');
      }
      setTimeout(() => {
        closeModal();
        fetchItems();
      }, 800);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Stats calculation
  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'Lost').length,
    found: items.filter(i => i.type === 'Found').length,
    mine: items.filter(i => i.reportedBy?._id === user.id).length
  };

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="brand-icon">🔍</div>
              <span className="brand-text">LostFound</span>
            </div>
            <div className="navbar-right">
              <div className="user-badge">
                <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <span className="user-name">{user.name}</span>
              </div>
              <button id="logout-btn" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="text-gradient">{user.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="hero-subtitle">Manage campus lost & found items all in one place</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-lbl">Total Items</div>
              </div>
            </div>
            <div className="stat-card stat-lost">
              <div className="stat-icon">❌</div>
              <div>
                <div className="stat-value">{stats.lost}</div>
                <div className="stat-lbl">Lost Items</div>
              </div>
            </div>
            <div className="stat-card stat-found">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-value">{stats.found}</div>
                <div className="stat-lbl">Found Items</div>
              </div>
            </div>
            <div className="stat-card stat-mine">
              <div className="stat-icon">👤</div>
              <div>
                <div className="stat-value">{stats.mine}</div>
                <div className="stat-lbl">My Reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container section">
        {/* Toolbar */}
        <div className="toolbar">
          {/* Tabs */}
          <div className="tab-group">
            <button
              id="tab-all"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveTab('all'); setFilterType('All'); }}
            >
              All Items
            </button>
            <button
              id="tab-mine"
              className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
              onClick={() => setActiveTab('mine')}
            >
              My Reports
            </button>
          </div>

          {/* Filter */}
          {activeTab === 'all' && (
            <div className="filter-group">
              {['All', 'Lost', 'Found'].map(type => (
                <button
                  key={type}
                  id={`filter-${type.toLowerCase()}`}
                  className={`filter-btn ${filterType === type ? 'active' : ''} ${type === 'Lost' ? 'lost' : type === 'Found' ? 'found' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'Lost' ? '❌' : type === 'Found' ? '✅' : '📦'} {type}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search items, location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => handleSearch('')}>✕</button>
            )}
          </div>

          {/* Add button */}
          <button id="add-item-btn" className="btn btn-primary" onClick={() => openModal()}>
            + Report Item
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No items found</h3>
            <p>{searchQuery ? `No results for "${searchQuery}"` : 'Be the first to report a lost or found item!'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => openModal()}>
                + Report First Item
              </button>
            )}
          </div>
        ) : (
          <div className="items-grid fade-in">
            {filteredItems.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                currentUserId={user.id}
                onView={() => setViewItem(item)}
                onEdit={() => openModal(item)}
                onDelete={() => setDeleteConfirm(item._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title text-gradient">
                {editItem ? '✏️ Edit Item' : '➕ Report New Item'}
              </h2>
              <button id="modal-close-btn" className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {formError && <div className="alert alert-error"><span>⚠️</span> {formError}</div>}
            {formSuccess && <div className="alert alert-success"><span>✅</span> {formSuccess}</div>}

            <form onSubmit={handleSubmit} id="item-form">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="itemName">Item Name</label>
                  <input
                    id="itemName"
                    className="form-input"
                    placeholder="e.g., Black Wallet"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="itemType">Type</label>
                  <select
                    id="itemType"
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Describe the item in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input
                    id="location"
                    className="form-input"
                    placeholder="e.g., Library Building"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contactInfo">Contact Information</label>
                <input
                  id="contactInfo"
                  className="form-input"
                  placeholder="Phone number or email for contact"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" id="form-submit-btn" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <><span className="spinner"></span> Saving...</>
                  ) : editItem ? 'Update Item' : 'Report Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ITEM MODAL */}
      {viewItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">{viewItem.itemName}</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="view-item-content">
              <div className="flex gap-12" style={{ marginBottom: '16px' }}>
                <span className={`badge badge-${viewItem.type.toLowerCase()}`}>{viewItem.type}</span>
              </div>
              <div className="view-detail-grid">
                <div className="view-detail">
                  <span className="detail-label">📍 Location</span>
                  <span className="detail-value">{viewItem.location}</span>
                </div>
                <div className="view-detail">
                  <span className="detail-label">📅 Date</span>
                  <span className="detail-value">{new Date(viewItem.date).toLocaleDateString()}</span>
                </div>
                <div className="view-detail">
                  <span className="detail-label">📞 Contact</span>
                  <span className="detail-value">{viewItem.contactInfo}</span>
                </div>
                <div className="view-detail">
                  <span className="detail-label">👤 Reported By</span>
                  <span className="detail-value">{viewItem.reportedBy?.name || 'Unknown'}</span>
                </div>
              </div>
              <div className="view-description">
                <span className="detail-label">📝 Description</span>
                <p className="detail-value-block">{viewItem.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 className="modal-title" style={{ marginBottom: '10px' }}>Delete Item?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              This action cannot be undone. The item will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button id="confirm-delete-btn" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Item Card Component */
function ItemCard({ item, currentUserId, onView, onEdit, onDelete }) {
  const isOwner = item.reportedBy?._id === currentUserId;
  const date = new Date(item.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className={`item-card fade-in ${item.type.toLowerCase()}`}>
      <div className="item-card-header">
        <div className="item-card-top">
          <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
          {isOwner && <span className="owner-badge">Mine</span>}
        </div>
        <h3 className="item-name">{item.itemName}</h3>
      </div>

      <div className="item-card-body">
        <p className="item-description">{item.description}</p>
        <div className="item-meta">
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{item.location}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{date}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📞</span>
            <span>{item.contactInfo}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <span>{item.reportedBy?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="item-card-footer">
        <button className="btn btn-secondary btn-sm" onClick={onView}>View Details</button>
        {isOwner && (
          <div className="flex gap-8">
            <button className="btn btn-success btn-sm" onClick={onEdit}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
