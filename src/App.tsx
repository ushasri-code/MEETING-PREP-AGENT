import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Bell, BookOpen, CalendarDays, Check,
  CheckCheck, ChevronDown, ChevronRight, CircleHelp, Command, Compass,
  FilePlus2, LayoutDashboard, ListFilter, MoreHorizontal, Plus, Search, Settings,
  Sparkles, Users, X,
} from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
  time: string;
  day: string;
  topic: string;
  last: string;
  notes: string;
  promises: string;
  followups: string;
  concerns: string;
  preferences: string;
};

type Section = 'Home' | 'Contacts' | 'Meeting History' | 'Settings';
type View = 'dashboard' | 'brief' | 'memory';

const seedContacts: Contact[] = [
  {
    id: 'ravi', name: 'Ravi Kumar', role: 'VP of Product', company: 'Northstar Labs', initials: 'RK', color: 'coral',
    time: '10:30 AM', day: 'Today', topic: 'Q4 product roadmap', last: 'Sep 18, 2026',
    notes: 'Aligned on narrowing the launch scope to the core workflow. Ravi was excited about a guided onboarding flow and wants to see a clickable prototype before the next review.',
    promises: 'Share a clickable onboarding prototype by Oct 2. Send revised launch scope to the team.',
    followups: 'Prototype is in progress. Revised scope was shared on Sep 23.',
    concerns: 'Worried the team is taking on too much before the November launch. Wants confidence in the analytics plan.',
    preferences: 'Prefers a short pre-read the day before. Start with decisions needed, then go into detail.',
  },
  {
    id: 'priya', name: 'Priya Reddy', role: 'Founder', company: 'Mango Health', initials: 'PR', color: 'lilac',
    time: '2:00 PM', day: 'Today', topic: 'Partnership rollout', last: 'Sep 21, 2026',
    notes: 'Talked through a phased rollout with two pilot clinics before scaling. Priya shared that clinic staff need simpler training materials.',
    promises: 'Send the pilot timeline and an introduction to the training lead.',
    followups: 'Timeline sent. Training lead introduction is still pending.',
    concerns: 'Concerned that onboarding will distract clinic staff during their busiest hours.',
    preferences: 'Likes collaborative working sessions with clear next steps captured live.',
  },
  {
    id: 'maya', name: 'Maya Chen', role: 'Design Director', company: 'Fieldwork', initials: 'MC', color: 'sage',
    time: 'Thu, Oct 1', day: 'Thursday', topic: 'Research readout', last: 'Sep 16, 2026',
    notes: 'Reviewed early research themes and agreed to validate the new navigation with five customers.',
    promises: 'Share the interview guide before research begins.',
    followups: 'Interview guide needs review.',
    concerns: 'Wants the research to include customers who use assistive technology.',
    preferences: 'Prefers visual examples and space to think before reacting.',
  },
  {
    id: 'arjun', name: 'Arjun Rao', role: 'Engineering Lead', company: 'Northstar Labs', initials: 'AR', color: 'blue',
    time: 'Fri, Oct 2', day: 'Friday', topic: 'Platform reliability', last: 'Sep 11, 2026',
    notes: 'Discussed service ownership and a more predictable release checklist.',
    promises: 'Follow up with the updated incident review template.',
    followups: 'Template not yet shared.',
    concerns: 'Worried the migration timeline has no buffer for unexpected load testing results.',
    preferences: 'Direct, detail-oriented conversations. Share technical context upfront.',
  },
];

const navItems: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'Home', icon: LayoutDashboard },
  { label: 'Contacts', icon: Users },
  { label: 'Meeting History', icon: BookOpen },
  { label: 'Settings', icon: Settings },
];

function App() {
  const [contacts, setContacts] = useState(seedContacts);
  const [selectedId, setSelectedId] = useState('ravi');
  const [section, setSection] = useState<Section>('Home');
  const [view, setView] = useState<View>('dashboard');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [toast, setToast] = useState('');
  const selected = contacts.find((contact) => contact.id === selectedId) ?? contacts[0];
  const filteredContacts = useMemo(() => contacts.filter((contact) =>
    `${contact.name} ${contact.company} ${contact.role}`.toLowerCase().includes(query.toLowerCase()),
  ), [contacts, query]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const openBrief = async (id: string) => {
    setSelectedId(id);
    setSaved(false);
    setView('brief');

    const contact = contacts.find((c) => c.id === id);

    if (!contact) return;

    try {
      const response = await fetch('/api/meeting-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_name: contact.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting brief');
      }

      const data = await response.json();

      setGeneratedBrief(data.brief || '');

      showToast('Meeting brief generated successfully');
    } catch (error) {
      console.error('Meeting prep API error:', error);
      showToast('Could not load meeting brief');
    }
  };

  const openMemory = (id = selectedId) => {
    setSelectedId(id);
    setSaved(false);
    setView('memory');
  };

  const saveMemory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setContacts((current) => current.map((contact) => contact.id === selectedId ? {
      ...contact,
      notes: String(data.get('notes') ?? ''),
      promises: String(data.get('promises') ?? ''),
      followups: String(data.get('followups') ?? ''),
      concerns: String(data.get('concerns') ?? ''),
      preferences: String(data.get('preferences') ?? ''),
    } : contact));
    setSaved(true);
    showToast('Meeting memory saved');
    window.setTimeout(() => setView('brief'), 700);
  };

  const navigate = (item: Section) => {
    setSection(item);
    setView('dashboard');
    setQuery('');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('Home')} aria-label="Goodmeet home">
          <span className="brand-mark"><Compass size={18} strokeWidth={2.3} /></span>
          <span>goodmeet<span className="brand-period">.</span></span>
        </button>
        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy"><strong>Northstar team</strong><span>Personal workspace</span></div>
          <ChevronDown size={15} />
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${section === label ? 'active' : ''}`} onClick={() => navigate(label)}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Meeting History' && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="people-heading"><p className="nav-caption">YOUR PEOPLE</p><button title="Add contact" onClick={() => showToast('Contact creation is coming soon')}><Plus size={15} /></button></div>
        <div className="sidebar-people">
          {contacts.slice(0, 4).map((contact) => (
            <button className={`person-link ${selectedId === contact.id && view !== 'dashboard' ? 'person-selected' : ''}`} key={contact.id} onClick={() => openBrief(contact.id)}>
              <span className={`avatar avatar-${contact.color}`}>{contact.initials}</span><span>{contact.name.split(' ')[0]}</span><span className="person-presence" />
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="weekly-card">
            <div className="weekly-icon"><Sparkles size={15} /></div>
            <div><strong>Make every meeting count</strong><span>Your week, at a glance.</span></div>
            <ArrowDownRight size={15} className="weekly-arrow" />
          </div>
          <button className="profile-row" onClick={() => navigate('Settings')}>
            <div className="profile-avatar">AK</div><div className="profile-copy"><strong>Ananya K.</strong><span>Free plan</span></div><MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{view === 'brief' ? 'Meeting brief' : view === 'memory' ? 'Meeting memory' : section}</strong></div>
          <div className="topbar-actions">
            <div className="date-chip"><CalendarDays size={15} /><span>Mon, Sep 28</span></div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showToast('You’re all caught up')}><Bell size={17} /><i /></button>
            <div className="topbar-avatar">AK</div>
          </div>
        </header>

        {view === 'memory' ? (
          <MemoryForm contact={selected} onBack={() => setView('brief')} onSave={saveMemory} saved={saved} />
        ) : view === 'brief' ? (
          <BriefView contact={selected} onBack={() => { setView('dashboard'); setSection('Home'); }} onEdit={() => openMemory()} onToast={showToast} onPrepare={openBrief} generatedBrief={generatedBrief} />
        ) : (
          <Dashboard section={section} contacts={filteredContacts} allContacts={contacts} query={query} setQuery={setQuery} openBrief={openBrief} openMemory={openMemory} onToast={showToast} />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ label, icon: Icon }) => <button key={label} className={section === label && view === 'dashboard' ? 'active' : ''} onClick={() => navigate(label)}><Icon size={19} /><span>{label === 'Meeting History' ? 'History' : label}</span></button>)}
      </nav>
      {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </div>
  );
}

function Dashboard({ section, contacts, allContacts, query, setQuery, openBrief, openMemory, onToast }: {
  section: Section; contacts: Contact[]; allContacts: Contact[]; query: string; setQuery: (value: string) => void;
  openBrief: (id: string) => void; openMemory: (id?: string) => void; onToast: (message: string) => void;
}) {
  const [filter, setFilter] = useState('All meetings');
  const isHome = section === 'Home';
  const title = section === 'Contacts' ? 'Your people' : section === 'Meeting History' ? 'Meeting history' : section === 'Settings' ? 'Settings' : 'Good morning, Ananya';
  const description = section === 'Contacts' ? 'The people behind your most important conversations.' : section === 'Meeting History' ? 'A little context goes a long way.' : section === 'Settings' ? 'Make Goodmeet work the way you do.' : 'A little context goes a long way.';
  const visibleContacts = section === 'Meeting History' ? allContacts.filter((contact) => contact.id !== 'ravi') : contacts;

  if (section === 'Settings') return <SettingsView onToast={onToast} />;

  return (
    <div className="page-content dashboard-page">
      <div className="page-heading">
        <div><div className="eyebrow"><span className="eyebrow-dot" /> MONDAY, SEPTEMBER 28, 2026</div><h1>{title}<span className="heading-period">.</span></h1><p>{description}</p></div>
        <button className="outline-button new-memory-button" onClick={() => openMemory()}><FilePlus2 size={16} /> Add a memory</button>
      </div>
      {isHome && <div className="day-banner"><div className="banner-mark"><Sparkles size={16} /></div><div className="banner-copy"><strong>You’ve got good conversations ahead.</strong><span>3 meetings this week. Your people are on top of mind.</span></div><button onClick={() => onToast('Weekly view is up to date')}>See your week <ArrowRight size={15} /></button><div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" /></div>}
      <div className="dashboard-columns">
        <section className="meetings-section">
          <div className="section-heading"><div><h2>{isHome ? 'Coming up' : section === 'Contacts' ? 'All contacts' : 'Past conversations'}</h2><span className="section-subtitle">{isHome ? 'Make space for what matters.' : `${visibleContacts.length} people in your workspace`}</span></div><button className="text-action" onClick={() => onToast('Showing all meetings')}>View calendar <ArrowRight size={15} /></button></div>
          {isHome ? <div className="meeting-stack">
            {allContacts.slice(0, 2).map((contact, index) => <MeetingCard key={contact.id} contact={contact} featured={index === 0} onBrief={openBrief} onMemory={openMemory} />)}
            <div className="later-meetings"><div className="later-date"><span>THU</span><strong>01</strong><i>OCT</i></div><div className="later-content"><strong>Maya Chen <span>·</span> Research readout</strong><span>10:00 AM <i>·</i> Fieldwork studio</span></div><button className="small-arrow" onClick={() => openBrief('maya')} aria-label="Open Maya Chen brief"><ArrowRight size={16} /></button></div>
            <div className="later-meetings"><div className="later-date"><span>FRI</span><strong>02</strong><i>OCT</i></div><div className="later-content"><strong>Arjun Rao <span>·</span> Platform reliability</strong><span>11:30 AM <i>·</i> Northstar Labs</span></div><button className="small-arrow" onClick={() => openBrief('arjun')} aria-label="Open Arjun Rao brief"><ArrowRight size={16} /></button></div>
          </div> : <div className="meeting-stack">
            {visibleContacts.map((contact) => <MeetingCard key={contact.id} contact={contact} featured={false} onBrief={openBrief} onMemory={openMemory} />)}
            {visibleContacts.length === 0 && <div className="empty-state">No people match “{query}”. Try another search.</div>}
          </div>}
        </section>
        <aside className="contacts-panel">
          <div className="section-heading contacts-heading"><div><h2>{section === 'Meeting History' ? 'Recent contacts' : 'Your people'}</h2><span className="section-subtitle">Good relationships, remembered.</span></div><button className="icon-subtle" aria-label="More contacts" onClick={() => onToast('Contact options')}><MoreHorizontal size={19} /></button></div>
          <label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find someone..." /><kbd><Command size={10} /> K</kbd></label>
          <div className="contact-list">
            {contacts.slice(0, 4).map((contact, index) => <button className="contact-row" key={contact.id} onClick={() => openBrief(contact.id)}><span className={`avatar avatar-${contact.color}`}>{contact.initials}</span><span className="contact-details"><strong>{contact.name}</strong><span>{contact.role} <i>at</i> {contact.company}</span></span><span className={`contact-status ${index < 2 ? 'status-upcoming' : ''}`}>{index < 2 ? 'Soon' : 'Saved'}</span></button>)}
          </div>
          <button className="all-contacts" onClick={() => onToast('You’re viewing all your people')}><Users size={15} /> See all people <ArrowRight size={14} /></button>
          <div className="divider-light" />
          <div className="week-note"><div className="week-note-head"><span className="week-icon"><CalendarDays size={14} /></span><span>THIS WEEK</span><button onClick={() => setFilter(filter === 'All meetings' ? 'My meetings' : 'All meetings')}><ListFilter size={14} /></button></div><div className="week-progress"><span /><span /><span /></div><p><strong>3 meetings</strong> with people worth showing up for.</p><button className="calendar-link" onClick={() => onToast(`${filter}: calendar opened`)}>{filter} <ArrowRight size={13} /></button></div>
        </aside>
      </div>
      <footer className="page-footer"><span>Thoughtful meetings start with good memory.</span><button onClick={() => onToast('Help center coming soon')}><CircleHelp size={14} /> Need a hand?</button></footer>
    </div>
  );
}

function MeetingCard({ contact, featured, onBrief, onMemory }: { contact: Contact; featured: boolean; onBrief: (id: string) => void; onMemory: (id?: string) => void }) {
  return <article className={`meeting-card ${featured ? 'meeting-featured' : ''}`}>
    <div className="meeting-time"><strong>{contact.time}</strong><span><i /> {contact.day}</span></div>
    <div className="meeting-info"><div className="meeting-person"><span className={`avatar avatar-${contact.color}`}>{contact.initials}</span><div><strong>{contact.name}</strong><span>{contact.role} <i>at</i> {contact.company}</span></div></div><div className="meeting-topic"><span className="topic-mark" /><span>{contact.topic}</span></div></div>
    <div className="meeting-actions"><button className="prepare-button" onClick={() => onBrief(contact.id)}><Sparkles size={14} /> Prepare me <ArrowRight size={14} /></button><button className="meeting-more" aria-label={`Add memory for ${contact.name}`} onClick={() => onMemory(contact.id)}><MoreHorizontal size={18} /></button></div>
  </article>;
}

function MemoryForm({ contact, onBack, onSave, saved }: { contact: Contact; onBack: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void; saved: boolean }) {
  const fields = [
    { name: 'notes', label: 'Notes', telugu: 'చర్చలు', hint: 'What did you talk about?', placeholder: 'The important parts of your conversation, decisions made, ideas worth returning to…', value: contact.notes, rows: 4 },
    { name: 'promises', label: 'Promises', telugu: 'వాగ్దానాలు', hint: 'What did either of you commit to?', placeholder: 'Things you said you’d do, and things they said they’d do…', value: contact.promises, rows: 3 },
    { name: 'followups', label: 'Follow-ups', telugu: 'అనుసరణలు', hint: 'What’s done or still outstanding?', placeholder: 'Capture what moved forward and what still needs a nudge…', value: contact.followups, rows: 3 },
    { name: 'concerns', label: 'Concerns', telugu: 'ఆందోళనలు', hint: 'What’s on their mind?', placeholder: 'Anything they’re worried about, or need more confidence in…', value: contact.concerns, rows: 3 },
    { name: 'preferences', label: 'Preferences', telugu: 'ప్రాధాన్యతలు', hint: 'How do they like to meet?', placeholder: 'Their style, pace, and what helps them feel prepared…', value: contact.preferences, rows: 3 },
  ];
  return <div className="page-content form-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to briefing</button>
    <div className="form-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> MEMORY IS A FORM OF CARE</div><h1>Keep the thread<span className="heading-period">.</span></h1><p>Good conversations deserve to be remembered.</p></div><span className="form-contact-chip"><span className={`avatar avatar-${contact.color}`}>{contact.initials}</span><span>For <strong>{contact.name}</strong></span><ChevronDown size={14} /></span></div>
    <form className="memory-form" onSubmit={onSave}>
      <div className="form-intro"><span className="form-intro-icon"><BookOpen size={17} /></span><div><strong>A little context for next time</strong><span>Capture what matters. You can always come back and edit it.</span></div></div>
      <div className="fields-grid">{fields.map((field, index) => <label className={`memory-field ${index === 0 ? 'field-wide' : ''}`} key={field.name}><span className="field-label"><strong>{field.label}</strong><span className="telugu-label">{field.telugu}</span></span><span className="field-hint">{field.hint}</span><textarea name={field.name} rows={field.rows} defaultValue={field.value} placeholder={field.placeholder} /></label>)}</div>
      <div className="form-footer"><span><span className="private-dot" /> Only visible to you</span><div><button type="button" className="cancel-button" onClick={onBack}>Cancel</button><button className="save-button" type="submit"><CheckCheck size={16} /> {saved ? 'Saved' : 'Save memory'}</button></div></div>
    </form>
    <div className="form-footnote"><Sparkles size={14} /><span>Your notes shape a more thoughtful brief next time.</span></div>
  </div>;
}

function BriefView({ contact, onBack, onEdit, onToast, onPrepare, generatedBrief }: { contact: Contact; onBack: () => void; onEdit: () => void; onToast: (message: string) => void; onPrepare: (id: string) => void; generatedBrief: string }) {
  return <div className="page-content brief-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> All meetings</button>
    <div className="brief-title-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CONVERSATION</div><h1>Meeting brief<span className="heading-period">.</span></h1><p>Everything worth remembering, in one place.</p></div><button className="outline-button" onClick={onEdit}><FilePlus2 size={16} /> Add a memory</button></div>
    <section className="brief-hero"><div className="brief-contact"><span className={`avatar avatar-large avatar-${contact.color}`}>{contact.initials}</span><div><div className="brief-contact-name"><h2>{contact.name}</h2><button aria-label="More contact options" onClick={() => onToast('Contact options')}><MoreHorizontal size={19} /></button></div><span>{contact.role} <i>at</i> {contact.company}</span><div className="brief-meta"><span><CalendarDays size={14} /> {contact.day}, {contact.time}</span><span><span className="topic-mark" /> {contact.topic}</span></div></div></div><div className="brief-hero-actions"><span className="ready-label"><i /> READY WHEN YOU ARE</span><button className="prepare-button" onClick={() => onPrepare(contact.id)}><Sparkles size={14} /> Prepare me <ArrowRight size={14} /></button></div></section>
    <div className="brief-grid"><section className="brief-memory-panel"><div className="brief-panel-heading"><div><span className="panel-kicker">THE BACKSTORY</span><h3>What to remember</h3></div><button className="edit-memory" onClick={onEdit}>Edit memory <ArrowRight size={14} /></button></div>
      <div className="memory-item"><span className="memory-icon icon-notes"><BookOpen size={15} /></span><div><div className="memory-item-title"><strong>Past discussions</strong><span>Sep 18, 2026</span></div><p>{contact.notes}</p></div></div>
      <div className="memory-item"><span className="memory-icon icon-promise"><CheckCheck size={15} /></span><div><div className="memory-item-title"><strong>Pending commitments</strong><span className="pending-pill">Needs attention</span></div><p>{contact.promises}<br />{contact.followups}</p></div></div>
      <div className="memory-item"><span className="memory-icon icon-concern"><Compass size={15} /></span><div><div className="memory-item-title"><strong>Concerns</strong></div><p>{contact.concerns}</p></div></div>
      <div className="memory-item"><span className="memory-icon icon-style"><Sparkles size={15} /></span><div><div className="memory-item-title"><strong>Meeting preferences</strong></div><p>{contact.preferences}</p></div></div>
    </section><aside className="talking-panel"><div className="talking-head"><span className="talking-spark"><Sparkles size={15} /></span><span className="panel-kicker">A THOUGHTFUL START</span><button onClick={() => onToast('Talking points refreshed')}><ArrowRight size={15} /></button></div><h3>Talking points</h3><p className="talking-subtitle">A few ideas to help you get started.</p><ol className="talking-list"><li><span>01</span><p>Close the loop on your last conversation’s commitments.</p></li><li><span>02</span><p>Ask what has changed since you last spoke about <em>{contact.topic.toLowerCase()}</em>.</p></li><li><span>03</span><p>Make space for their concerns before diving into your update.</p></li></ol><div className="talking-note"><span>✳</span><p>Start with a question, not a status update.</p></div><div className="ai-disclaimer"><Sparkles size={12} /> Suggested from your meeting memory</div></aside></div>
    {generatedBrief && (
      <section className="generated-brief">
        <div className="generated-brief-header">
          <Sparkles size={16} />
          <strong>AI Meeting Preparation</strong>
        </div>
        <div className="generated-brief-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {generatedBrief.replace(/<br\s*\/?\s*>/gi, '\n')}
          </ReactMarkdown>
        </div>
      </section>
    )}

    <div className="brief-bottom"><span>Last met {contact.last}</span><button onClick={() => onToast('Brief marked as reviewed')}><Check size={14} /> Mark as reviewed</button></div>
  </div>;
}

function SettingsView({ onToast }: { onToast: (message: string) => void }) {
  return <div className="page-content settings-page"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR WORKSPACE</div><h1>Settings<span className="heading-period">.</span></h1><p className="settings-lede">A few details to make this feel like yours.</p><div className="settings-panel"><div className="settings-row"><div><strong>Workspace name</strong><span>The name your meeting prep lives under.</span></div><button onClick={() => onToast('Workspace settings saved')}>Northstar team <ChevronDown size={14} /></button></div><div className="settings-row"><div><strong>Briefing reminders</strong><span>A gentle nudge before your meetings.</span></div><button className="toggle-switch on" aria-label="Toggle briefing reminders" onClick={(event) => event.currentTarget.classList.toggle('on')}><i /></button></div><div className="settings-row"><div><strong>Default meeting prep</strong><span>When should your brief be ready?</span></div><button onClick={() => onToast('Reminder preference updated')}>30 minutes before <ChevronDown size={14} /></button></div><div className="settings-row"><div><strong>Language</strong><span>Labels shown in your memory forms.</span></div><button onClick={() => onToast('Language preferences saved')}>English + తెలుగు <ChevronDown size={14} /></button></div></div></div>;
}

export default App;
