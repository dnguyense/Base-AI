import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext();

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY));

  const storeTokens = useCallback(({ accessToken: nextAccess, refreshToken: nextRefresh }) => {
    if (nextAccess) {
      localStorage.setItem(ACCESS_TOKEN_KEY, nextAccess);
      setAccessToken(nextAccess);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setAccessToken(null);
    }

    if (nextRefresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, nextRefresh);
      setRefreshToken(nextRefresh);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setRefreshToken(null);
    }
  }, []);

  const clearSession = useCallback(() => {
    storeTokens({ accessToken: null, refreshToken: null });
    setUser(null);
    setSubscription(null);
    setAuthError(null);
  }, [storeTokens]);

  const fetchSubscription = useCallback(async (token) => {
    if (!token) {
      setSubscription(null);
      return;
    }

    try {
      const response = await fetch('/api/v1/subscription/current', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const body = await response.json();
        setSubscription(body.data?.subscription ?? null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  }, []);

  const loadUserProfile = useCallback(
    async (token) => {
      if (!token) {
        return false;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          return false;
        }

        const body = await response.json();
        setUser(body.data?.user ?? null);
        setAuthError(null);
        await fetchSubscription(token);
        return true;
      } catch (error) {
        console.error('Profile fetch failed:', error);
        return false;
      }
    },
    [fetchSubscription],
  );

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        setAuthError('Session expired. Please sign in again.');
        clearSession();
        return null;
      }

      const body = await response.json();
      const tokens = body?.data?.tokens;

      if (tokens?.accessToken) {
        storeTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || refreshToken,
        });
        setAuthError(null);
        return tokens.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAuthError('Session expired. Please sign in again.');
    }

    clearSession();
    return null;
  }, [refreshToken, clearSession, storeTokens]);

  const authFetch = useCallback(
    async (input, init = {}, retryOnAuth = true) => {
      const headers = new Headers(init.headers || {});
      const bearer = accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);

      if (bearer) {
        headers.set('Authorization', `Bearer ${bearer}`);
      }

      const response = await fetch(input, { ...init, headers });

      if (response.status === 401 && retryOnAuth && refreshToken) {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          const retryHeaders = new Headers(init.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newAccess}`);
          return fetch(input, { ...init, headers: retryHeaders });
        }
      }

      return response;
    },
    [accessToken, refreshToken, refreshAccessToken],
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (accessToken && refreshToken) {
        const valid = await loadUserProfile(accessToken);
        if (!valid) {
          const newAccess = await refreshAccessToken();
          if (newAccess) {
            await loadUserProfile(newAccess);
          }
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        return {
          success: false,
          error: payload.message || payload.error || 'Login failed. Please try again.',
        };
      }

      const tokens = payload.data?.tokens;
      if (tokens?.accessToken) {
        storeTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        const loaded = await loadUserProfile(tokens.accessToken);
        if (!loaded) {
          setUser(payload.data?.user ?? null);
        }
      } else {
        setUser(payload.data?.user ?? null);
      }

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError('Login failed. Please try again.');
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email, password, name) => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        return {
          success: false,
          error: payload.message || payload.error || 'Registration failed. Please try again.',
        };
      }

      const tokens = payload.data?.tokens;
      if (tokens?.accessToken) {
        storeTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        const loaded = await loadUserProfile(tokens.accessToken);
        if (!loaded) {
          setUser(payload.data?.user ?? null);
        }
      } else {
        setUser(payload.data?.user ?? null);
      }

      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError('Registration failed. Please try again.');
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
      }
    } finally {
      clearSession();
    }
  };

  const updateSubscription = (newSubscription) => {
    setSubscription(newSubscription);
  };

  const value = {
    user,
    subscription,
    isLoading,
    authError,
    login,
    register,
    logout,
    authFetch,
    refreshAccessToken,
    updateSubscription,
    isAuthenticated: !!user,
    isPremium: subscription?.status === 'active',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
