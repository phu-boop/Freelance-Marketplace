'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Rocket,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Globe,
  Briefcase
} from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function LandingPage() {
  const { authenticated, username, login, logout } = useKeycloak();

  const features = [
    {
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      title: "Fast Matching",
      description: "Find the perfect freelancer or job in minutes with our AI-powered matching system."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Secure Payments",
      description: "Your funds are safe with our escrow system. Pay only when you're 100% satisfied."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Real-time Chat",
      description: "Communicate seamlessly with built-in real-time messaging and file sharing."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Global Talent",
      description: "Access a worldwide pool of top-tier professionals across all industries."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                FreelanceHub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <Link href="/jobs" className="hover:text-white transition-colors">Find Work</Link>
              <Link href="/jobs" className="hover:text-white transition-colors">Hire Talent</Link>
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              {authenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">Hi, {username}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 rounded-full transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-lg shadow-blue-600/20"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
              The Future of Work is Here
            </span>
            <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight">
              Hire the best <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                freelance talent
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
              Connect with top professionals worldwide. From development to design,
              we help you build your dream team and scale your business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-semibold transition-all text-center">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12"
          >
            <div>
              <div className="text-3xl font-bold">50k+</div>
              <div className="text-sm text-slate-500 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$12M+</div>
              <div className="text-sm text-slate-500 mt-1">Paid to Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-slate-500 mt-1">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-slate-500 mt-1">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to succeed</h2>
            <p className="mt-4 text-slate-400">Powerful tools designed to help you scale your freelance business.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to start your journey?</h2>
            <p className="text-blue-100 mb-10 max-w-xl mx-auto">
              Join thousands of freelancers and clients who are already building the future of work on our platform.
            </p>
            <button className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl">
              Create Free Account
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold">FreelanceHub</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="/categories" className="hover:text-white">Categories</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/rules" className="hover:text-white">Rules & Regulations</Link>
            <a href="mailto:support@freelancehub.com" className="hover:text-white">Contact</a>
          </div>
          <div className="text-sm text-slate-500">
            © 2025 FreelanceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
