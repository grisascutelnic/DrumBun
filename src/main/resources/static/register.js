document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value;
            const profileImage = document.getElementById('profile-image').files[0];
            
            // Basic validation
            if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
                showNotification('Toate câmpurile sunt obligatorii', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Parolele nu se potrivesc', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Parola trebuie să aibă cel puțin 6 caractere', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('register-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se înregistrează...';
            submitBtn.disabled = true;
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('phone', phone);
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }
            
            // Make API call
            fetch('/api/auth/register', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    // Update navbar for logged in user
                    if (typeof checkAuthStatus === 'function') {
                        checkAuthStatus();
                    }
                    
                    // Check for redirectAfterLogin in sessionStorage
                    const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
                    
                    // Redirect to home page after successful registration
                    setTimeout(() => {
                        if (redirectAfterLogin) {
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
