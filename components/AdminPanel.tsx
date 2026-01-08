
import React, { useState } from 'react';
import { 
  Users, Shield, Settings, Activity, Save, 
  Trash2, Edit3, UserPlus, Database, Server, Lock,
  Hash, Plus, X, Globe, Sparkles, Wrench, Share2, Filter,
  ChevronDown, ChevronRight, Monitor, MapPin, Calendar, FileText,
  Search
} from 'lucide-react';
import { AdminSettings, AppUser } from '../types';

export const AdminPanel: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: 'Error404 Pro',
    maintenanceMode: false,
    aiFeaturesEnabled: true,
    maxNoteSize: 5242880,
    allowPublicSharing: true
  });

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Reset users to empty array
  const [users, setUsers] = useState<AppUser[]>([]);

  // Reset tags to empty array
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Reset stats values to 0
  const stats = [
    { label: 'Total Users', value: users.length, icon: <Users size={18} />, color: 'primary' },
    { label: 'Health', value: '0%', icon: <Activity size={18} />, color: 'success' },
    { label: 'Sessions', value: '0', icon: <Server size={18} />, color: 'info' },
    { label: 'Storage', value: '0GB', icon: <Database size={18} />, color: 'warning' },
  ];

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to revoke access for this user? All session tokens will be invalidated.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (expandedUserId === userId) setExpandedUserId(null);
    }
  };

  const filteredTags = tags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex-grow-1 p-3 p-xl-4 animate-in fade-in">
      <div className="container-fluid px-0" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fw-black text-uppercase tracking-tighter italic h3 mb-1">Command Center</h1>
            <p className="text-muted small fw-bold text-uppercase tracking-widest mb-0 opacity-75" style={{ fontSize: '0.65rem' }}>Management & Intelligence</p>
          </div>
          <div className="d-none d-sm-block">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fw-bold" style={{ fontSize: '0.7rem' }}>v2.4.0-pro</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="pro-card h-100 shadow-sm border-0">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className={`p-2 bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-3`}>{stat.icon}</div>
                    <p className="text-muted small fw-bold text-uppercase tracking-widest mb-0 opacity-75" style={{ fontSize: '0.55rem' }}>{stat.label}</p>
                  </div>
                  <h4 className="fw-black mb-0" style={{ fontSize: '1.25rem' }}>{stat.value}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-12 col-xl-5">
            <div className="d-flex flex-column gap-3">
              {/* Global Config Card */}
              <div className="pro-card border-0 shadow-sm overflow-hidden">
                <div className="card-header bg-primary bg-opacity-5 border-0 p-3">
                  <div className="d-flex align-items-center gap-2">
                    <Settings size={16} className="text-primary" />
                    <h6 className="fw-black text-uppercase tracking-widest mb-0" style={{ fontSize: '0.75rem' }}>System Config</h6>
                  </div>
                </div>
                <div className="card-body p-3 d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="small fw-black text-muted text-uppercase mb-1 tracking-widest opacity-50" style={{ fontSize: '0.55rem' }}>App Identifier</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text border-0 bg-light bg-opacity-5 text-muted px-3">PRO://</span>
                      <input 
                        className="form-control border-0 bg-light bg-opacity-5 fw-bold text-white shadow-none" 
                        value={settings.siteName} 
                        onChange={e => setSettings({...settings, siteName: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-2">
                    {[
                      { icon: <Wrench size={14} />, label: 'Maintenance Mode', key: 'maintenanceMode', color: 'danger' },
                      { icon: <Sparkles size={14} />, label: 'AI Core Features', key: 'aiFeaturesEnabled', color: 'info' },
                      { icon: <Share2 size={14} />, label: 'Cloud Collaboration', key: 'allowPublicSharing', color: 'success' }
                    ].map(item => (
                      <div key={item.key} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light bg-opacity-5 border border-transparent">
                        <div className="d-flex align-items-center gap-2">
                          <div className={`p-1.5 bg-${item.color} bg-opacity-10 text-${item.color} rounded-2`}>{item.icon}</div>
                          <span className="fw-bold small" style={{ fontSize: '0.75rem' }}>{item.label}</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={(settings as any)[item.key]} 
                            onChange={e => setSettings({...settings, [item.key]: e.target.checked})} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-sm btn-primary w-100 py-2 rounded-3 fw-black text-uppercase shadow-sm d-flex align-items-center justify-content-center gap-2">
                    <Save size={14} /> Sync Environment
                  </button>
                </div>
              </div>

              {/* Tag Management */}
              <div className="pro-card border-0 shadow-sm overflow-hidden">
                <div className="card-header bg-dark bg-opacity-50 border-0 p-3">
                  <div className="d-flex align-items-center gap-2">
                    <Hash size={16} className="text-muted" />
                    <h6 className="fw-black text-uppercase tracking-widest mb-0" style={{ fontSize: '0.75rem' }}>Tag Index</h6>
                  </div>
                </div>
                <div className="card-body p-3">
                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="position-relative">
                      <Filter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                      <input 
                        type="text" 
                        className="form-control form-control-sm border-0 bg-light bg-opacity-5 rounded-pill ps-5 py-1.5 small text-white shadow-none" 
                        placeholder="Search tags..." 
                        value={tagSearch}
                        onChange={e => setTagSearch(e.target.value)}
                        style={{ fontSize: '0.7rem' }}
                      />
                    </div>
                    <div className="input-group input-group-sm">
                      <input 
                        type="text" 
                        className="form-control border-0 bg-primary bg-opacity-5 rounded-start-3 px-3 fw-bold text-white shadow-none" 
                        placeholder="New tag..." 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <button className="btn btn-primary rounded-end-3 px-2" onClick={handleAddTag}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-1.5 overflow-y-auto custom-scrollbar pe-1" style={{ maxHeight: '180px' }}>
                    {filteredTags.length > 0 ? filteredTags.map(tag => (
                      <div key={tag} className="badge bg-dark border border-secondary border-opacity-25 text-white px-2 py-1.5 d-flex align-items-center gap-2 animate-in zoom-in hover:border-danger transition-all">
                        <span className="fw-bold opacity-75" style={{ fontSize: '0.65rem' }}>#{tag}</span>
                        <button className="btn btn-link p-0 text-muted border-0 hover:text-danger" onClick={() => handleDeleteTag(tag)}>
                          <X size={12} />
                        </button>
                      </div>
                    )) : (
                      <span className="text-muted small italic opacity-50 px-2">No tags indexed.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Directory Column */}
          <div className="col-12 col-xl-7">
            <div className="pro-card border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
              <div className="card-header bg-transparent border-0 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <h6 className="fw-black text-uppercase tracking-widest mb-0 text-white" style={{ fontSize: '0.75rem' }}>Users</h6>
                </div>
                
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <div className="position-relative d-none d-sm-block">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted opacity-50" size={12} />
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0 bg-dark rounded-pill ps-4 py-1.5 text-white shadow-none" 
                      placeholder="Search..." 
                      style={{ width: '130px', fontSize: '0.7rem' }}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm" style={{ fontSize: '0.7rem' }}>
                    <UserPlus size={14} /> New
                  </button>
                </div>
              </div>
              
              <div className="flex-grow-1 overflow-x-auto">
                <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 0' }}>
                  <thead className="small border-bottom border-secondary border-opacity-10">
                    <tr className="text-muted fw-bold text-uppercase tracking-widest" style={{fontSize: '0.55rem'}}>
                      <th className="py-2 ps-3 border-0" style={{ width: '30px' }}></th>
                      <th className="py-2 border-0">Identity</th>
                      <th className="py-2 text-center border-0">Status</th>
                      <th className="py-2 text-end pe-3 border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="border-0">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => {
                      const isExpanded = expandedUserId === user.id;
                      return (
                        <React.Fragment key={user.id}>
                          <tr 
                            className={`border-bottom border-secondary border-opacity-10 transition-all cursor-pointer ${isExpanded ? 'bg-primary bg-opacity-5' : 'hover:bg-white hover:bg-opacity-5'}`}
                            onClick={() => toggleUserExpansion(user.id)}
                          >
                            <td className="ps-3 text-center">
                              {isExpanded ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted" />}
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-black me-2 shadow-sm border border-white border-opacity-10" style={{width: 30, height: 30, fontSize: '0.7rem'}}>{user.email[0].toUpperCase()}</div>
                                <div className="overflow-hidden">
                                  <span className="fw-bold d-block text-white text-truncate small" style={{ maxWidth: '120px' }}>{user.email}</span>
                                  <span className="text-muted opacity-50" style={{ fontSize: '0.6rem' }}>{user.role}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`badge border-0 rounded-pill px-2 py-1 uppercase small fw-black bg-${user.status === 'active' ? 'success' : 'danger'} bg-opacity-10 text-${user.status === 'active' ? 'success' : 'danger'}`} style={{ fontSize: '0.5rem' }}>
                                {user.status}
                              </span>
                            </td>
                            <td className="text-end pe-3">
                              <div className="d-flex justify-content-end gap-1">
                                <button 
                                  className="btn btn-sm btn-dark border border-secondary border-opacity-25 rounded-pill p-1.5" 
                                  onClick={(e) => { e.stopPropagation(); }}
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  className="btn btn-sm btn-dark border border-secondary border-opacity-25 rounded-pill p-1.5 hover:text-danger hover:border-danger transition-colors" 
                                  onClick={(e) => handleDeleteUser(user.id, e)}
                                  title="Remove User"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-primary bg-opacity-5">
                              <td colSpan={4} className="p-0 border-0">
                                <div className="p-3 bg-dark bg-opacity-25 border-top border-bottom border-primary border-opacity-10">
                                  <div className="row g-3">
                                    <div className="col-12 col-md-7">
                                      <div className="d-flex flex-column gap-2">
                                        <div className="d-flex align-items-start gap-2">
                                          <MapPin size={12} className="text-muted mt-1" />
                                          <div>
                                            <p className="text-muted small fw-bold text-uppercase mb-0 tracking-widest opacity-50" style={{fontSize: '0.5rem'}}>IP Address</p>
                                            <p className="mb-0 text-white font-monospace" style={{ fontSize: '0.65rem' }}>{user.ip || 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-2">
                                          <Monitor size={12} className="text-muted mt-1" />
                                          <div className="overflow-hidden">
                                            <p className="text-muted small fw-bold text-uppercase mb-0 tracking-widest opacity-50" style={{fontSize: '0.5rem'}}>Device</p>
                                            <p className="mb-0 text-white text-truncate opacity-75" style={{ fontSize: '0.65rem' }}>{user.userAgent || 'Unknown'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-5 d-flex flex-column gap-2">
                                      <div className="d-flex align-items-start gap-2">
                                        <Calendar size={12} className="text-muted mt-1" />
                                        <div>
                                          <p className="text-muted small fw-bold text-uppercase mb-0 tracking-widest opacity-50" style={{fontSize: '0.5rem'}}>Joined</p>
                                          <p className="mb-0 text-white" style={{ fontSize: '0.65rem' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-start gap-2">
                                        <FileText size={12} className="text-muted mt-1" />
                                        <div>
                                          <p className="text-muted small fw-bold text-uppercase mb-0 tracking-widest opacity-50" style={{fontSize: '0.5rem'}}>Notes</p>
                                          <p className="mb-0 text-white fw-bold" style={{ fontSize: '0.65rem' }}>{user.notesCount || 0}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted italic opacity-50 small">
                          {userSearch ? `No matches for "${userSearch}"` : "No users in directory."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-dark bg-opacity-10 border-top border-secondary border-opacity-10 text-center">
                <p className="small text-muted mb-0 italic" style={{ fontSize: '0.6rem' }}>Nodes synced: {filteredUsers.length} active licenses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
