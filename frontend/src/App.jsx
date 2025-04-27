import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import Notifications from './components/Notifications';
import MyInvestments from './components/MyInvestments';
import MyProjects from './components/MyProjects';
import contractABI from './contractABI.json';
import LandingPage from './components/LandingPage';

function RegistrationForm({ contract, account, onRegistered }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('investor');
  const [telegram, setTelegram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // First check if user is already registered
      const [existingName, existingRole, existingTelegram, exists] = await contract.getUserInfo(account);
      
      if (exists) {
        setError('This wallet is already registered. Please use a different wallet or contact support.');
        return;
      }

      const tx = await contract.registerUser(name, role, telegram);
      await tx.wait();
      onRegistered();
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.message.includes("User already registered")) {
        setError('This wallet is already registered. Please use a different wallet or contact support.');
      } else {
        setError('Error registering user. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Complete Your Registration</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
            >
              <option value="investor">Investor</option>
              <option value="founder">Founder</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-2">Telegram Username</label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
              required
              placeholder="@username"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const contractAddress = '0x6ed6FBddB8B2F592F246B4b8881A4D3f44064D9E';
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
        
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const contractWithSigner = contract.connect(signer);
        setContract(contractWithSigner);

        // Get user info immediately after connecting
        try {
          const [name, role, telegram, exists] = await contractWithSigner.getUserInfo(accounts[0]);
          setUserInfo({ name, role, telegram, exists });
        } catch (error) {
          console.error('Error getting user info:', error);
          // If there's an error, assume user needs to register
          setUserInfo({ exists: false });
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Landing page
  if (!account) {
    return (
        <div className="bg-white/10">
          <div className="flex nav px-[5vw] py-[20px] justify-between  border-b-[1px] border-[#e6e6e6] text-center" >
            <div className="flexCol">
            <h1 className="text-[20px] font-bold text-black">Project Funding Platform</h1>
            </div>
          <button 
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Connect Wallet
          </button>
          </div>
        <LandingPage/>        
      </div>
    );
  }

  // Show registration form if user is not registered
  if (account && (!userInfo || !userInfo.exists)) {
    return (
      <RegistrationForm 
        contract={contract}
        account={account}
        onRegistered={async () => {
          const [name, role, exists] = await contract.getUserInfo(account);
          setUserInfo({ name, role, exists });
        }}
      />
    );
  }

  // Dashboard layout
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Project Funding Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
              {userInfo && (
                <span className="text-sm text-gray-600">Welcome, {userInfo.name}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm flex-shrink-0 overflow-y-auto">
          <nav className="mt-5 px-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                activeTab === 'home' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 w-[1em]"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 15L12 18" stroke="#000" stroke-width="2.5" stroke-linecap="round"></path> <path d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274" stroke="#000" stroke-width="2.5" stroke-linecap="round"></path> </g></svg></span>
              Home
            </button>
            
            {userInfo?.role === 'founder' && (
              <button
                onClick={() => setActiveTab('create')}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === 'create' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 w-[1em]"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></span>
                Create Project
              </button>
            )}

            <button
              onClick={() => setActiveTab('browse')}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                activeTab === 'browse' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 w-[1em]"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></span>
              Browse Projects
            </button>

            {userInfo?.role === 'founder' ? (
              <button
                onClick={() => setActiveTab('myProjects')}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === 'myProjects' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 w-[1em]"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 7L4 7" stroke="#000" stroke-width="1.5" stroke-linecap="round"></path> <path d="M15 12L4 12" stroke="#000" stroke-width="1.5" stroke-linecap="round"></path> <path d="M9 17H4" stroke="#000" stroke-width="1.5" stroke-linecap="round"></path> </g></svg></span>
                My Projects
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('myInvestments')}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === 'myInvestments' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 w-[1em]">$</span>
                My Investments
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                activeTab === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 w-[1em]"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="3" stroke="#000" stroke-width="1.5"></circle> <path d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273" stroke="#000" stroke-width="1.5" stroke-linecap="round"></path> </g></svg></span>
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {activeTab === 'home' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Welcome to your Dashboard</h2>
                <p className="text-gray-600">Select an option from the sidebar to get started.</p>
              </div>
            )}
            {activeTab === 'create' && userInfo?.role === 'founder' && (
              <ProjectForm 
                contract={contract}
                account={account}
                provider={provider}
                signer={signer}
                userRole={userInfo.role}
              />
            )}
            {activeTab === 'browse' && (
              <ProjectList 
                contract={contract}
                account={account}
                provider={provider}
                signer={signer}
                userRole={userInfo?.role}
              />
            )}
            {activeTab === 'myProjects' && userInfo?.role === 'founder' && (
              <MyProjects 
                contract={contract}
                account={account}
              />
            )}
            {activeTab === 'myInvestments' && userInfo?.role === 'investor' && (
              <MyInvestments 
                contract={contract}
                account={account}
              />
            )}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Settings</h2>
                <p className="text-gray-600">Settings page coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Notifications (Only for founders) */}
        {userInfo?.role === 'founder' && (
          <div className="w-[400px] bg-white shadow-sm flex-shrink-0 overflow-y-auto p-4">
            <Notifications 
              contract={contract}
              account={account}
              userRole={userInfo?.role}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
