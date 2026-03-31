/* eslint-disable */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Auth from './Auth';
import Landing from './Landing';
import { supabase } from './supabase';

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const path = window.location.pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ background: "#060A12", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8", fontSize: 18, fontFamily: "sans-serif" }}>
      Loading RentSage...
    </div>
  );

  // Show landing page at root if not logged in
  if (path === '/' && !session) return <Landing />;

  // Show auth if going to /app or /login without session
  if (!session) return <Auth />;

  return <App session={session} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);