import { useState } from 'react';
import { ethers } from 'ethers';

function ProjectForm({ contract, account, provider }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubLink: '',
    requiredFunding: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!contract || !account) return;

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      console.log('Creating new project on blockchain...');
      const tx = await contractWithSigner.createProject(
        formData.name,
        formData.description,
        formData.githubLink,
        ethers.parseEther(formData.requiredFunding)
      );
      
      console.log('Transaction sent! Hash:', tx.hash);
      console.log('View transaction on block explorer:', `https://westend.subscan.io/tx/${tx.hash}`);
      
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      setFormData({
        name: '',
        description: '',
        githubLink: '',
        requiredFunding: ''
      });
      
      alert(`Project created successfully! View transaction: https://westend.subscan.io/tx/${tx.hash}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Check console for details.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository Link</label>
          <input
            type="url"
            name="githubLink"
            value={formData.githubLink}
            onChange={handleChange}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Funding (WND)</label>
          <input
            type="number"
            name="requiredFunding"
            value={formData.requiredFunding}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.000000000000000001"
            min="0"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}

export default ProjectForm; 