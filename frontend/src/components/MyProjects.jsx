import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MyProjects({ contract, account }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        const projectCount = Number(await contract.getProjectCount());
        const userProjects = [];

        for (let i = 0; i < projectCount; i++) {
          const project = await contract.getProject(i);
          
          // Only include projects created by the current user
          if (project.founder.toLowerCase() === account.toLowerCase()) {
            // Get all investors for this project
            const investors = [];
            
            // Get investor details for each investor address
            for (const investorAddress of project.projectInvestors) {
              const investmentAmount = await contract.investments(i, investorAddress);
              if (investmentAmount > 0) {
                const [investorName, investorRole, investorTelegram, exists] = await contract.getUserInfo(investorAddress);
                investors.push({
                  address: investorAddress,
                  name: investorName,
                  telegram: investorTelegram,
                  amount: ethers.formatEther(investmentAmount)
                });
              }
            }

            userProjects.push({
              id: i,
              name: project.name,
              description: project.description,
              requiredFunding: ethers.formatEther(project.requiredFunding),
              currentFunding: ethers.formatEther(project.currentFunding),
              isActive: project.isActive,
              investors: investors
            });
          }
        }

        setProjects(userProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Error loading projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contract && account) {
      fetchProjects();
    }
  }, [contract, account]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">You haven't created any projects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Required Funding</p>
              <p className="font-medium">{project.requiredFunding} WND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Funding</p>
              <p className="font-medium">{project.currentFunding} WND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project Status</p>
              <p className="font-medium">{project.isActive ? 'Active' : 'Completed'}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Investors</h4>
            {project.investors.length === 0 ? (
              <p className="text-gray-500">No investors yet</p>
            ) : (
              <div className="space-y-3">
                {project.investors.map((investor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{investor.name}</p>
                      <p className="text-sm text-gray-500">Investment: {investor.amount} WND</p>
                    </div>
                    {investor.telegram && (
                      <a 
                        href={`https://t.me/${investor.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <span>📱</span>
                        {investor.telegram}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyProjects; 