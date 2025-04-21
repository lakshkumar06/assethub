import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ProjectList({ contract, account, provider }) {
  const [projects, setProjects] = useState([]);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract) {
      loadProjects();
    }
  }, [contract]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Get network information
      const network = await provider.getNetwork();
      console.log('Connected to network:', {
        name: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contract.target
      });

      // Verify contract code exists at address
      const code = await provider.getCode(contract.target);
      console.log('Contract code exists:', code !== '0x');
      
      console.log('Fetching project count from blockchain...');
      const count = await contract.getProjectCount();
      console.log(`Found ${count} projects on blockchain`);
      
      const projectsData = [];
      
      for (let i = 0; i < count; i++) {
        console.log(`Fetching project ${i} from blockchain...`);
        const project = await contract.getProject(i);
        projectsData.push({
          id: i,
          name: project.name,
          description: project.description,
          requiredFunding: ethers.formatEther(project.requiredFunding),
          currentFunding: ethers.formatEther(project.currentFunding),
          founder: project.founder,
          isActive: project.isActive
        });
      }
      
      console.log('All projects fetched from blockchain:', projectsData);
      setProjects(projectsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects from blockchain:', error);
      console.error('Network details:', {
        provider: provider.constructor.name,
        network: await provider.getNetwork().catch(e => 'Failed to get network'),
        contractAddress: contract.target
      });
      setLoading(false);
    }
  };

  const handleInvest = async (projectId) => {
    try {
      if (!contract || !account || !investmentAmount) return;

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      console.log('Sending investment transaction to blockchain...');
      const tx = await contractWithSigner.investInProject(projectId, {
        value: ethers.parseEther(investmentAmount)
      });
      
      console.log('Transaction sent! Hash:', tx.hash);
      console.log('View transaction on block explorer:', `https://westend.subscan.io/tx/${tx.hash}`);
      
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      loadProjects();
      setInvestmentAmount('');
      alert(`Investment successful! View transaction: https://westend.subscan.io/tx/${tx.hash}`);
    } catch (error) {
      console.error('Error investing in project:', error);
      alert('Error investing in project. Check console for details.');
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <h2>Available Projects</h2>
      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        projects.map((project) => (
          <div key={project.id} style={projectCardStyle}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p>Required Funding: {project.requiredFunding} WND</p>
            <p>Current Funding: {project.currentFunding} WND</p>
            <p>Status: {project.isActive ? 'Active' : 'Funded'}</p>
            <p>Founder: <a href={`https://westend.subscan.io/account/${project.founder}`} target="_blank" rel="noopener noreferrer">{project.founder}</a></p>
            
            {project.isActive && project.founder !== account && (
              <div style={investFormStyle}>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Amount in WND"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                />
                <button
                  onClick={() => handleInvest(project.id)}
                  style={buttonStyle}
                >
                  Invest
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const projectCardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const investFormStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '15px',
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  flex: 1,
};

const buttonStyle = {
  padding: '8px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ProjectList; 