document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserRides();
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // TODO: Implement edit profile functionality
            showNotification('Funcționalitatea de editare va fi implementată în curând', 'info');
        });
    }
    
    // Add ride button
    const addRideBtn = document.getElementById('add-ride-btn');
    if (addRideBtn) {
        addRideBtn.addEventListener('click', function() {
            window.location.href = '/add-ride';
        });
    }
    
    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
});

function loadUserProfile() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                // User not logged in, redirect to login
                window.location.href = '/login';
                return null;
            }
        })
        .then(user => {
            if (user) {
                displayUserInfo(user);
            }
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
            showNotification('Eroare la încărcarea profilului', 'error');
        });
}

function displayUserInfo(user) {
    // Display user information in header
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-email').textContent = user.email;
    
    // Display user information in sidebar
    document.getElementById('full-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('email').textContent = user.email;
    document.getElementById('phone').textContent = user.phone;
    
    // Handle profile image
    const profileImage = document.getElementById('profile-image');
    const defaultAvatar = document.getElementById('default-avatar');
    
    if (user.profileImage) {
        profileImage.src = `/uploads/profile-images/${user.profileImage}`;
        profileImage.style.display = 'block';
        defaultAvatar.style.display = 'none';
    } else {
        profileImage.style.display = 'none';
        defaultAvatar.style.display = 'block';
    }
    
    // Format and display creation date
    if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = createdDate.toLocaleDateString('ro-RO', options);
        document.getElementById('created-at').textContent = formattedDate;
        document.getElementById('member-since-header').textContent = createdDate.getFullYear();
    }
}

function loadUserRides() {
    const ridesLoading = document.getElementById('rides-loading');
    const ridesList = document.getElementById('user-rides-list');
    const noRides = document.getElementById('no-rides');
    
    ridesLoading.style.display = 'block';
    ridesList.style.display = 'none';
    noRides.style.display = 'none';
    
    fetch('/api/rides/my-rides')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load rides');
            }
        })
        .then(data => {
            ridesLoading.style.display = 'none';
            
            if (data && data.length > 0) {
                displayUserRides(data);
                updateRideStats(data);
            } else {
                noRides.style.display = 'block';
                updateRideStats([]);
            }
        })
        .catch(error => {
            console.error('Error loading user rides:', error);
            ridesLoading.style.display = 'none';
            noRides.style.display = 'block';
            showNotification('Eroare la încărcarea călătoriilor', 'error');
        });
}

function displayUserRides(rides) {
    const ridesList = document.getElementById('user-rides-list');
    ridesList.innerHTML = '';
    
    rides.forEach(ride => {
        const rideElement = createRideElement(ride);
        ridesList.appendChild(rideElement);
    });
    
    ridesList.style.display = 'block';
}

function createRideElement(ride) {
    const rideDiv = document.createElement('div');
    rideDiv.className = 'user-ride-item';
    
    const isActive = ride.isActive;
    const statusClass = isActive ? 'active' : 'completed';
    const statusText = isActive ? 'Activă' : 'Completată';
    
    const travelDate = new Date(ride.travelDate);
    const formattedDate = travelDate.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    rideDiv.innerHTML = `
        <div class="user-ride-header">
            <div class="user-ride-route">
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.fromLocation}</span>
                </div>
                <i class="fas fa-arrow-right route-arrow"></i>
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.toLocation}</span>
                </div>
            </div>
            <span class="user-ride-status ${statusClass}">${statusText}</span>
        </div>
        <div class="user-ride-details">
            <div class="user-ride-detail">
                <i class="fas fa-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-clock"></i>
                <span>${ride.departureTime}</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-users"></i>
                <span>${ride.availableSeats} locuri</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-euro-sign"></i>
                <span class="user-ride-price">${ride.price} €</span>
            </div>
        </div>
        ${ride.description ? `<p class="ride-description">${ride.description}</p>` : ''}
        <div class="user-ride-actions">
            <button class="btn btn-secondary btn-small" onclick="editRide(${ride.id})">
                <i class="fas fa-edit"></i>
                Editează
            </button>
            <button class="btn btn-outline btn-small" onclick="viewRideDetails(${ride.id})">
                <i class="fas fa-eye"></i>
                Detalii
            </button>
        </div>
    `;
    
    return rideDiv;
}

function updateRideStats(rides) {
    const totalRides = rides.length;
    const activeRides = rides.filter(ride => ride.isActive).length;
    const completedRides = totalRides - activeRides;
    
    document.getElementById('total-rides-header').textContent = totalRides;
    document.getElementById('completed-rides-header').textContent = completedRides;
}

function switchTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // TODO: Implement filtering based on tab
    // For now, we'll just reload all rides
    loadUserRides();
}

function editRide(rideId) {
    // TODO: Implement edit ride functionality
    showNotification('Funcționalitatea de editare a cursei va fi implementată în curând', 'info');
}

function viewRideDetails(rideId) {
    // TODO: Implement view ride details functionality
    showNotification('Funcționalitatea de vizualizare detalii va fi implementată în curând', 'info');
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Deconectare reușită', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showNotification('Eroare la deconectare', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('A apărut o eroare la deconectare', 'error');
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
