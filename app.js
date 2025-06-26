class OnboardingApp {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6; // Updated to 6 steps
    this.welcomeShown = false;
    this.formData = {
      companyName: '',
      description: '',
      logo: null,
      themeColor: '#2f18c0', // Default blue
      country: 'BR',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      language: 'pt-BR',
      businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      businessHoursMsg: 'Olá! Obrigado por entrar em contato conosco. Recebemos sua mensagem e estamos conectando você a um de nossos representantes.',
      afterHoursMsg: 'Olá! Obrigado por entrar em contato conosco. Estamos ausentes agora. Por favor, deixe sua mensagem e responderemos assim que estivermos de volta.',
      teamSetupChoice: '',
      channels: {},
      teamInvites: []
    };
    this.init();
  }

  init() {
    this.setupWelcomeScreen();
    this.setupEventListeners();
    this.updateProgressIndicator();
    this.updateSidebarState();
    this.initializeChannelStates();
    this.applyThemeColor(this.formData.themeColor);
  }

  setupWelcomeScreen() {
    const startButton = document.getElementById('start-setup');
    if (startButton) {
      startButton.addEventListener('click', () => {
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('onboarding-app').classList.remove('hidden');
        this.welcomeShown = true;
      });
    }
  }

  setupEventListeners() {
    // Step 1 - Company Setup
    const companyNameInput = document.getElementById('company-name');
    if (companyNameInput) {
      companyNameInput.addEventListener('input', () => this.validateStep1());
    }

    const continueStep1 = document.getElementById('continue-step1');
    if (continueStep1) {
      continueStep1.addEventListener('click', () => this.nextStep());
    }

    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
    });

    // Logo upload area
    const logoUploadArea = document.querySelector('.logo-upload-area');
    if (logoUploadArea) {
      logoUploadArea.addEventListener('click', () => this.handleLogoUpload());
    }

    // Step 2 - Business Preferences
    ['country', 'timezone', 'date-format', 'language'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.validateStep2());
      }
    });

    const backStep2 = document.getElementById('back-step2');
    if (backStep2) {
      backStep2.addEventListener('click', () => this.prevStep());
    }

    const continueStep2 = document.getElementById('continue-step2');
    if (continueStep2) {
      continueStep2.addEventListener('click', () => this.nextStep());
    }

    // Step 3 - Business Hours
    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.toggleBusinessDay(e));
    });

    document.querySelectorAll('.all-day-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.toggleAllDay(e));
    });

    ['business-hours-msg', 'after-hours-msg'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.saveFormData());
      }
    });

    const backStep3 = document.getElementById('back-step3');
    if (backStep3) {
      backStep3.addEventListener('click', () => this.prevStep());
    }

    const continueStep3 = document.getElementById('continue-step3');
    if (continueStep3) {
      continueStep3.addEventListener('click', () => this.nextStep());
    }

    // Step 4 - Team Setup
    const sendInviteButton = document.getElementById('send-invite');
    if (sendInviteButton) {
      sendInviteButton.addEventListener('click', () => this.sendTeamInvite());
    }

    const backStep4 = document.getElementById('back-step4');
    if (backStep4) {
      backStep4.addEventListener('click', () => this.prevStep());
    }

    const continueStep4 = document.getElementById('continue-step4');
    if (continueStep4) {
      continueStep4.addEventListener('click', () => this.nextStep());
    }

    // Step 5 - Channel Integration
    document.querySelectorAll('.channel-item input[type="checkbox"]').forEach(toggle => {
      toggle.addEventListener('change', (e) => this.toggleChannel(e.target.dataset.platform, e.target.checked));
    });

    const instagramButton = document.querySelector('.btn--instagram');
    if (instagramButton) {
      instagramButton.addEventListener('click', () => this.connectInstagram());
    }

    const backStep5 = document.getElementById('back-step5');
    if (backStep5) {
      backStep5.addEventListener('click', () => this.prevStep());
    }

    const nextStep5 = document.getElementById('next-step5');
    if (nextStep5) {
      nextStep5.addEventListener('click', () => this.completeOnboarding());
    }

    // Sidebar navigation
    document.querySelectorAll('.step-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const stepNumber = parseInt(e.currentTarget.dataset.step);
        if (stepNumber <= this.currentStep && !e.currentTarget.classList.contains('disabled')) {
          this.goToStep(stepNumber);
        }
      });
    });
  }

  validateStep1() {
    const companyName = document.getElementById('company-name').value.trim();
    const themeColor = this.formData.themeColor;
    this.formData.companyName = companyName;

    const isValid = companyName !== '' && themeColor !== '';
    const continueButton = document.getElementById('continue-step1');
    if (continueButton) {
      continueButton.disabled = !isValid;
    }
    return isValid;
  }

  validateStep2() {
    const country = document.getElementById('country').value;
    const timezone = document.getElementById('timezone').value;
    const dateFormat = document.getElementById('date-format').value;
    const language = document.getElementById('language').value;

    this.formData.country = country;
    this.formData.timezone = timezone;
    this.formData.dateFormat = dateFormat;
    this.formData.language = language;

    const isValid = country && timezone && dateFormat && language;
    const continueButton = document.getElementById('continue-step2');
    if (continueButton) {
      continueButton.disabled = !isValid;
    }
    return isValid;
  }

  selectColor(color) {
    // Remove previous selection
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.remove('selected');
    });

    // Add selection to clicked color
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    this.formData.themeColor = color;
    this.applyThemeColor(color);
    this.validateStep1();
  }

  applyThemeColor(color) {
    // Calculate hover and active states
    const hoverColor = this.adjustBrightness(color, -10);
    const activeColor = this.adjustBrightness(color, -20);

    // Update CSS variables
    document.documentElement.style.setProperty('--color-primary', color);
    document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
    document.documentElement.style.setProperty('--color-primary-active', activeColor);
    document.documentElement.style.setProperty('--sidebar-bg', color);
  }

  adjustBrightness(color, percent) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust brightness
    const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
    const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
    const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));

    // Convert back to hex
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }

  handleLogoUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.formData.logo = file;
        const placeholder = document.querySelector('.upload-placeholder p');
        if (placeholder) {
          placeholder.textContent = `Arquivo selecionado: ${file.name}`;
        }
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  toggleBusinessDay(e) {
    const day = e.target.dataset.day;
    const isChecked = e.target.checked;
    const daySchedule = e.target.closest('.day-schedule');
    const timeInputs = daySchedule.querySelectorAll('.time-input, .all-day-checkbox');

    timeInputs.forEach(input => {
      input.disabled = !isChecked;
    });

    if (isChecked) {
      this.formData.businessDays.push(day);
    } else {
      this.formData.businessDays = this.formData.businessDays.filter(d => d !== day);
    }
  }

  toggleAllDay(e) {
    const isAllDay = e.target.checked;
    const daySchedule = e.target.closest('.day-schedule');
    const timeInputs = daySchedule.querySelectorAll('.time-input');

    timeInputs.forEach(input => {
      input.disabled = isAllDay;
    });
  }

  sendTeamInvite() {
    const email = document.getElementById('team-email').value.trim();
    const role = document.getElementById('team-role').value;

    if (email && role) {
      const invite = { email, role, status: 'Pendente' };
      this.formData.teamInvites.push(invite);
      this.updateInvitesTable();
      
      // Clear form
      document.getElementById('team-email').value = '';
      document.getElementById('team-role').value = '';
      
      this.showNotification('Convite enviado com sucesso!', 'success');
    }
  }

  updateInvitesTable() {
    const tbody = document.getElementById('invites-list');
    if (tbody) {
      tbody.innerHTML = '';
      
      this.formData.teamInvites.forEach((invite, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${invite.email}</td>
          <td>${invite.role}</td>
          <td>
            <button class="btn btn--sm btn--outline" onclick="onboardingApp.removeInvite(${index})">
              Remover
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  }

  removeInvite(index) {
    this.formData.teamInvites.splice(index, 1);
    this.updateInvitesTable();
    this.showNotification('Convite removido', 'info');
  }

  initializeChannelStates() {
    const channels = {
      facebook: false,
      instagram: false,
      whatsapp: false,
      messenger: false,
      email: false
    };
    this.formData.channels = channels;

    Object.entries(channels).forEach(([platform, connected]) => {
      const toggle = document.querySelector(`input[data-platform="${platform}"]`);
      if (toggle) {
        toggle.checked = connected;
      }
    });
  }

  toggleChannel(platform, enabled) {
    this.formData.channels[platform] = enabled;
    this.updateChannelStatus(platform, enabled);
    this.updateNextButton();
  }

  updateChannelStatus(platform, enabled) {
    const channelItem = document.querySelector(`[data-platform="${platform}"]`);
    if (channelItem) {
      const statusElement = channelItem.querySelector('.status');
      if (statusElement) {
        statusElement.textContent = enabled ? 'Conectado' : 'Desconectado';
        statusElement.className = enabled ? 'status connected' : 'status disconnected';
      }
    }
  }

  connectInstagram() {
    const button = document.querySelector('.btn--instagram');
    if (button) {
      button.textContent = 'Conectando...';
      button.disabled = true;
      
      setTimeout(() => {
        button.textContent = 'Conectado';
        button.style.background = 'var(--color-success)';
        
        // Update channel status
        this.formData.channels.instagram = true;
        this.updateChannelStatus('instagram', true);
        this.updateNextButton();
        
        this.showNotification('Instagram conectado com sucesso!', 'success');
      }, 1500);
    }
  }

  updateNextButton() {
    const nextButton = document.getElementById('next-step5');
    const anyChannelConnected = Object.values(this.formData.channels).some(connected => connected);
    
    if (nextButton) {
      nextButton.disabled = !anyChannelConnected;
      nextButton.className = anyChannelConnected ? 'btn btn--primary btn--lg' : 'btn btn--secondary btn--lg';
    }
  }

  saveFormData() {
    // Save form data (in a real app, this would save to backend)
    this.formData.businessHoursMsg = document.getElementById('business-hours-msg')?.value || '';
    this.formData.afterHoursMsg = document.getElementById('after-hours-msg')?.value || '';
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.saveFormData();
        this.currentStep++;
        this.showStep(this.currentStep);
        this.updateProgressIndicator();
        this.updateSidebarState();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.saveFormData();
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateProgressIndicator();
      this.updateSidebarState();
    }
  }

  goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps && stepNumber <= this.currentStep) {
      this.saveFormData();
      this.currentStep = stepNumber;
      this.showStep(this.currentStep);
      this.updateProgressIndicator();
      this.updateSidebarState();
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
      case 4:
      case 5:
        return true; // These steps have no required validation
      default:
        return true;
    }
  }

  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(step => {
      step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');
    }
  }

  updateProgressIndicator() {
    const progressFill = document.getElementById('progress-fill');
    const currentStepElement = document.getElementById('current-step');
    const progressPercentage = (this.currentStep / this.totalSteps) * 100;
    
    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (currentStepElement) {
      currentStepElement.textContent = this.currentStep;
    }
  }

  updateSidebarState() {
    document.querySelectorAll('.step-item').forEach((item, index) => {
      const stepNumber = index + 1;
      
      // Remove all state classes
      item.classList.remove('active', 'completed');
      
      if (stepNumber === this.currentStep) {
        item.classList.add('active');
      } else if (stepNumber < this.currentStep) {
        item.classList.add('completed');
      }
    });
  }

  completeOnboarding() {
    this.saveFormData();
    
    // Hide step 5 and show completion
    document.getElementById('step-5').classList.remove('active');
    document.getElementById('step-complete').classList.add('active');
    
    // Update progress to 100%
    const progressFill = document.getElementById('progress-fill');
    const currentStepElement = document.getElementById('current-step');
    
    if (progressFill) {
      progressFill.style.width = '100%';
    }
    
    if (currentStepElement) {
      currentStepElement.textContent = this.totalSteps;
    }
    
    // Mark all steps as completed
    document.querySelectorAll('.step-item').forEach(item => {
      item.classList.remove('active');
      item.classList.add('completed');
    });

    console.log('Onboarding completed with data:', this.formData);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '1000',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease'
    });

    // Set background color based on type
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.onboardingApp = new OnboardingApp();
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    
    // If focused on a button, click it
    if (activeElement && activeElement.tagName === 'BUTTON' && !activeElement.disabled) {
      activeElement.click();
    }
  }
});
