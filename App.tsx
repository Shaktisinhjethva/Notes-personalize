
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Star, Trash2, FolderIcon, ChevronLeft, 
  Menu, Grid, List as ListIcon, MoreVertical, Sparkles, 
  PenLine, FileText, CheckCircle, Share2, Clock, Hash, 
  Image as ImageIcon, X, Check, LogOut, Type as TypeIcon, 
  Sun, Moon, ListChecks, ShieldAlert, Globe, Mic, MicOff,
  Zap
} from 'lucide-react';
import { Note, Folder, SidebarTab, ViewMode, TodoItem } from './types';
import { IconButton } from './components/IconButton';
import { Canvas } from './components/Canvas';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { LiveVoiceSession } from './components/LiveVoiceSession';
import { 
  summarizeNote, 
  improveWriting, 
  suggestTags, 
  transcribeHandwriting 
} from './services/geminiService';

const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif" },
  { id: 'serif', name: 'Serif', family: "'PT Serif', serif" },
  { id: 'mono', name: 'Mono', family: "'Fira Code', monospace" },
  { id: 'handwriting', name: 'Handwriting', family: "'Caveat', cursive" },
  { id: 'display', name: 'Elegant', family: "'Playfair Display', serif" },
];

const ADMIN_EMAIL = 'error404smj@gmail.com';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('notes-pro-auth') === 'true');
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('notes-pro-user-email'));
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('notes-pro-theme');
    return saved !== 'light'; 
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes-pro-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('notes-pro-folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTab, setCurrentTab] = useState<SidebarTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-bs-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-bs-theme', 'light');
    }
    localStorage.setItem('notes-pro-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('notes-pro-data', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('notes-pro-folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => {
    localStorage.setItem('notes-pro-auth', isAuthenticated.toString());
    if (userEmail) localStorage.setItem('notes-pro-user-email', userEmail);
  }, [isAuthenticated, userEmail]);

  const handleLogin = (email: string) => { setUserEmail(email); setIsAuthenticated(true); };
  const handleLogout = () => { setIsAuthenticated(false); setUserEmail(null); setActiveNoteId(null); setCurrentTab('all'); };

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (currentTab === 'favorites') result = result.filter(n => n.isFavorite);
    else if (currentTab !== 'all' && currentTab !== 'admin') result = result.filter(n => n.folderId === currentTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, currentTab, searchQuery]);

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId), [notes, activeNoteId]);
  const isAdmin = userEmail === ADMIN_EMAIL;

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      todos: [],
      folderId: typeof currentTab === 'string' && !['all', 'favorites', 'admin'].includes(currentTab) ? currentTab : 'all',
      tags: [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
      isFavorite: false,
      isPinned: false,
      fontFamily: FONT_OPTIONS[0].family
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const toggleFavorite = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const addTodo = (noteId: string) => {
    const newTodo: TodoItem = { id: Date.now().toString(), text: '', completed: false };
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, todos: [...(n.todos || []), newTodo] } : n));
  };

  const handleSummarize = async () => {
    if (!activeNote?.content) return;
    setIsProcessing(true);
    const summary = await summarizeNote(activeNote.content);
    updateNote(activeNote.id, { content: `### Summary\n${summary}\n\n---\n\n${activeNote.content}` });
    setIsProcessing(false);
  };

  const handleImprove = async () => {
    if (!activeNote?.content) return;
    setIsProcessing(true);
    const improved = await improveWriting(activeNote.content);
    updateNote(activeNote.id, { content: improved });
    setIsProcessing(false);
  };

  const handleSuggestTags = async () => {
    if (!activeNote?.content) return;
    setIsProcessing(true);
    const tags = await suggestTags(activeNote.content);
    const uniqueTags = [...new Set([...(activeNote.tags || []), ...tags])];
    updateNote(activeNote.id, { tags: uniqueTags });
    setIsProcessing(false);
  };

  const handleTranscribe = async () => {
    if (!activeNote?.drawingData) return;
    setIsProcessing(true);
    const transcription = await transcribeHandwriting(activeNote.drawingData);
    updateNote(activeNote.id, { content: `${activeNote.content}\n\n### AI Transcription\n${transcription}` });
    setIsProcessing(false);
  };

  const renderSidebarContent = () => (
    <div className="d-flex flex-column h-100 p-3 bg-body-tertiary">
      <div className="d-flex align-items-center mb-4 px-2">
        <div className="bg-primary rounded-4 p-2 text-white me-3 shadow-sm"><Sparkles size={20} /></div>
        <h5 className="fw-black mb-0 text-uppercase tracking-tighter italic" style={{ fontSize: '1.1rem' }}>Error404</h5>
      </div>

      <nav className="nav flex-column gap-1 mb-4">
        {isAdmin && (
          <button onClick={() => { setCurrentTab('admin'); setActiveNoteId(null); }} className={`nav-link nav-link-custom text-start border-0 bg-transparent d-flex align-items-center py-2 ${currentTab === 'admin' ? 'active' : ''}`}>
            <ShieldAlert size={16} className="me-3" /> Admin Center
          </button>
        )}
        <button onClick={() => setIsLiveSessionActive(true)} className="nav-link nav-link-custom text-start border-0 bg-transparent d-flex align-items-center py-2 text-primary">
          <Zap size={16} className="me-3" /> Live Intelligence
        </button>
        <button onClick={() => { setCurrentTab('all'); setActiveNoteId(null); }} className={`nav-link nav-link-custom text-start border-0 bg-transparent d-flex align-items-center py-2 ${currentTab === 'all' ? 'active' : ''}`}>
          <FileText size={16} className="me-3" /> All Documents
        </button>
        <button onClick={() => { setCurrentTab('favorites'); setActiveNoteId(null); }} className={`nav-link nav-link-custom text-start border-0 bg-transparent d-flex align-items-center py-2 ${currentTab === 'favorites' ? 'active' : ''}`}>
          <Star size={16} className="me-3" /> Starred
        </button>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-2 px-3">
        <span className="text-uppercase small fw-black text-muted tracking-widest opacity-50" style={{fontSize: '0.6rem'}}>Workspaces</span>
        <button onClick={() => setIsAddingFolder(true)} className="btn btn-sm btn-light rounded-circle shadow-sm border p-1"><Plus size={12} /></button>
      </div>

      <nav className="nav flex-column gap-1 overflow-y-auto custom-scrollbar mb-3 flex-grow-1" style={{maxHeight: '40vh'}}>
        {isAddingFolder && (
          <div className="px-3 mb-2 animate-in slide-in-from-top-1">
            <input 
              autoFocus 
              onBlur={() => !newFolderName && setIsAddingFolder(false)}
              onKeyDown={(e) => e.key === 'Enter' && (setFolders([...folders, {id: Date.now().toString(), name: newFolderName, color: '#2563eb'}]), setNewFolderName(''), setIsAddingFolder(false))}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="form-control form-control-sm border-primary rounded-3 bg-dark text-white py-1" placeholder="Name..."
              style={{ fontSize: '0.8rem' }}
            />
          </div>
        )}
        {folders.map(f => (
          <button key={f.id} onClick={() => { setCurrentTab(f.id); setActiveNoteId(null); }} className={`nav-link nav-link-custom text-start border-0 bg-transparent d-flex align-items-center py-2 ${currentTab === f.id ? 'active' : ''}`}>
            <FolderIcon size={16} className="me-3" style={{color: f.color}} /> {f.name}
          </button>
        ))}
        {folders.length === 0 && !isAddingFolder && (
          <div className="px-3 py-2 text-muted italic opacity-30" style={{ fontSize: '0.65rem' }}>No workspaces found.</div>
        )}
      </nav>

      <div className="mt-auto border-top pt-3 d-flex flex-column gap-2 border-secondary border-opacity-25">
        <button onClick={() => setDarkMode(!darkMode)} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between px-3 py-1.5 border rounded-pill transition-all">
          <span className="small fw-bold" style={{ fontSize: '0.7rem' }}>{darkMode ? 'Dark' : 'Light'} Mode</span>
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className="d-flex align-items-center gap-2 p-2 bg-dark rounded-4 border border-secondary border-opacity-25">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-black shadow-sm" style={{width: 32, height: 32, fontSize: '0.8rem'}}>{userEmail?.[0].toUpperCase()}</div>
          <div className="flex-grow-1 overflow-hidden">
            <span className="small fw-black d-block text-truncate text-white" style={{ fontSize: '0.7rem' }}>{userEmail?.split('@')[0]}</span>
            <span className="text-muted italic opacity-50 d-block text-truncate" style={{fontSize: '0.55rem'}}>{isAdmin ? 'Admin' : 'Guest'} Tier</span>
          </div>
          <button onClick={handleLogout} className="btn btn-link p-1 text-danger opacity-50 hover:opacity-100"><LogOut size={14} /></button>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="vh-100 d-flex flex-column bg-body text-emphasis overflow-hidden animate-in fade-in duration-500">
      {isLiveSessionActive && (
        <LiveVoiceSession 
          onTranscription={(text) => {
            if (activeNoteId) {
              updateNote(activeNoteId, { content: (activeNote?.content || '') + ' ' + text });
            } else {
              // Create a new note if none is active
              const newId = Date.now().toString();
              const newNote: Note = {
                id: newId,
                title: 'Live Session - ' + new Date().toLocaleTimeString(),
                content: text,
                folderId: 'all',
                tags: ['Live'],
                updatedAt: Date.now(),
                createdAt: Date.now(),
                isFavorite: false,
                isPinned: false
              };
              setNotes([newNote, ...notes]);
              setActiveNoteId(newId);
            }
          }}
          onClose={() => setIsLiveSessionActive(false)}
        />
      )}

      <header className="navbar sticky-top bg-dark border-bottom border-secondary border-opacity-25 px-3 py-2 d-lg-none shadow-sm flex-shrink-0">
        <button className="btn p-1 border-0 text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas">
          <Menu size={20} />
        </button>
        <span className="navbar-brand fw-black italic text-primary mb-0 h1 fs-6 tracking-tighter">ERROR404</span>
        <button onClick={createNewNote} className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm"><Plus size={16} /></button>
      </header>

      <div className="d-flex flex-grow-1 overflow-hidden h-100">
        <aside className="d-none d-lg-block border-end border-secondary border-opacity-25 flex-shrink-0 h-100" style={{width: 240}}>
          {renderSidebarContent()}
        </aside>

        <div className="offcanvas offcanvas-start sidebar-offcanvas d-lg-none" id="sidebarOffcanvas" tabIndex={-1}>
          <div className="offcanvas-body p-0 h-100">{renderSidebarContent()}</div>
        </div>

        <main className="flex-grow-1 d-flex overflow-hidden h-100">
            <div className={`col-12 col-md-5 col-lg-4 col-xl-3 border-end border-secondary border-opacity-25 d-flex flex-column bg-dark bg-opacity-50 h-100 ${activeNoteId ? 'd-none d-md-flex' : 'd-flex'}`}>
              <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between bg-dark flex-shrink-0">
                  <h6 className="mb-0 text-uppercase small fw-black tracking-widest text-muted opacity-50" style={{ fontSize: '0.6rem' }}>
                  {currentTab === 'all' ? 'All Workspace' : currentTab === 'favorites' ? 'Starred' : 'Workspace'}
                  </h6>
                  <div className="d-flex gap-1">
                    <IconButton icon={viewMode === ViewMode.List ? <Grid size={16} /> : <ListIcon size={16} />} onClick={() => setViewMode(viewMode === ViewMode.List ? ViewMode.Grid : ViewMode.List)} className="p-1.5" />
                  </div>
              </div>
              <div className="p-3 bg-dark flex-shrink-0">
                <div className="position-relative">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-50" size={14} />
                  <input className="form-control form-control-sm rounded-pill ps-5 bg-secondary bg-opacity-10 border-0 text-white py-1.5" style={{ fontSize: '0.8rem' }} placeholder="Search insights..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex-grow-1 overflow-y-auto custom-scrollbar">
                {filteredNotes.map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => setActiveNoteId(n.id)}
                    className={`w-100 text-start p-3 border-0 border-bottom border-secondary border-opacity-10 transition-all animate-in slide-in-from-left-1 ${activeNoteId === n.id ? 'bg-primary bg-opacity-10' : 'bg-transparent hover:bg-white hover:bg-opacity-5'}`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className={`fw-black text-truncate me-2 ${activeNoteId === n.id ? 'text-primary' : 'text-white'}`} style={{fontSize: '0.9rem'}}>{n.title || 'Draft Insight'}</span>
                      {n.isFavorite && <Star size={10} className="text-warning fill-warning" />}
                    </div>
                    <p className="small text-muted line-clamp-2 mb-2 opacity-75" style={{fontSize: '0.75rem', lineHeight: '1.4'}}>{n.content || 'Start documenting your vision...'}</p>
                    <div className="d-flex align-items-center justify-content-between">
                        <span className="text-uppercase fw-bold text-muted opacity-50 d-flex align-items-center" style={{fontSize: '0.6rem'}}><Clock size={10} className="me-1" />{new Date(n.updatedAt).toLocaleDateString()}</span>
                        <IconButton icon={<Trash2 size={12} />} onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="p-1 text-danger opacity-50 hover:opacity-100" />
                    </div>
                  </button>
                ))}
                {filteredNotes.length === 0 && (
                  <div className="p-5 text-center text-muted opacity-30 italic" style={{ fontSize: '0.75rem' }}>No records found.</div>
                )}
              </div>
            </div>

            <div className={`col-12 col-md-7 col-lg-8 col-xl-9 d-flex flex-column bg-black overflow-hidden h-100 ${activeNoteId || currentTab === 'admin' ? 'd-flex' : 'd-none d-md-flex align-items-center justify-content-center'}`}>
              {currentTab === 'admin' ? (
                <div className="h-100 overflow-y-auto custom-scrollbar w-100">
                  <AdminPanel />
                </div>
              ) : activeNote ? (
                <>
                  <div className="bg-black bg-opacity-80 backdrop-blur-xl border-bottom border-secondary border-opacity-25 p-2 px-3 d-flex align-items-center justify-content-between flex-shrink-0 z-10 shadow-sm">
                    <div className="d-flex align-items-center gap-1">
                      <IconButton icon={<ChevronLeft size={20} />} onClick={() => setActiveNoteId(null)} className="d-md-none text-white p-1.5" />
                      <IconButton icon={<Star size={18} className={activeNote.isFavorite ? 'text-warning fill-warning' : 'text-white'} />} onClick={() => toggleFavorite(activeNote.id)} className="p-1.5" />
                      <IconButton icon={<PenLine size={18} className={showCanvas ? 'text-primary' : 'text-white'} />} onClick={() => setShowCanvas(!showCanvas)} className="p-1.5" />
                      <IconButton icon={<ListChecks size={18} className="text-white" />} onClick={() => addTodo(activeNote.id)} className="p-1.5" />
                      <IconButton 
                        icon={<Mic size={18} className="text-white" />} 
                        onClick={() => setIsLiveSessionActive(true)} 
                        className="p-1.5" 
                        title="Live Voice Note"
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-none d-sm-flex gap-1 bg-dark p-1 rounded-pill border border-secondary border-opacity-25">
                        <IconButton icon={<FileText size={14} className="text-white" />} title="Summarize" onClick={handleSummarize} className="p-1.5" />
                        <IconButton icon={<CheckCircle size={14} className="text-white" />} title="Improve Tone" onClick={handleImprove} className="p-1.5" />
                        <IconButton icon={<Hash size={14} className="text-white" />} title="Suggest Tags" onClick={handleSuggestTags} className="p-1.5" />
                      </div>
                      <IconButton icon={<Share2 size={18} />} className="text-primary bg-primary bg-opacity-10 rounded-pill px-3 py-1.5" />
                      <IconButton icon={<MoreVertical size={18} className="text-white" />} className="p-1.5" />
                    </div>
                  </div>

                  <div className="flex-grow-1 overflow-y-auto custom-scrollbar p-4 p-xl-5 animate-in slide-in-from-bottom-2 position-relative">
                    <div className="mx-auto h-100 d-flex flex-column" style={{ maxWidth: '900px' }}>
                      {isProcessing && (
                        <div className="position-fixed top-0 start-0 w-100 h-1 d-flex z-50">
                          <div className="bg-primary animate-pulse w-100 h-100" />
                        </div>
                      )}
                      <input 
                        className="form-control form-control-lg border-0 bg-transparent fw-black mb-3 p-0 shadow-none tracking-tighter text-white flex-shrink-0" 
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: '1.2' }}
                        value={activeNote.title} 
                        onChange={e => updateNote(activeNote.id, { title: e.target.value })} 
                        placeholder="Untitled Document"
                      />
                      <div className="d-flex flex-wrap gap-2 mb-4 flex-shrink-0">
                        {activeNote.tags.map(t => <span key={t} className="badge bg-secondary bg-opacity-10 text-white border border-secondary border-opacity-25 rounded-pill px-3 py-1.5 small fw-black text-uppercase tracking-widest opacity-75 shadow-sm" style={{ fontSize: '0.6rem' }}>#{t}</span>)}
                      </div>
                      {showCanvas && (
                        <div className="mb-4 shadow-2xl rounded-4 overflow-hidden border border-secondary border-opacity-25 animate-in zoom-in bg-dark p-1 flex-shrink-0">
                          <Canvas initialData={activeNote.drawingData} onSave={d => updateNote(activeNote.id, { drawingData: d })} />
                          {activeNote.drawingData && (
                            <div className="p-2 bg-dark border-top border-secondary border-opacity-25 d-flex justify-content-end">
                              <button onClick={handleTranscribe} className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-2" disabled={isProcessing} style={{ fontSize: '0.7rem' }}>
                                <Sparkles size={12} /> AI Transcribe
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <textarea 
                        className="form-control border-0 bg-transparent shadow-none p-0 fs-5 lh-lg text-slate-300 custom-scrollbar flex-grow-1" 
                        style={{ resize: 'none', fontFamily: activeNote.fontFamily || 'inherit', fontSize: '1.05rem', minHeight: '300px' }} 
                        value={activeNote.content} 
                        onChange={e => updateNote(activeNote.id, { content: e.target.value })} 
                        placeholder="Deep dive into your thoughts here..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-5 animate-in zoom-in">
                  <Sparkles size={100} className="text-primary opacity-20 mb-4" />
                  <h2 className="fw-black text-uppercase tracking-tighter text-white fs-2">Select a document</h2>
                  <p className="text-muted small opacity-50 mb-4">Choose a note from the left to begin editing.</p>
                  <button onClick={createNewNote} className="btn btn-primary rounded-pill px-4 py-2 fw-black text-uppercase mt-2 shadow-lg d-flex align-items-center gap-2 mx-auto">
                    <Plus size={18} /> New Document
                  </button>
                </div>
              )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
