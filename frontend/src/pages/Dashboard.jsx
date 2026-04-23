import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, addItem, updateItem, deleteItem, searchItems } from '../api';
import './Dashboard.css';

const ITEM_TYPES = ['Lost', 'Found'];

const emptyForm = {
  itemName: '', description: '', type: 'Lost',
  location: '', date: new Date().toISOString().split('T')[0], contactInfo: ''
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllItems();
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) return fetchItems();
    try {
      const res = await searchItems(query);
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (item = null) => {
    setFormError('');
    if (item) {
      setEditItem(item);
      setFormData({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : emptyForm.date
      });
    } else {
      setEditItem(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); setFormData(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      if (editItem) await updateItem(editItem._id, formData);
      else await addItem(formData);
      closeModal();
      fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'mine') return item.reportedBy?._id === user.id;
    if (filterType !== 'All') return item.type === filterType;
    return true;
  });

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'Lost').length,
    found: items.filter(i => i.type === 'Found').length,
    mine: items.filter(i => i.reportedBy?._id === user.id).length
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🔎</span>
          <h2>FindIt</h2>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setFilterType('All'); }}>
            <span className="nav-icon">🌍</span> All Items
          </button>
          <button className={`nav-item ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
            <span className="nav-icon">👤</span> My Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="btn btn-ghost btn-full" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, description, location..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + New Report
          </button>
        </header>

        <div className="dashboard-content">
          {/* STATS */}
          <div className="stats-container">
            <div className="stat-box">
              <div className="stat-icon bg-primary-light">📦</div>
              <div className="stat-details">
                <h3>{stats.total}</h3>
                <p>Total Items</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon bg-danger-light">❌</div>
              <div className="stat-details">
                <h3>{stats.lost}</h3>
                <p>Lost Items</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon bg-success-light">✅</div>
              <div className="stat-details">
                <h3>{stats.found}</h3>
                <p>Found Items</p>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon bg-warning-light">⭐</div>
              <div className="stat-details">
                <h3>{stats.mine}</h3>
                <p>My Reports</p>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          {activeTab === 'all' && (
            <div className="filters">
              {['All', 'Lost', 'Found'].map(t => (
                <button 
                  key={t} 
                  className={`filter-pill ${filterType === t ? 'active' : ''}`}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* ITEMS GRID */}
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}><div className="spinner spinner-teal"></div></div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Nothing found here</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="items-grid fade-up">
              {filteredItems.map(item => (
                <div key={item._id} className="item-card">
                  <div className="item-card-header">
                    <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                    {item.reportedBy?._id === user.id && <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>Mine</span>}
                  </div>
                  <h3 className="item-title">{item.itemName}</h3>
                  <p className="item-desc">{item.description}</p>
                  
                  <div className="item-meta">
                    <div><span className="icon">📍</span> {item.location}</div>
                    <div><span className="icon">📅</span> {new Date(item.date).toLocaleDateString()}</div>
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setViewItem(item)}>View</button>
                    {item.reportedBy?._id === user.id && (
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(item)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteConfirm(item._id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Report' : 'New Report'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input className="form-input" required value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Lost">Lost</option><option value="Found">Found</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Info</label>
                <input className="form-input" required value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">{viewItem.itemName}</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}><span className={`badge badge-${viewItem.type.toLowerCase()}`}>{viewItem.type}</span></div>
            <div className="grid grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
              <div><strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Location</strong> {viewItem.location}</div>
              <div><strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Date</strong> {new Date(viewItem.date).toLocaleDateString()}</div>
              <div><strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Contact</strong> {viewItem.contactInfo}</div>
              <div><strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Reported By</strong> {viewItem.reportedBy?.name}</div>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</strong>
              <p style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>{viewItem.description}</p>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗑️</div>
            <h3>Delete this item?</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px', fontSize: '14px' }}>This action cannot be undone.</p>
            <div className="flex gap-12" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
