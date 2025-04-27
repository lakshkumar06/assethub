import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MyInvestments({ contract, account }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError('');
        const projectCount = await contract.getProjectCount();
        const userInvestments = [];

        for (let i = 0; i < projectCount; i++) {
          const investmentAmount = await contract.investments(i, account);
          
          if (investmentAmount > 0) {
            const project = await contract.getProject(i);
            const [founderName, founderRole, founderTelegram, exists] = await contract.getUserInfo(project.founder);
            
            userInvestments.push({
              id: i,
              name: project.name,
              description: project.description,
              amount: ethers.formatEther(investmentAmount),
              founder: project.founder,
              founderName: founderName,
              founderTelegram: founderTelegram,
              isActive: project.isActive
            });
          }
        }

        setInvestments(userInvestments);
      } catch (error) {
        console.error('Error fetching investments:', error);
        setError('Error loading investments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contract && account) {
      fetchInvestments();
    }
  }, [contract, account]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your investments...</p>
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

  if (investments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">You haven't made any investments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 grid md:grid-cols-2 lg:grid-cols-3">
      {investments.map((investment) => (
        <div key={investment.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">{investment.name}</h3>
          <p className="text-gray-600 mb-4">{investment.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Investment Amount</p>
              <p className="font-medium">{investment.amount} WND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project Status</p>
              <p className="font-medium">{investment.isActive ? 'Active' : 'Completed'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Founder Information</p>
            <div className="flex justify-between">
            <p className="font-medium">{investment.founderName}</p>
            {investment.founderTelegram && (
              <p className="text-blue-600">
                <a 
                  href={`https://t.me/${investment.founderTelegram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-2"
                >
                  <span>📱</span>
                  {investment.founderTelegram}
                </a>
              </p>
            )}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyInvestments; 