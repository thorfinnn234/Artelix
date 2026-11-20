import { Link } from "react-router-dom";
import { Hammer, Wrench, ShieldCheck, ArrowUpRight } from "lucide-react";

export function Brand({ to = "/", className = "" }) {
  return <Link to={to} className={`site-brand ${className}`} aria-label="Artelix home"><span className="site-brand-mark"><Hammer size={20}/></span><span>artelix<span className="site-brand-dot">.</span></span></Link>;
}

export function AuthBrandPanel() {
  return <aside className="auth-brand-panel"><Brand to="/welcome"/><div className="auth-brand-content"><span className="site-eyebrow">LOCAL TALENT. REAL POSSIBILITIES.</span><h1>Good hands.<br/>Great work.<br/><span>Starts here.</span></h1><p>A home for great craft. A simpler way to find the right person for your next project.</p><div className="auth-craft-art" aria-hidden="true"><span className="auth-tool"><Wrench size={76} strokeWidth={1.3}/></span><span className="auth-craft-caption">A little expertise.<br/>A lot of possibility.</span><ArrowUpRight size={40}/></div></div><div className="auth-brand-bottom"><ShieldCheck size={17}/><span>Discover. Connect. Create.</span><span>Made for Nigeria</span></div></aside>;
}

export function PageIntro({ eyebrow, title, description, children }) {
  return <section className="page-intro"><div><span className="site-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="page-intro-action">{children || <span className="intro-craft" aria-hidden="true"><Hammer size={56} strokeWidth={1.2}/></span>}</div></section>;
}
