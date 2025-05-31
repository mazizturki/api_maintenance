    /*const API_URL = 'https://vierund-maintenance.onrender.com/api/maintenance';*/
    const API_URL = 'http://localhost:5000/api/maintenance';

    const API_KEY = 'v44i31er5u015nd190105a'; 

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Character counter for textarea
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    
    messageTextarea.addEventListener('input', () => {
      const currentLength = messageTextarea.value.length;
      charCount.textContent = `${currentLength}/500`;
      
      if (currentLength > 450) {
        charCount.style.color = '#f8961e';
      } else {
        charCount.style.color = 'inherit';
      }
      
      if (currentLength >= 500) {
        charCount.style.color = '#f72585';
      }
    });

    // Load current state
    function loadCurrentState() {
      showLoading(true);
      
      fetch(API_URL, {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY
        }
      })
        .then(response => {
          if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          return response.json();
        })
        .then(data => {
          document.getElementById('isActive').checked = data.isActive;
          document.getElementById('message').value = data.message || '';
          charCount.textContent = `${data.message?.length || 0}/500`;
          showStatus('Configuration actuelle chargée', 'success');
        })
        .catch(error => {
          console.error('Erreur:', error);
          showStatus(`Échec du chargement: ${error.message}`, 'error');
        })
        .finally(() => {
          showLoading(false);
        });
    }

    // Submit form
    document.getElementById('maintenance-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const isActive = document.getElementById('isActive').checked;
      const message = document.getElementById('message').value.trim();
      
      if (isActive && !message) {
        showStatus('Un message est requis lorsque le mode maintenance est activé', 'error');
        return;
      }
      
      if (message.length > 500) {
        showStatus('Le message ne peut pas dépasser 500 caractères', 'error');
        return;
      }
      
      await updateMaintenanceStatus(isActive, message);
    });

    // Update maintenance status
    async function updateMaintenanceStatus(isActive, message) {
      showLoading(true);
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({ 
            isActive, 
            message,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin' // À remplacer par l'utilisateur réel
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
        
        const data = await response.json();
        showStatus('Configuration enregistrée avec succès', 'success');
        
        // Log the action (simulation)
        console.log('Maintenance updated:', data);
      } catch (error) {
        console.error('Erreur:', error);
        showStatus(`Échec de l'enregistrement: ${error.message}`, 'error');
      } finally {
        showLoading(false);
      }
    }

    // Show status message
    function showStatus(message, type) {
      const statusElement = document.getElementById('status');
      const statusMessage = document.getElementById('status-message');
      const statusIcon = statusElement.querySelector('.status-icon');
      
      // Clear previous classes
      statusElement.className = '';
      statusElement.classList.add(type);
      
      // Update icon based on type
      statusIcon.className = 'fas status-icon ' + 
        (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle');
      
      statusMessage.textContent = message;
      statusElement.style.display = 'flex';
      
      // Hide status after 5 seconds
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 5000);
    }

    // Show/hide loading state
    function showLoading(isLoading) {
      const btnText = document.getElementById('btn-text');
      const btnLoader = document.getElementById('btn-loader');
      const submitBtn = document.getElementById('submit-btn');
      const saveIcon = submitBtn.querySelector('i');
      
      if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Enregistrement...';
        saveIcon.className = 'fas fa-spinner fa-pulse';
        btnLoader.style.display = 'inline-block';
      } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Enregistrer les modifications';
        saveIcon.className = 'fas fa-save';
        btnLoader.style.display = 'none';
      }
    }

    // Load initial state when page loads
    document.addEventListener('DOMContentLoaded', () => {
      loadCurrentState();
      
      // Add animation to form elements
      const formElements = document.querySelectorAll('.form-group, .switch-container');
      formElements.forEach((el, index) => {
        el.style.animation = `fadeIn 0.4s ease-out ${index * 0.1}s forwards`;
        el.style.opacity = '0';
      });
    });