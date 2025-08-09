document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                showNotification('Toate câmpurile sunt obligatorii', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('login-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se conectează...';
            submitBtn.disabled = true;
            
            // Make API call
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    // Update navbar for logged in user
                    if (typeof checkAuthStatus === 'function') {
                        checkAuthStatus();
                    }
                    
                    // Check for redirect parameter and sessionStorage
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectTo = urlParams.get('redirect');
                    const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
                    
                    // Redirect after successful login
                    setTimeout(() => {
                        if (redirectTo) {
                            window.location.href = redirectTo;
                        } else if (redirectAfterLogin) {
                            // Clear the stored redirect and redirect to the stored URL
                            sessionStorage.removeItem('redirectAfterLogin');
                            window.location.href = redirectAfterLogin;
                        } else {
                            window.location.href = '/';
                        }
                    }, 1500);
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('A apărut o eroare. Încearcă din nou.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content ${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}
