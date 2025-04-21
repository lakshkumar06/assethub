import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import Auth from './components/Auth';
import contractABI from './contractABI.json';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const contractAddress = '0x3e6AfC99BeF339061334a06c6b8d7b8db0B3927D';
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        setProvider(provider);
        setContract(contract);
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        
        // Get signer after connecting wallet
        const signer = await provider.getSigner();
        setSigner(signer);
        
        // Update contract with signer
        const contractWithSigner = contract.connect(signer);
        setContract(contractWithSigner);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleAuthComplete = async () => {
    if (contract && account) {
      const [name, role, exists] = await contract.getUserInfo(account);
      setUserInfo({ name, role, exists });
      setIsAuthenticated(true);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Project Funding Platform</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={buttonStyle}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          {userInfo && (
            <p>Welcome, {userInfo.name} ({userInfo.role})</p>
          )}
        </div>
      )}

      {account && !isAuthenticated && (
        <Auth 
          contract={contract}
          account={account}
          provider={provider}
          signer={signer}
          onAuthComplete={handleAuthComplete}
        />
      )}

      {account && isAuthenticated && (
        <>
          <ProjectForm 
            contract={contract}
            account={account}
            provider={provider}
            signer={signer}
            userRole={userInfo.role}
          />
          <ProjectList 
            contract={contract}
            account={account}
            provider={provider}
            signer={signer}
            userRole={userInfo.role}
          />
        </>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '20px'
};

export default App;
