class OnboardingApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            companyName: '',
            description: '',
            logo: null,
            themeColor: '',
            country: '',
            timezone: '',
            dateFormat: '',
            language: '',
            businessDays: [],
            businessHoursMsg: '',
            afterHoursMsg: '',
            teamSetupChoice: '',
            channels: {}
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressIndicator();
        this.updateSidebarState();
        this.initializeChannelStates();
    }

    setupEventListeners() {
        // Step 1 - Company Setup
        document.getElementById('company-name').addEventListener('input', () => this.validateStep1());
        document.getElementById('company-description').addEventListener('input', () => this.saveFormData());
        document.getElementById('continue-step1').addEventListener('click', () => this.nextStep());
        
        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });

        // Logo upload area
        document.querySelector('.logo-upload-area').addEventListener('click', () => this.handleLogoUpload());

        // Step 2 - Business Preferences
        document.getElementById('country').addEventListener('change', () => this.validateStep2());
        document.getElementById('timezone').addEventListener('change', () => this.validateStep2());
        document.getElementById('date-format').addEventListener('change', () => this.validateStep2());
        document.getElementById('language').addEventListener('change', () => this.validateStep2());
        document.getElementById('back-step2').addEventListener('click', () => this.prevStep());
        document.getElementById('continue-step2').addEventListener('click', () => this.nextStep());

        // Step 3 - Business Hours
        document.querySelectorAll('.day-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateBusinessDays());
        });
        document.getElementById('business-hours-msg').addEventListener('input', () => this.saveFormData());
        document.getElementById('after-hours-msg').addEventListener('input', () => this.saveFormData());
        document.getElementById('back-step3').addEventListener('click', () => this.prevStep());
        document.getElementById('continue-step3').addEventListener('click', () => this.nextStep());

        // Step 4 - Create Team
        document.querySelectorAll('.team-action-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectTeamAction(e.currentTarget.dataset.action));
        });
        document.getElementById('back-step4').addEventListener('click', () => this.prevStep());
        document.getElementById('skip-step4').addEventListener('click', () => this.nextStep());
        document.getElementById('continue-step4').addEventListener('click', () => this.nextStep());

        // Step 5 - Channel Integration
        document.querySelectorAll('.channel-item input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.toggleChannel(e.target.dataset.platform, e.target.checked));
        });
        document.querySelector('.connect-btn').addEventListener('click', (e) => this.connectEmail(e));
        document.getElementById('back-step5').addEventListener('click', () => this.prevStep());
        document.getElementById('next-step5').addEventListener('click', () => this.completeOnboarding());

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
        this.formData.description = document.getElementById('company-description').value.trim();
        
        const isValid = companyName !== '' && themeColor !== '';
        document.getElementById('continue-step1').disabled = !isValid;
        
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
        document.getElementById('continue-step2').disabled = !isValid;
        
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
        this.validateStep1();
    }

    handleLogoUpload() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.formData.logo = file;
                // Update the upload placeholder to show file name
                const placeholder = document.querySelector('.upload-placeholder p');
                placeholder.textContent = `Arquivo selecionado: ${file.name}`;
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    updateBusinessDays() {
        const selectedDays = [];
        document.querySelectorAll('.day-checkbox:checked').forEach(checkbox => {
            selectedDays.push(checkbox.dataset.day);
        });
        this.formData.businessDays = selectedDays;
    }

    selectTeamAction(action) {
        // Remove previous selection
        document.querySelectorAll('.team-action-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        document.querySelector(`[data-action="${action}"]`).classList.add('selected');
        
        this.formData.teamSetupChoice = action;
        document.getElementById('continue-step4').disabled = false;
    }

    initializeChannelStates() {
        const channels = {
            facebook: true,
            instagram: true,
            whatsapp: true,
            messenger: false,
            email: false
        };
        
        this.formData.channels = channels;
        
        // Set initial toggle states
        Object.entries(channels).forEach(([platform, connected]) => {
            const toggle = document.querySelector(`input[data-platform="${platform}"]`);
            if (toggle) {
                toggle.checked = connected;
            }
        });
    }

    toggleChannel(platform, enabled) {
        this.formData.channels[platform] = enabled;
        
        // Update status text
        const channelItem = document.querySelector(`[data-platform="${platform}"]`);
        const statusElement = channelItem.querySelector('.status');
        
        if (platform === 'email' && enabled) {
            // For email, we need to handle connection differently
            return;
        }
        
        if (statusElement) {
            statusElement.textContent = enabled ? 'Conectado' : 'Desconectado';
            statusElement.className = enabled ? 'status connected' : 'status disconnected';
        }
    }

    connectEmail(e) {
        e.preventDefault();
        
        // Simulate email connection
        const button = e.target;
        button.textContent = 'Conectando...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Conectado';
            button.style.background = 'var(--color-success)';
            
            // Update toggle state
            const toggle = document.querySelector('input[data-platform="email"]');
            toggle.checked = true;
            this.formData.channels.email = true;
            
            // Update status
            const statusElement = document.createElement('span');
            statusElement.className = 'status connected';
            statusElement.textContent = 'Conectado';
            button.parentNode.replaceChild(statusElement, button);
        }, 1500);
    }

    saveFormData() {
        // In a real application, this would save to a backend
        // For now, we'll just update the form data object
        this.formData.description = document.getElementById('company-description').value.trim();
        this.formData.businessHoursMsg = document.getElementById('business-hours-msg').value.trim();
        this.formData.afterHoursMsg = document.getElementById('after-hours-msg').value.trim();
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step before proceeding
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
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
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
                return true; // Step 3 has no required fields
            case 4:
                return true; // Step 4 can be skipped
            case 5:
                return true; // Step 5 has no required fields
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
        document.getElementById(`step-${stepNumber}`).classList.add('active');
    }

    updateProgressIndicator() {
        const progressFill = document.getElementById('progress-fill');
        const currentStepElement = document.getElementById('current-step');
        
        const progressPercentage = (this.currentStep / 6) * 100; // 6 because we show "Step X of 6"
        progressFill.style.width = `${progressPercentage}%`;
        currentStepElement.textContent = this.currentStep;
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
        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('current-step').textContent = '6';
        
        // Mark all steps as completed
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active');
            item.classList.add('completed');
        });
        
        console.log('Onboarding completed with data:', this.formData);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OnboardingApp();
});

// Additional utility functions for enhanced UX
function showNotification(message, type = 'info') {
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

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

// Animation helpers for smooth transitions
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        // If focused on a button, click it
        if (activeElement && activeElement.tagName === 'BUTTON' && !activeElement.disabled) {
            activeElement.click();
        }
        
        // If focused on a form field in step 1 or 2, try to continue
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
            const stepContent = activeElement.closest('.step-content');
            if (stepContent) {
                const continueButton = stepContent.querySelector('.btn--primary:not(:disabled)');
                if (continueButton) {
                    continueButton.click();
                }
            }
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.step) {
        const app = window.onboardingApp;
        if (app) {
            app.goToStep(e.state.step);
        }
    }
});

// Add step history to browser history
function updateBrowserHistory(step) {
    const url = new URL(window.location);
    url.searchParams.set('step', step);
    history.pushState({ step }, `Step ${step}`, url);
}

// Auto-save functionality (simulated)
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        // In a real application, this would save to a backend
        console.log('Auto-saving form data...');
    }, 2000);
}

// Add auto-save to all form inputs
document.addEventListener('input', autoSave);
document.addEventListener('change', autoSave);