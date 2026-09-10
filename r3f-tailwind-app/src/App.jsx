import { useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Move3d, Play, Rotate3d, Sparkles, X } from 'lucide-react'
import './App.css'
import heroImage from './assets/hero.png'

const navItems = ['Product', 'How It Works', 'Features', 'About']
const steps = [
  { number: '01', eyebrow: 'The Problem', title: 'Designing a room should not feel like a second job.', body: 'Inspiration is scattered. Dimensions live in notes. Shopping becomes endless tabs. IntelliSpace brings the entire process into one considered workspace.', stat: '03 / 07', className: 'narrative-problem' },
  { number: '02', eyebrow: 'The Intelligence', title: 'Your requirements become a design direction.', body: 'Tell us how you live, what you value, and what you want to spend. IntelliSpace translates the brief into a coherent, personal starting point.', stat: 'BRIEF → DIRECTION', className: 'narrative-intelligence' },
  { number: '03', eyebrow: 'The Catalog', title: 'Recommendations grounded in a real catalog.', body: 'Retrieval finds pieces that fit your dimensions, budget, and aesthetic. No imaginary products. No disconnected suggestions.', stat: 'CURATED / CONNECTED', className: 'narrative-catalog' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)
  const faqs = ['Can I design a room without a floor plan?', 'How does the catalog stay grounded?', 'Can I change materials after generating a room?']
  return <main className="landing-shell">
    <header className="site-nav">
      <a className="wordmark" href="#top" aria-label="IntelliSpace home"><span className="wordmark-mark">I</span><span>INTELLI<span className="wordmark-muted">SPACE</span></span></a>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
        {navItems.map(item => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
        <a className="mobile-start" href="#start" onClick={() => setMenuOpen(false)}>Get Started <ArrowRight size={14} /></a>
      </nav>
      <div className="nav-actions"><a className="login-link" href="#about">Log In</a><a className="button button-small" href="#start">Get Started <ArrowRight size={14} /></a></div>
      <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="kicker"><span className="kicker-line" /> AI-POWERED INTERIOR DESIGN</p>
        <h1>Your Space.<br /><em>Reimagined.</em></h1>
        <p className="hero-subtitle">AI-powered interior design.<br />Intelligent recommendations.<br />Realistic 3D visualization.</p>
        <div className="hero-actions"><a href="#start" className="button">Start Designing <ArrowRight size={16} /></a><a href="#how-it-works" className="text-link"><span className="play-icon"><Play size={10} fill="currentColor" /></span> Explore the experience</a></div>
      </div>
      <div className="hero-visual" aria-label="Preview of the IntelliSpace 3D editor"><div className="hero-grid" /><img src={heroImage} alt="A realistic 3D room inside the IntelliSpace editor" /><div className="editor-chip chip-top"><Move3d size={14} /> 3D EDITOR <span>LIVE</span></div><div className="editor-chip chip-bottom">ROOM / 01 <span>↗</span></div><div className="hero-outline" /></div>
      <a href="#the-space" className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={16} /></a>
    </section>

    <section className="statement-section" id="product"><p className="section-index">INTELLISPACE / 001</p><h2>Less browsing.<br /><span>More belonging.</span></h2><p className="statement-copy">A complete interior design process, built around the way you actually make decisions.</p></section>

    <section className="narrative-section" id="how-it-works"><div className="section-intro"><p className="section-index">THE PROCESS</p><h2>From an empty room<br />to <em>your</em> room.</h2></div>{steps.map(step => <article className={`narrative-row ${step.className}`} key={step.number}><div className="row-number">{step.number}</div><div className="row-copy"><p className="kicker">{step.eyebrow}</p><h3>{step.title}</h3><p>{step.body}</p></div><div className="row-visual"><div className="abstract-visual"><span className="abstract-line" /><span className="abstract-circle" /></div><small>{step.stat}</small></div></article>)}</section>

    <section className="space-section" id="the-space"><div className="space-visual"><img src={heroImage} alt="IntelliSpace interactive room editor" /><div className="space-toolbar"><span><Check size={13} /> FLOORING</span><span>WALLS</span><span>LIGHTING</span><span>FURNITURE</span></div></div><div className="space-copy"><p className="section-index">04 / THE SPACE</p><h2>See the decision<br /><em>before</em> you make it.</h2><p>Move, rotate, scale, and refine in a realistic 3D editor. Every surface is editable. Every detail is yours to direct.</p><a href="#features" className="text-link">Explore the editor <ArrowRight size={15} /></a></div></section>

    <section className="features-section" id="features"><div className="section-intro"><p className="section-index">THE DETAILS</p><h2>Every surface.<br /><span>Considered.</span></h2></div><div className="feature-list">{['Walls & flooring', 'Ceilings & windows', 'Lighting & atmosphere', 'Furniture & decor'].map((feature, index) => <div className="feature-line" key={feature}><span>0{index + 1}</span><strong>{feature}</strong><ArrowUpRightIcon /></div>)}</div></section>

    <section className="control-section"><div className="control-copy"><p className="section-index">06 / THE CONTROL</p><h2>Precision for the<br /><em>particular.</em></h2><p>Good design is in the adjustment. Change a material, nudge a chair, soften the light — and watch the room respond.</p><div className="control-tools"><span><Move3d size={17} /> Move</span><span><Rotate3d size={17} /> Rotate</span><span><Sparkles size={17} /> Materials</span></div></div><div className="control-card"><div className="control-card-top"><span>ROOM / LIVING</span><span>02:14</span></div><div className="control-card-room"><div className="room-sun" /><div className="room-sofa" /><div className="room-table" /></div><div className="control-card-bottom"><span>Warm minimal / 74%</span><span className="gold-dot" /></div></div></section>

    <section className="result-section"><div className="result-heading"><p className="section-index">07 / THE RESULT</p><h2>A room that feels<br /><em>like it was always yours.</em></h2></div><div className="before-after"><div className="before-panel"><span>BEFORE / 01</span><div className="empty-room"><i /><i /><i /></div></div><div className="after-panel"><span>AFTER / 02</span><img src={heroImage} alt="Finished interior design result" /></div></div></section>

    <section className="faq-section" id="about"><div><p className="section-index">A FEW DETAILS</p><h2>Questions,<br /><em>answered.</em></h2></div><div className="faq-list">{faqs.map((faq, i) => <div className={`faq-item ${activeFaq === i ? 'is-open' : ''}`} key={faq}><button onClick={() => setActiveFaq(activeFaq === i ? null : i)}>{faq}<ChevronDown size={18} /></button>{activeFaq === i && <p>IntelliSpace is designed to keep you in control. Start with a brief, refine the room in 3D, and adjust every decision as your point of view evolves.</p>}</div>)}</div></section>

    <section className="final-cta" id="start"><p className="section-index">BEGIN WITH A ROOM</p><h2>Bring your space<br /><em>to life.</em></h2><a href="#top" className="button">Start Designing <ArrowRight size={16} /></a></section>
    <footer className="site-footer"><a className="wordmark" href="#top"><span className="wordmark-mark">I</span><span>INTELLI<span className="wordmark-muted">SPACE</span></span></a><span>AI-POWERED INTERIOR DESIGN</span><span>© 2026 INTELLISPACE</span></footer>
  </main>
}
function ArrowUpRightIcon() { return <ArrowUpRight size={17} /> }
export default App
