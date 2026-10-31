import React, { useEffect, useMemo, useState } from 'react';

const PLAN_CONFIG = {
  demo: {
    id: 'demo',
    name: 'Demo',
    price: '$0',
    description: 'Basic access and trial features',
    premium: false,
  },
  forensic_explorer: {
    id: 'forensic_explorer',
    name: 'Forensic Explorer',
    price: '$29/mo',
    description: 'Unlock advanced workspace and research tools',
    premium: true,
  },
  advocate: {
    id: 'advocate',
    name: 'Advocate',
    price: '$49/mo',
    description: 'Built for serious advocacy and case review',
    premium: true,
  },
  investigator: {
    id: 'investigator',
    name: 'Investigator',
    price: '$79/mo',
    description: 'Full platform access for investigation workflows',
    premium: true,
  },
};

export function useUserSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('fma_session_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('fma_session_token');
          localStorage.removeItem('fma_user');
          setUser(null);
          setLoading(false);
          return;
        }

        const payload = await response.json();
        setUser(payload.user || null);
        if (payload.user) {
          localStorage.setItem('fma_user', JSON.stringify(payload.user));
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading, setUser };
}

export function isPremiumUser(user) {
  if (!user) return false;
  if (typeof user.isPremium === 'boolean') return user.isPremium;
  return Boolean(user.is_premium || user.planSlug === 'forensic_explorer' || user.planSlug === 'advocate' || user.planSlug === 'investigator');
}

export function PremiumGate({ children, fallback = null, user = null }) {
  const allowed = isPremiumUser(user);
  if (!allowed) {
    return fallback;
  }
  return <>{children}</>;
}

export function UpgradePlans({ user, onSelectPlan }) {
  const plans = useMemo(() => Object.values(PLAN_CONFIG), []);

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {plans.map((plan) => {
        const active = user?.planSlug === plan.id || (user?.planSlug === 'demo' && plan.id === 'demo');

        return (
          <div
            key={plan.id}
            style={{
              border: active ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: 14,
              padding: 20,
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{plan.price}</div>
            <div style={{ color: '#4b5563', marginBottom: 16 }}>{plan.description}</div>
            <button
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: plan.premium ? '#111827' : '#e5e7eb',
                color: plan.premium ? '#fff' : '#111827',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {active ? 'Current Plan' : plan.premium ? 'Upgrade' : 'Choose Plan'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function PremiumUpgradeFlow({ user, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('forensic_explorer');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('fma_session_token');
      if (!token) {
        throw new Error('You must be logged in to upgrade');
      }

      const payload = {
        productId: selectedPlan,
        packageName: 'com.findmeancestry.app',
        purchaseToken: `mock_${selectedPlan}_${Date.now()}`,
      };

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'google_play',
          payload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Payment verification failed');
      }

      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message || 'Unable to complete checkout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>Choose your plan</h2>
      <UpgradePlans user={user} onSelectPlan={setSelectedPlan} />

      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={processing}
          style={{
            padding: '12px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            cursor: processing ? 'not-allowed' : 'pointer',
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? 'Processing...' : `Upgrade to ${PLAN_CONFIG[selectedPlan]?.name || 'Premium'}`}
        </button>
      </div>

      {error ? <div style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
    </div>
  );
}

export default function AppShellDemo() {
  const { user, loading } = useUserSession();

  if (loading) {
    return <div>Loading account...</div>;
  }

  const handleUpgradeSuccess = async () => {
    const token = localStorage.getItem('fma_session_token');
    if (!token) return;

    const response = await fetch('/api/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const payload = await response.json();
      localStorage.setItem('fma_user', JSON.stringify(payload.user || {}));
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <strong>Signed in:</strong> {user ? user.email || 'Authenticated user' : 'No active session'}
      </div>

      <PremiumGate user={user} fallback={<PremiumUpgradeFlow user={user} onSuccess={handleUpgradeSuccess} />}>
        <div>
          <h2>Premium access unlocked</h2>
          <p>You have access to premium tools and workspaces.</p>
        </div>
      </PremiumGate>

      {!user && <PremiumUpgradeFlow user={user} onSuccess={handleUpgradeSuccess} />}
    </div>
  );
}
