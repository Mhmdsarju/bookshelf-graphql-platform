import { useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { LOGIN, REGISTER, ME } from '../graphql/operations';

interface Props {
  onAuthenticated: (token: string) => void;
}

export function AuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Demo Reader');
  const [email, setEmail] = useState('demo@bookshelf.dev');
  const [password, setPassword] = useState('Password123!');
  const [message, setMessage] = useState('');
  const [login, loginState] = useMutation(LOGIN);
  const [register, registerState] = useMutation(REGISTER);
  const loading = loginState.loading || registerState.loading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const result =
        mode === 'login'
          ? await login({ variables: { email, password } })
          : await register({ variables: { name, email, password } });
      const payload = result.data?.[mode];
      if (payload?.token) {
        localStorage.setItem('bookshelf_token', payload.token);
        onAuthenticated(payload.token);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <BookOpen size={23} />
        </div>
        <p className="eyebrow">YOUR PERSONAL READING SPACE</p>
        <h1>
          Stories start
          <br />
          <em>on your shelf.</em>
        </h1>
        <p className="muted">
          Keep your books organized, track your reading and discover your next favourite.
        </p>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            <LogIn size={16} /> Sign in
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            <UserPlus size={16} /> Create account
          </button>
        </div>
        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && (
            <label>
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </label>
          )}
          <label>
            Email address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          {message && <p className="error-text">{message}</p>}
          <button className="primary-button full" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in to BookShelf'
                : 'Create my shelf'}
          </button>
        </form>
        <p className="demo-note">Demo: demo@bookshelf.dev · Password123!</p>
      </section>
      <aside className="auth-art">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-book book-one">
          <span>
            THE ART OF
            <br />
            SLOW LIVING
          </span>
          <small>FIELD NOTES</small>
        </div>
        <div className="art-book book-two">
          <span>
            MAKE
            <br />
            IT HAPPEN
          </span>
          <small>VOL. 01</small>
        </div>
        <div className="art-book book-three">
          <span>
            THE
            <br />
            QUIET MIND
          </span>
          <small>ESSAYS</small>
        </div>
        <div className="art-caption">
          <span>01 — 05</span>
          <h2>
            A little space
            <br />
            for big ideas.
          </h2>
          <p>Collect the words that move you.</p>
        </div>
      </aside>
    </main>
  );
}
