"use client";
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import CompatibleStack from '../components/CompatibleStack';
import Testimonials from '../components/Testimonials';
import PlatformShowcase from '../components/PlatformShowcase';
import HowItWorks from '../components/HowItWorks';
import Security from '../components/Security';
import ForWho from '../components/ForWho';
import WhyStellar from '../components/WhyStellar';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { connectStellarWallet, disconnectStellarWallet } from '../utils/stellarWallet';

function MvpSimulationDashboard({
  connectedAddress,
}: {
  connectedAddress: string | null;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Registered and logged in successfully!');
      } else {
        setApiError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setApiError('Server connection error. Is the backend running?');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Logged in successfully!');
      } else {
        setApiError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setApiError('Server connection error. Is the backend running?');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setApiStatus('Logged out.');
  };

  const handleLinkWallet = async () => {
    if (!connectedAddress) {
      setApiError('Please connect your Stellar wallet first using the top-right button.');
      return;
    }
    if (!token) {
      setApiError('Please register or log in first.');
      return;
    }
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress: connectedAddress }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Stellar wallet successfully linked to your database profile!');
      } else {
        setApiError(data.message || 'Wallet linking failed');
      }
    } catch (err) {
      setApiError('Server connection error while linking wallet.');
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-50 border-y border-gray-200">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Stellar Wallet MVP Simulation Dashboard</h3>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">MVP Interactive Testing</span>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Left Panel: Auth Form */}
          <div className="border-r border-gray-100 pr-0 md:pr-8">
            {user ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">Active Session Info:</p>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div><span className="text-gray-400">Name:</span> {user.name}</div>
                  <div><span className="text-gray-400">Email:</span> {user.email}</div>
                  <div><span className="text-gray-400">Role:</span> <span className="uppercase font-bold text-amber-700">{user.role}</span></div>
                  <div>
                    <span className="text-gray-400">DB Wallet Address:</span>{' '}
                    <span className="text-green-700 font-bold truncate block">
                      {user.walletAddress || 'None Linked'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg py-2 transition-colors font-medium"
                >
                  Log Out Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <p className="text-sm font-bold text-gray-800">Login or Register Mock Account</p>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Name (for registration)</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Role:</span>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'buyer'}
                      onChange={() => setRole('buyer')}
                    />
                    Buyer
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'seller'}
                      onChange={() => setRole('seller')}
                    />
                    Seller
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 text-xs bg-black text-white hover:bg-gray-800 rounded-lg py-2 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="flex-1 text-xs border border-black text-black hover:bg-gray-50 rounded-lg py-2 font-medium transition-colors"
                  >
                    Register
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Panel: Wallet Link Action */}
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-sm font-bold text-gray-800">Database Wallet Association</p>
            
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div>
                <span className="text-gray-400">Selected Extension Wallet:</span>{' '}
                <span className="text-blue-700 font-bold block truncate">
                  {connectedAddress || 'None Connected'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLinkWallet}
              disabled={!connectedAddress || !token}
              className="w-full text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-black font-semibold rounded-lg py-2.5 transition-colors shadow-sm"
            >
              Sync & Save Wallet to Profile
            </button>

            {apiStatus && (
              <div className="text-xs bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{apiStatus}</span>
              </div>
            )}

            {apiError && (
              <div className="text-xs bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connectStellarWallet();
      setConnectedAddress(address);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectStellarWallet();
    setConnectedAddress(null);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <NavBar
        connectedAddress={connectedAddress}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <Hero />
      <MvpSimulationDashboard connectedAddress={connectedAddress} />
      <Stats />
      <CompatibleStack />
      <Testimonials />
      <PlatformShowcase />
      <HowItWorks />
      <Security />
      <ForWho />
      <WhyStellar />
      <CTA />
      <Footer />
    </main>
  );
}
