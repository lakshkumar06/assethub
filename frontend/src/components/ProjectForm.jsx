import { useState } from 'react';
import { ethers } from 'ethers';

function ProjectForm({ contract, account, provider }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    <div style={formContainerStyle}>
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>Project Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={textareaStyle}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label>Required Funding (ETH):</label>
          <input
            type="number"
            name="requiredFunding"
            value={formData.requiredFunding}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            style={inputStyle}
          />
        </div>
        
        <button type="submit" style={buttonStyle}>
          Create Project
        </button>
      </form>
    </div>
  );
}

const formContainerStyle = {
  marginBottom: '40px',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '100px',
  resize: 'vertical',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ProjectForm; 