import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiShield,
  FiGlobe,
  FiLayers,
  FiZap,
  FiMenu,
  FiX,
  FiBarChart,
  FiChevronRight,
} from "react-icons/fi";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-brand-background text-brand-on-background selection:bg-brand-secondary/30 selection:text-brand-secondary font-sans antialiased">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-lg py-4" : "bg-transparent py-8"
          }`}
      >
        <div className="max-w-brand-max_width mx-auto px-brand-margin flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="text-headline-md font-bold tracking-tighter flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-on-surface rounded-xl flex items-center justify-center text-brand-surface text-xl shadow-lg group-hover:rotate-6 transition-transform">N</div>
              <span className="text-brand-on-surface">NoCall</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/login" className="text-label-bold text-brand-on-surface-variant hover:text-brand-on-surface transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-brand-secondary text-brand-on-secondary px-7 py-3 rounded-brand-default text-label-bold hover:shadow-xl hover:shadow-brand-secondary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Get Started
              <FiChevronRight />
            </Link>
          </div>

          <button className="lg:hidden text-2xl text-brand-on-surface" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-24 lg:pb-32 overflow-hidden bg-white">
        {/* Ambient background glow behind image */}
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-brand-max_width mx-auto px-brand-margin relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Column: Content */}
            <div className="lg:col-span-6 animate-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-surface-container-highest/50 border border-brand-secondary/10 mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-secondary">The Institutional Standard</span>
              </div>

              <h1 className="text-[44px] lg:text-[64px] font-bold text-brand-on-surface leading-[1.1] tracking-tight mb-8">
                The Institutional Standard for <br className="hidden lg:block" />
                Cooperative Management.
              </h1>

              <p className="text-body-md lg:text-body-lg text-brand-on-surface-variant/80 mb-12 leading-relaxed">
                Unify complex financial workflows with a multi-tenant platform designed for transparency, agility, and high-stakes performance.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#006a61] text-white px-10 py-4 rounded-brand-default text-label-bold flex items-center gap-3 hover:bg-[#005a52] transition-all active:scale-95 shadow-lg group"
                >
                  Get Started Now
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Image Display */}
            <div className="lg:col-span-6 relative animate-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="relative z-10 bg-white p-2 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="/Institution.png"
                    alt="NoCall Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Subtle backglow for the image card */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cloud */}
      <section className="py-20 border-y border-brand-outline-variant/30 bg-brand-surface/50">
        <div className="max-w-brand-max_width mx-auto px-brand-margin">
          <p className="text-center text-label-sm uppercase tracking-[0.3em] text-brand-on-surface-variant font-bold mb-12 opacity-80">
            Trusted by Leading Financial Cooperatives
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {["Apex Global", "Nest Capital", "Secure Union", "Vortex Co-Op"].map((name) => (
              <div key={name} className="flex items-center gap-3 font-bold text-xl text-brand-on-surface tracking-tighter">
                <FiZap className="text-brand-secondary text-2xl" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-brand-surface">
        <div className="max-w-brand-max_width mx-auto px-brand-margin">
          <div className="mb-24">
            <h2 className="text-display-xl !text-[40px] text-brand-on-surface mb-8 leading-tight tracking-tight">
              Precision-engineered for the modern cooperative ecosystem.
            </h2>
            <p className="text-body-lg text-brand-on-surface-variant leading-relaxed">
              Complexity managed. Growth enabled. NoCall provides the foundational architecture for institutional excellence, balancing deep functionality with effortless user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Multi-tenancy Card */}
            <div className="md:col-span-8 glass rounded-[2rem] p-12 flex flex-col h-[560px] group overflow-hidden relative border border-white/40 shadow-xl">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-brand-secondary-container rounded-2xl flex items-center justify-center text-brand-secondary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md">
                  <FiLayers className="text-2xl" />
                </div>
                <h3 className="text-headline-lg text-brand-on-surface mb-6">Enterprise Multi-tenancy</h3>
                <p className="text-body-md text-brand-on-surface-variant leading-relaxed">
                  Manage thousands of distinct entities under a single administrative umbrella with granular permissioning and isolated data architecture. Scalability is woven into our core.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden pointer-events-none">
                <img
                  src="/data.png"
                  alt="Data Flow"
                  className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent" />
              </div>
            </div>

            {/* Security Card */}
            <div className="md:col-span-4 bg-brand-primary-container rounded-[2rem] p-12 flex flex-col justify-between h-[560px] text-brand-surface group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <FiShield className="text-[120px]" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand-secondary mb-8 border border-white/10 shadow-lg">
                  <FiShield className="text-2xl" />
                </div>
                <h3 className="text-headline-lg mb-6 text-white tracking-tight">High-Stakes Security</h3>
                <p className="text-body-md text-brand-on-primary-container leading-relaxed">
                  SOC2 Type II compliant infrastructure with multi-signature verification protocols and real-time threat detection to protect your institutional integrity.
                </p>
              </div>
              <button className="relative z-10 text-label-bold flex items-center gap-3 hover:gap-5 transition-all text-brand-secondary group/btn w-fit">
                Security Whitepaper
                <FiArrowRight className="text-xl" />
              </button>
            </div>

            {/* Global Scalability */}
            <div className="md:col-span-4 glass rounded-[2rem] p-12 flex flex-col items-center text-center group border border-white/40 shadow-lg hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-brand-surface-container-lowest rounded-3xl flex items-center justify-center text-brand-secondary shadow-xl mb-10 group-hover:scale-110 transition-transform border border-brand-outline-variant/30">
                <FiGlobe className="text-3xl" />
              </div>
              <h3 className="text-headline-md text-brand-on-surface mb-4">Global Scalability</h3>
              <p className="text-body-md text-brand-on-surface-variant leading-relaxed">
                Distributed edge computing ensuring zero-latency for international stakeholders across multiple jurisdictions.
              </p>
            </div>

            {/* Institutional Reporting */}
            <div className="md:col-span-8 glass rounded-[2rem] p-12 flex flex-col md:flex-row items-center gap-16 group border border-white/40 shadow-lg">
              <div className="flex-1">
                <div className="w-14 h-14 bg-brand-tertiary-container/20 rounded-2xl flex items-center justify-center text-brand-on-tertiary-container mb-8">
                  <FiBarChart className="text-2xl" />
                </div>
                <h3 className="text-headline-lg text-brand-on-surface mb-6">Institutional Reporting</h3>
                <p className="text-body-md text-brand-on-surface-variant mb-10 leading-relaxed">
                  Automated compliance engines and dynamic audit logs that transform raw transaction data into board-ready insights instantly.
                </p>
                <button className="bg-brand-surface-container-lowest border border-brand-outline-variant px-8 py-3 rounded-brand-default text-label-bold hover:bg-brand-surface-container transition-all shadow-sm">
                  Explore Insights
                </button>
              </div>
              <div className="flex-1 w-full space-y-6 md:pr-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-3 bg-brand-outline-variant/20 rounded-full w-full relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-secondary rounded-full"
                      style={{
                        width: `${30 + (i * 15)}%`,
                        opacity: 1 - (i * 0.15),
                        transition: 'width 1.5s ease-out'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-brand-max_width mx-auto px-brand-margin">
          <div className="bg-brand-primary-container rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_48px_80px_-16px_rgba(11,28,48,0.3)]">
            {/* Geometric background patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full opacity-40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white rounded-full opacity-20" />
            </div>

            <div className="relative z-10">
              <h2 className="text-display-xl !text-[44px] text-white mb-8 leading-tight tracking-tight max-w-3xl mx-auto">
                Ready to define the future of your cooperative?
              </h2>
              <p className="text-body-lg text-brand-on-primary-container mb-16 max-w-2xl mx-auto opacity-90 leading-relaxed">
                Join hundreds of institutions modernizing their management framework with NoCall. Deploy in weeks, not months. Experience true digital transformation.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-brand-secondary text-brand-on-secondary px-14 py-5 rounded-brand-default text-label-bold hover:shadow-2xl hover:shadow-brand-secondary/40 transition-all active:scale-95 text-lg"
                >
                  Create Your Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-brand-outline-variant/30 bg-brand-surface-container-low/30">
        <div className="max-w-brand-max_width mx-auto px-brand-margin">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-16 mb-24">
            <div className="md:col-span-2">
              <div className="text-headline-md font-bold tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-on-surface rounded-lg flex items-center justify-center text-brand-surface text-base">N</div>
                <span>NoCall</span>
              </div>
              <p className="text-body-md text-brand-on-surface-variant max-w-xs leading-relaxed mb-8">
                High-stakes institutional management systems engineered for the global cooperative sector.
              </p>
            </div>
            <div>
              <h4 className="text-label-bold text-brand-on-surface uppercase tracking-[0.2em] text-xs mb-10">Product</h4>
              <ul className="space-y-5">
                <li><Link to="/login" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label-bold text-brand-on-surface uppercase tracking-[0.2em] text-xs mb-10">Company</h4>
              <ul className="space-y-5">
                <li><a href="#" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label-bold text-brand-on-surface uppercase tracking-[0.2em] text-xs mb-10">Resources</h4>
              <ul className="space-y-5">
                <li><a href="#" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-body-md text-brand-on-surface-variant hover:text-brand-secondary transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-brand-outline-variant/30 gap-8">
            <p className="text-label-sm text-brand-on-surface-variant opacity-60 font-medium uppercase">
              © 2026 NOCALL COOPERATIVE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-label-sm font-bold">
                <FiGlobe className="text-lg" />
                <span>GLOBAL / EN</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] glass-dark animate-in fade-in duration-300 md:hidden flex flex-col items-center justify-center p-8">
          <button className="absolute top-8 right-8 text-3xl text-white" onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </button>
          <div className="flex flex-col items-center space-y-8">
            <Link
              to="/login"
              className="text-xl font-medium text-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-brand-secondary text-brand-on-secondary px-10 py-4 rounded-brand-default text-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
