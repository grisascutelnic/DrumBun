// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Verificăm dacă utilizatorul este autentificat
    checkAuthentication();
    
    // Initialize profile
    initializeProfile();
    
    // Load user data
    loadUserProfile();
    
    // Load user rides
    loadUserRides();
    
    // Setup event listeners
    setupEventListeners();
});

// Funcție pentru verificarea autentificării
function checkAuthentication() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return null;
            }
        })
        .then(user => {
            if (!user) {
                // Utilizatorul nu este autentificat, redirecționăm la logare
                // Salvăm URL-ul curent pentru a reveni după logare
                sessionStorage.setItem('redirectAfterLogin', '/profile');
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            // În caz de eroare, redirecționăm la logare
            sessionStorage.setItem('redirectAfterLogin', '/profile');
            window.location.href = '/login';
        });
}

function initializeProfile() {
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Add avatar hover effect
    const avatar = document.querySelector('.profile-avatar');
    if (avatar) {
        avatar.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        avatar.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

function addSmoothScrolling() {
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Quick actions
    setupOwnProfileMode();
    setupViewProfileMode();
}

function setupOwnProfileMode() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const addRideBtn = document.getElementById('add-ride-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addFirstRideBtn = document.getElementById('add-first-ride-btn');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            window.location.href = '/edit-profile';
        });
    }
    
    if (addRideBtn) {
        addRideBtn.addEventListener('click', function() {
            window.location.href = '/add-ride';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Ești sigur că vrei să te deconectezi?')) {
                window.location.href = '/logout';
            }
        });
    }
    
    if (addFirstRideBtn) {
        addFirstRideBtn.addEventListener('click', function() {
            window.location.href = '/add-ride';
        });
    }
}

function setupViewProfileMode() {
    const contactUserBtn = document.getElementById('contact-user-btn');
    const viewAllRidesBtn = document.getElementById('view-all-rides-btn');
    const reportUserBtn = document.getElementById('report-user-btn');
    
    if (contactUserBtn) {
        contactUserBtn.addEventListener('click', function() {
            // Implement contact functionality
            showNotification('Funcționalitatea de contact va fi implementată în curând!', 'info');
        });
    }
    
    if (viewAllRidesBtn) {
        viewAllRidesBtn.addEventListener('click', function() {
            // Show all rides in a modal or redirect
            showNotification('Vizualizarea tuturor călătoriilor va fi implementată în curând!', 'info');
        });
    }
    
    if (reportUserBtn) {
        reportUserBtn.addEventListener('click', function() {
            if (confirm('Ești sigur că vrei să raportezi acest utilizator?')) {
                showNotification('Raportul a fost trimis cu succes!', 'success');
            }
        });
    }
}

function loadUserProfile() {
    // Show loading state
    showLoadingState();
    
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('User not authenticated');
            }
        })
        .then(data => {
            hideLoadingState();
            displayUserInfo(data);
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
            hideLoadingState();
            showNotification('Eroare la încărcarea profilului!', 'error');
        });
}

function loadUserRides() {
    showRidesLoading();
    
    fetch('/api/rides/my-rides')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load rides');
            }
        })
        .then(data => {
            hideRidesLoading();
            displayUserRides(data);
            updateRideStats(data);
            updateAchievements(data);
        })
        .catch(error => {
            console.error('Error loading user rides:', error);
            hideRidesLoading();
            showNotification('Eroare la încărcarea călătoriilor!', 'error');
        });
}

function showLoadingState() {
    const profileElements = document.querySelectorAll('.profile-name, .profile-email, .stat-number, .info-item span');
    profileElements.forEach(element => {
        element.style.opacity = '0.5';
    });
}

function hideLoadingState() {
    const profileElements = document.querySelectorAll('.profile-name, .profile-email, .stat-number, .info-item span');
    profileElements.forEach(element => {
        element.style.opacity = '1';
    });
}

function showRidesLoading() {
    const ridesLoading = document.getElementById('rides-loading');
    const ridesList = document.getElementById('user-rides-list');
    const noRides = document.getElementById('no-rides');
    
    if (ridesLoading) ridesLoading.style.display = 'flex';
    if (ridesList) ridesList.style.display = 'none';
    if (noRides) noRides.style.display = 'none';
}

function hideRidesLoading() {
    const ridesLoading = document.getElementById('rides-loading');
    if (ridesLoading) ridesLoading.style.display = 'none';
}

function showNoRides() {
    const ridesList = document.getElementById('user-rides-list');
    const noRides = document.getElementById('no-rides');
    
    if (ridesList) ridesList.style.display = 'none';
    if (noRides) noRides.style.display = 'block';
}

function displayUserInfo(user) {
    // Update profile image
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
    
    // Update user information with smooth transitions
    animateTextChange('user-name', `${user.firstName} ${user.lastName}`);
    animateTextChange('user-email', user.email);
    animateTextChange('full-name', `${user.firstName} ${user.lastName}`);
    animateTextChange('email', user.email);
    animateTextChange('phone', user.phone || 'Nu specificat');
    animateTextChange('created-at', formatDate(user.createdAt));
    
    // Update user status
    const userStatus = document.getElementById('user-status');
    if (userStatus) {
        userStatus.textContent = 'Activ';
        userStatus.style.color = '#10b981';
    }
    
    // Update member since
    animateTextChange('member-since-header', formatDate(user.createdAt));
    
    // Update rating (mock data for now)
    animateTextChange('rating-header', '5.0');
    
    // Show appropriate sections based on profile type
    document.getElementById('quick-actions-section').style.display = 'block';
    document.getElementById('view-profile-actions-section').style.display = 'none';
    document.getElementById('rides-section-title').textContent = 'Călătoriile mele';
}

function animateTextChange(elementId, newText) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.opacity = '0';
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = '1';
    }, 150);
}

function displayUserRides(rides) {
    const ridesList = document.getElementById('user-rides-list');
    const noRides = document.getElementById('no-rides');
    const noRidesTitle = document.getElementById('no-rides-title');
    const noRidesDescription = document.getElementById('no-rides-description');
    const addFirstRideBtn = document.getElementById('add-first-ride-btn');
    
    if (!rides || rides.length === 0) {
        showNoRides();
        if (noRidesTitle) noRidesTitle.textContent = 'Nu ai încă călătorii';
        if (noRidesDescription) noRidesDescription.textContent = 'Începe să creezi călătorii pentru a le vedea aici';
        if (addFirstRideBtn) addFirstRideBtn.style.display = 'inline-flex';
        return;
    }
    
    ridesList.innerHTML = '';
    ridesList.style.display = 'flex';
    noRides.style.display = 'none';
    
    rides.forEach((ride, index) => {
        const rideElement = createRideElement(ride);
        rideElement.style.opacity = '0';
        rideElement.style.transform = 'translateY(10px)';
        ridesList.appendChild(rideElement);
        
        // Animate in
        setTimeout(() => {
            rideElement.style.transition = 'all 0.3s ease';
            rideElement.style.opacity = '1';
            rideElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createRideElement(ride) {
    const rideElement = document.createElement('div');
    rideElement.className = 'user-ride-item';
    
    const statusClass = ride.isActive ? 'active' : 'completed';
    const statusText = ride.isActive ? 'Activă' : 'Completată';
    
    // Format date and time
    const travelDate = new Date(ride.travelDate);
    const formattedDate = travelDate.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const departureTime = new Date(ride.departureTime);
    const formattedTime = departureTime.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    rideElement.innerHTML = `
        <div class="user-ride-header">
            <div class="user-ride-route">
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.fromLocation}</span>
                </div>
                <div class="route-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.toLocation}</span>
                </div>
            </div>
            <div class="user-ride-status ${statusClass}">${statusText}</div>
        </div>
        <div class="user-ride-details">
            <div class="user-ride-detail">
                <i class="fas fa-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-clock"></i>
                <span>${formattedTime}</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-users"></i>
                <span>${ride.availableSeats} locuri</span>
            </div>
            <div class="user-ride-detail">
                <i class="fas fa-money-bill"></i>
                                        <span class="user-ride-price">${ride.price} MDL</span>
            </div>
        </div>
        ${ride.description ? `<div class="ride-description">${ride.description}</div>` : ''}
        <div class="user-ride-actions">
            <button class="btn btn-primary btn-small" onclick="viewRide(${ride.id})">
                <i class="fas fa-eye"></i>
                Vezi detalii
            </button>
            ${ride.isActive ? `
                <button class="btn btn-secondary btn-small" onclick="editRide(${ride.id})">
                    <i class="fas fa-edit"></i>
                    Editează
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteRide(${ride.id})">
                    <i class="fas fa-trash"></i>
                    Șterge
                </button>
            ` : ''}
        </div>
    `;
    
    return rideElement;
}

function updateRideStats(rides) {
    const totalRides = rides.length;
    const completedRides = rides.filter(ride => !ride.isActive).length;
    
    animateStatChange('total-rides-header', totalRides);
    animateStatChange('completed-rides-header', completedRides);
}

function animateStatChange(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const increment = (newValue - currentValue) / 20;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
            element.textContent = newValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 50);
}

function updateAchievements(rides = []) {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;

    const totalRides = rides.length;
    const completedRides = rides.filter(ride => !ride.isActive).length;

    // Update achievements based on user activity
    const achievements = [];

    if (totalRides > 0) {
        achievements.push({
            icon: 'fas fa-star',
            color: '#fbbf24',
            text: 'Prima cursă'
        });
    }

    if (completedRides >= 5) {
        achievements.push({
            icon: 'fas fa-users',
            color: '#10b981',
            text: '5 călători completate'
        });
    }

    if (completedRides >= 10) {
        achievements.push({
            icon: 'fas fa-trophy',
            color: '#059669',
            text: '10 călători completate'
        });
    }

    // Animate achievements
    achievementsList.innerHTML = '';
    achievements.forEach((achievement, index) => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement-item';
        achievementElement.style.opacity = '0';
        achievementElement.style.transform = 'scale(0.8)';

        achievementElement.innerHTML = `
            <i class="${achievement.icon}" style="color: ${achievement.color};"></i>
            <span>${achievement.text}</span>
        `;

        achievementsList.appendChild(achievementElement);

        setTimeout(() => {
            achievementElement.style.transition = 'all 0.3s ease';
            achievementElement.style.opacity = '1';
            achievementElement.style.transform = 'scale(1)';
        }, index * 200);
    });
}

function switchTab(tabType) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    
    // Filter rides
    const rideItems = document.querySelectorAll('.user-ride-item');
    const noRides = document.getElementById('no-rides');
    const noRidesTitle = document.getElementById('no-rides-title');
    const noRidesDescription = document.getElementById('no-rides-description');
    
    let visibleRides = 0;
    
    rideItems.forEach(ride => {
        const isActive = ride.querySelector('.user-ride-status').classList.contains('active');
        const shouldShow = (tabType === 'active' && isActive) || (tabType === 'completed' && !isActive);
        
        if (shouldShow) {
            ride.style.display = 'block';
            visibleRides++;
        } else {
            ride.style.display = 'none';
        }
    });
    
    // Show/hide no rides message
    if (visibleRides === 0) {
        noRides.style.display = 'block';
        if (tabType === 'active') {
            noRidesTitle.textContent = 'Nu ai curse active';
            noRidesDescription.textContent = 'Creează o cursă pentru a o vedea aici';
        } else {
            noRidesTitle.textContent = 'Nu ai curse completate';
            noRidesDescription.textContent = 'Cursele completate vor apărea aici';
        }
    } else {
        noRides.style.display = 'none';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Nu specificat';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-size: 0.9rem;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `
        ${message}
        <button class="notification-close" style="
            background: none;
            border: none;
            color: white;
            margin-left: 1rem;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.8;
        " onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Ride action functions
function viewRide(rideId) {
    window.location.href = `/ride/${rideId}`;
}

function editRide(rideId) {
    window.location.href = `/edit-ride/${rideId}`;
}

function deleteRide(rideId) {
    if (confirm('Ești sigur că vrei să ștergi această cursă?')) {
        fetch(`/api/rides/${rideId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                showNotification('Cursa a fost ștearsă cu succes!', 'success');
                loadUserRides(); // Reload rides
            } else {
                showNotification('Eroare la ștergerea cursei!', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting ride:', error);
            showNotification('Eroare la ștergerea cursei!', 'error');
        });
    }
}
