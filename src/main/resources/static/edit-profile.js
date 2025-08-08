document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUserData();
    initializeImageUpload();
    initializeFormValidation();
});

function loadCurrentUserData() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                window.location.href = '/login';
                return null;
            }
        })
        .then(user => {
            if (user) {
                populateFormWithUserData(user);
            }
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            showNotification('Eroare la încărcarea datelor utilizatorului', 'error');
        });
}

function populateFormWithUserData(user) {
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    
    // Handle profile image
    const currentProfileImage = document.getElementById('current-profile-image');
    const currentDefaultAvatar = document.getElementById('current-default-avatar');
    
    if (user.profileImage) {
        currentProfileImage.src = `/uploads/profile-images/${user.profileImage}`;
        currentProfileImage.style.display = 'block';
        currentDefaultAvatar.style.display = 'none';
        
        // Show remove image button
        document.getElementById('remove-image-btn').style.display = 'inline-flex';
    } else {
        currentProfileImage.style.display = 'none';
        currentDefaultAvatar.style.display = 'block';
    }
}

function initializeImageUpload() {
    const imageInput = document.getElementById('profile-image-input');
    const currentProfileImage = document.getElementById('current-profile-image');
    const currentDefaultAvatar = document.getElementById('current-default-avatar');
    const removeImageBtn = document.getElementById('remove-image-btn');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Te rog selectează doar fișiere imagine', 'error');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Imaginea este prea mare. Dimensiunea maximă este 5MB', 'error');
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                currentProfileImage.src = e.target.result;
                currentProfileImage.style.display = 'block';
                currentDefaultAvatar.style.display = 'none';
                removeImageBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }
    });
    
    removeImageBtn.addEventListener('click', function() {
        imageInput.value = '';
        currentProfileImage.style.display = 'none';
        currentDefaultAvatar.style.display = 'block';
        removeImageBtn.style.display = 'none';
    });
}

function initializeFormValidation() {
    const form = document.getElementById('edit-profile-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
}

function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const currentPassword = document.getElementById('currentPassword').value;
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
        showNotification('Te rog completează toate câmpurile obligatorii', 'error');
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Te rog introdu o adresă de email validă', 'error');
        return false;
    }
    
    // Validate password change
    if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
            showNotification('Te rog introdu parola actuală pentru a schimba parola', 'error');
            return false;
        }
        
        if (!newPassword) {
            showNotification('Te rog introdu parola nouă', 'error');
            return false;
        }
        
        if (newPassword.length < 6) {
            showNotification('Parola nouă trebuie să aibă cel puțin 6 caractere', 'error');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Parolele nu se potrivesc', 'error');
            return false;
        }
    }
    
    return true;
}

function submitForm() {
    const form = document.getElementById('edit-profile-form');
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';
    submitBtn.disabled = true;
    
    fetch('/api/users/update-profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Profilul a fost actualizat cu succes!', 'success');
            setTimeout(() => {
                window.location.href = '/profile';
            }, 1500);
        } else {
            showNotification(data.message || 'Eroare la actualizarea profilului', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showNotification('A apărut o eroare la actualizarea profilului', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content ${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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
