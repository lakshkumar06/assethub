import { useState } from 'react';
import { ethers } from 'ethers';

const Auth = ({ contract, account, provider, signer, onAuthComplete }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [telegram, setTelegram] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        const contractWithSigner = contract.connect(signer);
        const tx = await contractWithSigner.registerUser(name, role, telegram);
        await tx.wait();
        onAuthComplete();
      } else {
        // Login existing user
        try {
          const [userName, userRole, userTelegram, exists] = await contract.getUserInfo(account);
          if (!exists) {
            setError('User not found. Please register first.');
            setIsRegistering(true);
            return;
          }
          onAuthComplete();
        } catch (err) {
          console.error('Error getting user info:', err);
          setError('Error checking user status. Please try registering.');
          setIsRegistering(true);
        }
      }
    } catch (err) {
      console.error('Transaction error:', err);
      if (err.message.includes("User already registered")) {
        setError('This wallet is already registered. Please login instead.');
        setIsRegistering(false);
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {error && <p style={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
              disabled={isLoading}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
              required
              disabled={isLoading}
            >
              <option value="">Select Role</option>
              <option value="investor">Investor</option>
              <option value="founder">Founder</option>
            </select>
            <input
              type="text"
              placeholder="Telegram Username (@username)"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              style={styles.input}
              required
              disabled={isLoading}
            />
          </>
        )}
        
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>
      </form>

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
        style={styles.switchButton}
        disabled={isLoading}
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  switchButton: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

export default Auth; 