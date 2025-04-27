import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ProjectList({ contract, account, provider, signer, userRole }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmounts, setInvestmentAmounts] = useState({});
  const [processingInvestments, setProcessingInvestments] = useState({});

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const projectCount = Number(await contract.getProjectCount());
      const projectsList = [];

      for (let i = 0; i < projectCount; i++) {
        const project = await contract.getProject(i);
        const [founderName, founderRole, founderTelegram, exists] = await contract.getUserInfo(project.founder);
        
        projectsList.push({
          id: i,
          name: project.name,
          description: project.description,
          githubLink: project.githubLink,
          requiredFunding: ethers.formatEther(project.requiredFunding),
          currentFunding: ethers.formatEther(project.currentFunding),
          founder: project.founder,
          founderName: founderName,
          founderTelegram: founderTelegram,
          isActive: project.isActive
        });
      }

      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error loading projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchProjects();
    }
  }, [contract]);

  const handleInvest = async (projectId) => {
    try {
      const amount = investmentAmounts[projectId];
      if (!amount || amount <= 0) {
        alert('Please enter a valid investment amount');
        return;
      }

      setProcessingInvestments(prev => ({ ...prev, [projectId]: true }));
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.investInProject(projectId, {
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      // Clear the investment amount after successful investment
      setInvestmentAmounts(prev => ({ ...prev, [projectId]: '' }));
      // Refresh projects after investment
      fetchProjects();
    } catch (error) {
      console.error('Error investing in project:', error);
      alert('Error investing in project. Check console for details.');
    } finally {
      setProcessingInvestments(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleAmountChange = (projectId, value) => {
    setInvestmentAmounts(prev => ({
      ...prev,
      [projectId]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <p className="text-gray-600 text-lg">No projects available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-[1vw]">
      {projects.map((project) => {
        const fundingPercentage = (Number(project.currentFunding) / Number(project.requiredFunding)) * 100;
        
        return (
          <div key={project.id} className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-semibold text-gray-800">{project.name}</h3>
              {project.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Completed
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-6 overflow-ellipsis line-clamp-2 min-h-[3em]">{project.description}</p>
            
            <div className="pb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Funding Progress</span>
                <span>{fundingPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{project.currentFunding} WND raised</span>
                <span>{project.requiredFunding} WND goal</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Founder Information</p>
                <div className="flex justify-between">
                <p className="font-medium text-gray-800">{project.founderName}</p>
                <a 
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View Github Repository
                </a></div>
              </div>


              {userRole === 'investor' && project.isActive && (
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={investmentAmounts[project.id] || ''}
                      onChange={(e) => handleAmountChange(project.id, e.target.value)}
                      placeholder="Amount in WND"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      step="0.000000000000000001"
                      min="0"
                      disabled={processingInvestments[project.id]}
                    />
                    <button
                      onClick={() => handleInvest(project.id)}
                      disabled={processingInvestments[project.id]}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        processingInvestments[project.id]
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {processingInvestments[project.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        'Invest'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProjectList; 