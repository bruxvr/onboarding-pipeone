/**
 * Smart Tooltip System - Interactive Icons
 * Handles click animations and interactions for icon system
 */

// Get all icon elements
const icons = document.querySelectorAll('.icon');

// Add click event listeners to each icon
icons.forEach(icon => {
  icon.addEventListener('click', handleIconClick);
});

/**
 * Handle icon click event
 * Adds visual feedback and performs action based on icon type
 * @param {Event} event - The click event
 */
function handleIconClick(event) {
  const icon = event.currentTarget;
  const iconWrapper = icon.closest('.icon-wrapper');
  const tooltipId = iconWrapper.getAttribute('data-tooltip-id');
  
  // Add visual feedback (clicked animation)
  icon.classList.add('clicked');
  
  // Remove the clicked class after animation completes
  setTimeout(() => {
    icon.classList.remove('clicked');
  }, 300);
  
  // Log the action (can be replaced with actual functionality)
  console.log(`Action triggered: ${tooltipId}`);
  
  // Specific actions based on icon type
  switch(tooltipId) {
    case 'unread':
      // Mark as unread functionality
      showActionFeedback('Conversation marked as unread');
      break;
    case 'spam':
      // Mark as spam functionality
      showActionFeedback('Conversation blocked');
      break;
    case 'forward':
      // Forward conversation functionality
      showActionFeedback('Conversation ready to be assigned');
      break;
    case 'status':
      // Change status functionality
      showActionFeedback('You are now the correspondent');
      break;
    case 'resolved':
      // Mark as resolved functionality
      showActionFeedback('Chat ended');
      break;
    default:
      // Default action
      console.log('Unknown action');
  }
}

/**
 * Shows temporary feedback message for user actions
 * Can be extended to show a toast notification in a future update
 * @param {string} message - The feedback message to show
 */
function showActionFeedback(message) {
  // For now just log to console
  // This could be expanded to show an actual visual notification
  console.log(`Action performed: ${message}`);
}

/**
 * Initialize the tooltip system
 * Sets up any initial states or configurations
 */
function initTooltipSystem() {
  console.log('Smart Tooltip System initialized');
  
  // Add any initialization code here
  document.addEventListener('keydown', (event) => {
    // Example: Pressing ESC closes all tooltips
    if (event.key === 'Escape') {
      // Could be used to close any open modal or expanded state
      console.log('Escape key pressed');
    }
  });
}

// Initialize the tooltip system when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initTooltipSystem);