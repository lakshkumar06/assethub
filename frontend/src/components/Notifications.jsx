import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Notifications({ contract, account, userRole }) {
  const [notifications, setNotifications] = useState([]);
  const [processedEvents, setProcessedEvents] = useState(new Set());
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  // Load dismissed notifications from localStorage on component mount
  useEffect(() => {
    const savedDismissed = localStorage.getItem(`dismissedNotifications-${account}`);
    if (savedDismissed) {
      setDismissedNotifications(new Set(JSON.parse(savedDismissed)));
    }
  }, [account]);

  // Save dismissed notifications to localStorage whenever they change
  useEffect(() => {
    if (dismissedNotifications.size > 0) {
      localStorage.setItem(
        `dismissedNotifications-${account}`,
        JSON.stringify([...dismissedNotifications])
      );
    }
  }, [dismissedNotifications, account]);

  useEffect(() => {
    if (!contract || userRole !== 'founder') {
      console.log('Notifications not initialized:', { contract: !!contract, userRole });
      return;
    }

    console.log('Setting up notifications for founder:', account);

    // Function to process a funding event
    const processFundingEvent = async (projectId, investor, amount, eventId) => {
      // Skip if we've already processed this event or if it's dismissed
      if (processedEvents.has(eventId) || dismissedNotifications.has(eventId)) {
        console.log('Skipping event:', { processed: processedEvents.has(eventId), dismissed: dismissedNotifications.has(eventId) });
        return;
      }

      console.log('Processing funding event:', { projectId, investor, amount, eventId });
      
      try {
        // Get project details
        const project = await contract.getProject(projectId);
        console.log('Project details:', project);
        
        // Only show notification if the current user is the founder of the project
        if (project.founder.toLowerCase() === account.toLowerCase()) {
          console.log('Creating notification for founder');
          const newNotification = {
            id: eventId,
            message: `Investor ${investor} funded ${ethers.formatEther(amount)} WND to your project "${project.name}"`,
            timestamp: new Date().toISOString()
          };
          
          setNotifications(prev => {
            // Check if notification with this ID already exists
            if (prev.some(n => n.id === eventId)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
          
          // Mark this event as processed
          setProcessedEvents(prev => new Set([...prev, eventId]));
        } else {
          console.log('Notification skipped - not the project founder');
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    };

    // Function to fetch past events
    const fetchPastEvents = async () => {
      try {
        console.log('Fetching past funding events...');
        const filter = contract.filters.ProjectFunded();
        const events = await contract.queryFilter(filter);
        console.log('Found past events:', events.length);

        for (const event of events) {
          const { projectId, investor, amount } = event.args;
          const eventId = `${event.transactionHash}-${event.logIndex}`;
          await processFundingEvent(projectId, investor, amount, eventId);
        }
      } catch (error) {
        console.error('Error fetching past events:', error);
      }
    };

    // Set up event listener for future events
    const filter = contract.filters.ProjectFunded();
    const handleNewEvent = (projectId, investor, amount, event) => {
      console.log('New funding event received:', { projectId, investor, amount });
      const eventId = `${event.transactionHash}-${event.logIndex}`;
      processFundingEvent(projectId, investor, amount, eventId);
    };

    contract.on(filter, handleNewEvent);

    // Fetch past events
    fetchPastEvents();

    // Cleanup function
    return () => {
      console.log('Cleaning up event listener');
      contract.removeAllListeners(filter);
      setProcessedEvents(new Set());
    };
  }, [contract, account, userRole, dismissedNotifications]);

  // Debug render
  console.log('Notifications component render:', { 
    userRole, 
    notificationCount: notifications.length,
    notifications 
  });

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setDismissedNotifications(prev => new Set([...prev, id]));
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setDismissedNotifications(prev => new Set([...prev, ...allIds]));
    setNotifications([]);
  };

  if (userRole !== 'founder') {
    console.log('Not rendering notifications - not a founder');
    return null;
  }

  if (notifications.length === 0) {
    console.log('Not rendering notifications - no notifications');
    return null;
  }

  return (
    <div style={notificationContainerStyle}>
      <div style={headerStyle}>
        <h3>Notifications</h3>
        <button 
          onClick={clearAllNotifications}
          style={clearAllButtonStyle}
        >
          Clear All
        </button>
      </div>
      {notifications.map(notification => (
        <div key={notification.id} className='overflow-hidden' style={notificationStyle}>
          <div className='w-[90%] overflow-hidden' style={notificationContentStyle}>
            <p className='text-wrap'>{notification.message}</p>
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </div>
          <button 
            onClick={() => removeNotification(notification.id)}
            style={closeButtonStyle}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const notificationContainerStyle = {
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const clearAllButtonStyle = {
  padding: '5px 10px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

const notificationStyle = {
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: 'white',
  borderRadius: '4px',
  border: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'

};

const notificationContentStyle = {
  flex: 1,
  marginRight: '10px'
};

const closeButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#6c757d',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '0 5px',
  lineHeight: '1',
  '&:hover': {
    color: '#dc3545'
  }
};

export default Notifications; 