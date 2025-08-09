// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Verificăm dacă utilizatorul este autentificat
    checkAuthentication();
    
    // Initialize profile
    initializeProfile();
    
    // Load user data
    loadUserProfile();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize rating system
    initializeRatingSystem();
});

// Funcție pentru verificarea autentificării
function checkAuthentication() {
    // Verificăm dacă suntem pe o rută de profil specific
    const pathSegments = window.location.pathname.split('/');
    const targetUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    // Dacă suntem pe profilul propriu, verificăm autentificarea
    if (!targetUserId || targetUserId === 'edit-profile') {
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
                    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error('Error checking auth status:', error);
                // În caz de eroare, redirecționăm la logare
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = '/login';
            });
    }
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
    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            window.location.href = '/edit-profile';
        });
    }

    // Add ride button
    const addRideBtn = document.getElementById('add-ride-btn');
    if (addRideBtn) {
        addRideBtn.addEventListener('click', () => {
            window.location.href = '/add-ride';
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                });
        });
    }

    // Rating form submission
    const ratingFormElement = document.getElementById('rating-form-element');
    if (ratingFormElement) {
        ratingFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRating();
        });
    }





    // Contact user button
    const contactUserBtn = document.getElementById('contact-user-btn');
    if (contactUserBtn) {
        contactUserBtn.addEventListener('click', () => {
            showNotification('Funcționalitatea de contact va fi implementată în curând!', 'info');
        });
    }

    // View all rides button
    const viewAllRidesBtn = document.getElementById('view-all-rides-btn');
    if (viewAllRidesBtn) {
        viewAllRidesBtn.addEventListener('click', () => {
            // Scroll to rides section
            document.getElementById('user-rides-container').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Report user button
    const reportUserBtn = document.getElementById('report-user-btn');
    if (reportUserBtn) {
        reportUserBtn.addEventListener('click', () => {
            showNotification('Funcționalitatea de raportare va fi implementată în curând!', 'info');
        });
    }
}

function setupOwnProfileMode() {
    console.log('👤 Setting up own profile mode');
    
    // Show own profile sections
    const quickActionsSection = document.getElementById('quick-actions-section');
    const viewProfileActionsSection = document.getElementById('view-profile-actions-section');
    const ratingSection = document.getElementById('rating-section');
    
    if (quickActionsSection) quickActionsSection.style.display = 'block';
    if (viewProfileActionsSection) viewProfileActionsSection.style.display = 'none';
    if (ratingSection) ratingSection.style.display = 'none';
    
    // Setup tab switching for own profile
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    console.log('✅ Own profile mode configured');
}

function setupViewProfileMode() {
    console.log('👥 Setting up view profile mode');
    
    // Show view profile sections
    const quickActionsSection = document.getElementById('quick-actions-section');
    const viewProfileActionsSection = document.getElementById('view-profile-actions-section');
    const ratingSection = document.getElementById('rating-section');
    
    if (quickActionsSection) quickActionsSection.style.display = 'none';
    if (viewProfileActionsSection) viewProfileActionsSection.style.display = 'block';
    if (ratingSection) ratingSection.style.display = 'block';
    
    // Setup tab switching for view profile
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    console.log('✅ View profile mode configured');
}

function loadUserProfile() {
    console.log('🔍 loadUserProfile called');
    // Show loading state
    showLoadingState();
    
    // Verificăm dacă suntem pe o rută de profil specific
    const pathSegments = window.location.pathname.split('/');
    const targetUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    console.log('📍 Current path:', window.location.pathname);
    console.log('🔢 Path segments:', pathSegments);
    console.log('👤 Target User ID:', targetUserId);
    
    if (targetUserId && targetUserId !== 'edit-profile') {
        console.log('✅ Loading specific user profile for ID:', targetUserId);
        // Încărcăm profilul unui utilizator specific
        loadSpecificUserProfile(targetUserId);
    } else {
        console.log('👤 Loading current user profile');
        // Încărcăm profilul utilizatorului logat
        loadCurrentUserProfile();
    }
}

function loadSpecificUserProfile(userId) {
    console.log('🔍 loadSpecificUserProfile called with userId:', userId);
    
    fetch(`/api/users/${userId}`)
        .then(response => {
            console.log('📡 API response status:', response.status);
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('User not found');
            }
        })
        .then(user => {
            console.log('👤 User data received:', user);
            hideLoadingState();
            displayUserInfo(user, false); // false = nu este profilul propriu
            loadSpecificUserRides(userId);
            setupViewProfileMode(); // Activăm modul de vizualizare
            loadUserRatingData(userId); // Load rating data
        })
        .catch(error => {
            console.error('❌ Error loading specific user profile:', error);
            hideLoadingState();
            showNotification('Utilizatorul nu a fost găsit!', 'error');
            // Redirecționăm la profilul propriu
            window.location.href = '/profile';
        });
}

function loadCurrentUserProfile() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('User not authenticated');
            }
        })
        .then(user => {
            hideLoadingState();
            displayUserInfo(user, true); // true = este profilul propriu
            loadUserRides();
            setupOwnProfileMode(); // Activăm modul propriu
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
            hideLoadingState();
            showNotification('Eroare la încărcarea profilului!', 'error');
        });
}

function loadSpecificUserRides(userId) {
    showRidesLoading();
    
    // Încărcăm cursele utilizatorului specific
    fetch(`/api/rides/user/${userId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load user rides');
            }
        })
        .then(data => {
            hideRidesLoading();
            displayUserRides(data, false); // false = nu sunt cursele proprii
            updateRideStats(data);
            updateAchievements(data);
        })
        .catch(error => {
            console.error('Error loading specific user rides:', error);
            hideRidesLoading();
            showNotification('Eroare la încărcarea călătoriilor utilizatorului!', 'error');
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
            displayUserRides(data, true); // true = sunt cursele proprii
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

function displayUserInfo(user, isOwnProfile) {
    console.log('🔍 displayUserInfo called with user:', user, 'isOwnProfile:', isOwnProfile);
    
    try {
        // Update profile image
        const profileImage = document.getElementById('profile-image');
        const defaultAvatar = document.getElementById('default-avatar');
        
        console.log('🖼️ Profile image elements:', { profileImage, defaultAvatar });
        
        if (user.profileImage) {
            profileImage.src = `/uploads/profile-images/${user.profileImage}`;
            profileImage.style.display = 'block';
            defaultAvatar.style.display = 'none';
        } else {
            profileImage.style.display = 'none';
            defaultAvatar.style.display = 'block';
        }
        
        console.log('✅ Profile image updated');
        
        // Update user information with smooth transitions
        animateTextChange('user-name', `${user.firstName} ${user.lastName}`);
        animateTextChange('user-email', user.email);
        animateTextChange('full-name', `${user.firstName} ${user.lastName}`);
        animateTextChange('email', user.email);
        animateTextChange('phone', user.phone || 'Nu specificat');
        animateTextChange('created-at', formatDate(user.createdAt));
        
        console.log('✅ User info updated');
        
        // Update user status
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            userStatus.textContent = 'Activ';
            userStatus.style.color = '#10b981';
        }
        
        // Update member since
        animateTextChange('member-since-header', formatDate(user.createdAt));
        
        // Update rating from user data - only for display purposes
        // The actual rating data will be loaded separately by loadUserRatingData
        if (user.averageRating !== null && user.averageRating !== undefined && user.averageRating > 0) {
            animateTextChange('rating-header', user.averageRating.toFixed(1));
        } else {
            animateTextChange('rating-header', '0.0');
        }
        
        console.log('✅ Rating updated');
        
        // Show appropriate sections based on profile type
        if (isOwnProfile) {
            console.log('👤 Setting up own profile mode');
            const quickActionsSection = document.getElementById('quick-actions-section');
            const viewProfileActionsSection = document.getElementById('view-profile-actions-section');
            const ratingSection = document.getElementById('rating-section');
            const ridesSectionTitle = document.getElementById('rides-section-title');
            
            console.log('🔍 Found elements:', { quickActionsSection, viewProfileActionsSection, ratingSection, ridesSectionTitle });
            
            if (quickActionsSection) quickActionsSection.style.display = 'block';
            if (viewProfileActionsSection) viewProfileActionsSection.style.display = 'none';
            if (ratingSection) ratingSection.style.display = 'none';
            if (ridesSectionTitle) ridesSectionTitle.textContent = 'Călătoriile mele';
        } else {
            console.log('👥 Setting up view profile mode');
            const quickActionsSection = document.getElementById('quick-actions-section');
            const viewProfileActionsSection = document.getElementById('view-profile-actions-section');
            const ratingSection = document.getElementById('rating-section');
            const ridesSectionTitle = document.getElementById('rides-section-title');
            
            console.log('🔍 Found elements:', { quickActionsSection, viewProfileActionsSection, ratingSection, ridesSectionTitle });
            
            if (quickActionsSection) quickActionsSection.style.display = 'none';
            if (viewProfileActionsSection) viewProfileActionsSection.style.display = 'block';
            if (ratingSection) ratingSection.style.display = 'block';
            if (ridesSectionTitle) ridesSectionTitle.textContent = 'Călătoriile acestui utilizator';
        }
        
        console.log('✅ Profile sections configured');
        
    } catch (error) {
        console.error('❌ Error in displayUserInfo:', error);
        showNotification('Eroare la afișarea informațiilor utilizatorului!', 'error');
    }
}

function animateTextChange(elementId, newText) {
    console.log('🔤 animateTextChange called for elementId:', elementId, 'with text:', newText);
    
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ Element not found:', elementId);
        return;
    }
    
    console.log('✅ Element found:', element);
    
    element.style.opacity = '0';
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = '1';
        console.log('✅ Text updated for:', elementId);
    }, 150);
}

function displayUserRides(rides, isOwnRides) {
    const ridesList = document.getElementById('user-rides-list');
    const noRides = document.getElementById('no-rides');
    const noRidesTitle = document.getElementById('no-rides-title');
    const noRidesDescription = document.getElementById('no-rides-description');
    const addFirstRideBtn = document.getElementById('add-first-ride-btn');
    
    if (!rides || rides.length === 0) {
        showNoRides();
        if (noRidesTitle) {
            noRidesTitle.textContent = isOwnRides ? 'Nu ai încă călătorii' : 'Nu are încă călătorii';
        }
        if (noRidesDescription) {
            noRidesDescription.textContent = isOwnRides ? 'Începe să creezi călătorii pentru a le vedea aici' : 'Acest utilizator nu a creat încă nicio călătorie';
        }
        if (addFirstRideBtn) {
            addFirstRideBtn.style.display = isOwnRides ? 'inline-flex' : 'none';
        }
        return;
    }
    
    ridesList.innerHTML = '';
    ridesList.style.display = 'flex';
    noRides.style.display = 'none';
    
    rides.forEach((ride, index) => {
        const rideElement = createRideElement(ride, isOwnRides);
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

function createRideElement(ride, isOwnRides) {
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
            ${ride.isActive && isOwnRides ? `
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
        
        // Verificăm dacă suntem pe profilul propriu sau al altui utilizator
        const pathSegments = window.location.pathname.split('/');
        const targetUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
        const isOwnProfile = !targetUserId || targetUserId === 'edit-profile';
        
        if (tabType === 'active') {
            noRidesTitle.textContent = isOwnProfile ? 'Nu ai curse active' : 'Nu are curse active';
            noRidesDescription.textContent = isOwnProfile ? 'Creează o cursă pentru a o vedea aici' : 'Acest utilizator nu are curse active momentan';
        } else {
            noRidesTitle.textContent = isOwnProfile ? 'Nu ai curse completate' : 'Nu are curse completate';
            noRidesDescription.textContent = isOwnProfile ? 'Cursele completate vor apărea aici' : 'Acest utilizator nu are curse completate momentan';
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
                // Reload rides - verificăm dacă suntem pe profilul propriu
                const pathSegments = window.location.pathname.split('/');
                const targetUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
                
                if (!targetUserId || targetUserId === 'edit-profile') {
                    loadUserRides(); // Reload rides pentru profilul propriu
                } else {
                    loadSpecificUserRides(targetUserId); // Reload rides pentru profilul specific
                }
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

// Rating System Functions
function initializeRatingSystem() {
    // Setup star rating hover effects
    setupStarRatingEffects();
    
    // Setup login redirect functionality
    setupLoginRedirect();
}

function setupStarRatingEffects() {
    const starLabels = document.querySelectorAll('.star-label');
    
    starLabels.forEach((label, index) => {
        label.addEventListener('mouseenter', function() {
            // Highlight stars from current to first (left to right)
            // Since stars are ordered 5,4,3,2,1 in HTML, we need to reverse the logic
            const starIndex = 4 - index; // Convert 0,1,2,3,4 to 4,3,2,1,0
            for (let i = 0; i <= starIndex; i++) {
                starLabels[4 - i].style.color = '#fbbf24';
            }
        });
        
        label.addEventListener('mouseleave', function() {
            // Reset all stars to default color, but keep selected rating
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            if (selectedRating) {
                const ratingValue = parseInt(selectedRating.value);
                starLabels.forEach((star, i) => {
                    // Since stars are ordered 5,4,3,2,1, we need to reverse the logic
                    const starIndex = 4 - i; // Convert 0,1,2,3,4 to 4,3,2,1,0
                    if (starIndex < ratingValue) {
                        star.style.color = '#fbbf24';
                    } else {
                        star.style.color = '#d1d5db';
                    }
                });
            } else {
                starLabels.forEach(star => {
                    star.style.color = '#d1d5db';
                });
            }
        });
        
        // Add click event to select rating
        label.addEventListener('click', function() {
            const ratingValue = index + 1;
            const radioInput = document.getElementById(`star${ratingValue}`);
            
            // Uncheck all radio inputs
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.checked = false;
            });
            
            // Check the selected rating
            radioInput.checked = true;
            
            // Update star colors to show selected rating (left to right)
            starLabels.forEach((star, i) => {
                // Since stars are ordered 5,4,3,2,1, we need to reverse the logic
                const starIndex = 4 - i; // Convert 0,1,2,3,4 to 4,3,2,1,0
                if (starIndex < ratingValue) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '#d1d5db';
                }
            });
        });
    });
}

function setupLoginRedirect() {
    const loginBtn = document.getElementById('login-redirect-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Save current profile URL for redirect after login
            const currentProfileUrl = window.location.pathname;
            sessionStorage.setItem('redirectAfterLogin', currentProfileUrl);
            
            console.log('🔗 Saving redirect URL:', currentProfileUrl);
            
            // Redirect to login page
            window.location.href = '/login';
        });
    }
}

function loadUserRatingData(userId) {
    console.log('🔍 loadUserRatingData called for userId:', userId);
    
    // First check if user is authenticated
    fetch('/api/auth/check')
        .then(response => response.json())
        .then(authData => {
            console.log('🔍 Auth check result:', authData);
            
            if (authData.authenticated) {
                const currentUser = authData.user;
                console.log('✅ User authenticated:', currentUser);
                
                // Check if user is trying to rate themselves
                if (currentUser.id == userId) {
                    console.log('❌ User cannot rate themselves');
                    document.getElementById('rating-section').style.display = 'none';
                    return;
                }
                
                // Show rating section and form container for authenticated users
                const ratingSection = document.getElementById('rating-section');
                const ratingFormContainer = document.getElementById('rating-form-container');
                const loginRequiredMessage = document.getElementById('login-required-message');
                
                if (ratingSection) ratingSection.style.display = 'block';
                if (ratingFormContainer) ratingFormContainer.style.display = 'block';
                if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
                
                console.log('✅ Rating section shown for authenticated user');
                
                // Load rating summary
                return fetch(`/api/ratings/user/${userId}`);
            } else {
                console.log('❌ User not authenticated');
                throw new Error('User not authenticated');
            }
        })
        .then(response => {
            if (response && response.ok) {
                return response.json();
            } else if (response) {
                throw new Error('Failed to load rating data');
            }
        })
        .then(data => {
            if (data && data.success) {
                const averageRating = data.averageRating || 0;
                const totalRatings = data.totalRatings || 0;
                // updateRatingDisplay(averageRating, totalRatings); // Removed as per edit hint
                displayUserRatings(data.ratings);
            } else {
                // Set default values if no rating data
                // updateRatingDisplay(0, 0); // Removed as per edit hint
            }
            
            // Check if current user has already rated this user
            return checkCurrentUserRating(userId);
        })
        .catch(error => {
            console.log('❌ User not authenticated or error occurred:', error);
            
            // Show login required message for non-authenticated users
            const ratingSection = document.getElementById('rating-section');
            const ratingFormContainer = document.getElementById('rating-form-container');
            const loginRequiredMessage = document.getElementById('login-required-message');
            
            if (ratingSection) ratingSection.style.display = 'block';
            if (ratingFormContainer) ratingFormContainer.style.display = 'none';
            if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
            
            console.log('✅ Login required message shown for non-authenticated user');
            
            // Still try to load rating summary for display
            return fetch(`/api/ratings/user/${userId}`);
        })
        .then(response => {
            if (response && response.ok) {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.success) {
                const averageRating = data.averageRating || 0;
                const totalRatings = data.totalRatings || 0;
                // updateRatingDisplay(averageRating, totalRatings); // Removed as per edit hint
                displayUserRatings(data.ratings);
            } else {
                // Set default values if no rating data
                // updateRatingDisplay(0, 0); // Removed as per edit hint
            }
        })
        .catch(error => {
            console.error('Error loading rating data:', error);
            // No need to update rating display since we removed that section
        });
}

function displayUserRatings(ratings) {
    console.log('🔍 displayUserRatings called with ratings:', ratings);
    
    const ratingsList = document.getElementById('ratings-list');
    const userRatings = document.getElementById('user-ratings');
    
    if (!ratingsList || !userRatings) {
        console.error('❌ Ratings elements not found');
        return;
    }
    
    if (!ratings || ratings.length === 0) {
        userRatings.style.display = 'none';
        console.log('✅ No ratings to display, hiding ratings section');
        return;
    }
    
    // Show ratings section
    userRatings.style.display = 'block';
    
    // Clear existing ratings
    ratingsList.innerHTML = '';
    
    // Add each rating
    ratings.forEach(rating => {
        const ratingItem = document.createElement('div');
        ratingItem.className = 'rating-item';
        
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating.rating) {
                stars.push('<i class="fas fa-star"></i>');
            } else {
                stars.push('<i class="far fa-star"></i>');
            }
        }
        
        ratingItem.innerHTML = `
            <div class="rating-info">
                <div class="rating-stars">${stars.join('')}</div>
                ${rating.comment ? `<div class="rating-comment">"${rating.comment}"</div>` : ''}
            </div>
            <div class="rating-date">${formatDate(rating.createdAt)}</div>
        `;
        
        ratingsList.appendChild(ratingItem);
    });
    
    console.log(`✅ Displayed ${ratings.length} ratings`);
}

function checkCurrentUserRating(ratedUserId) {
    console.log('🔍 checkCurrentUserRating called for ratedUserId:', ratedUserId);
    
    // First check if user is authenticated
    fetch('/api/auth/check')
        .then(response => response.json())
        .then(authData => {
            if (!authData.authenticated) {
                console.log('❌ User not authenticated, cannot check rating');
                return;
            }
            
            console.log('✅ User authenticated, checking rating...');
            
            return fetch(`/api/ratings/check/${ratedUserId}`);
        })
        .then(response => {
            if (response && response.ok) {
                return response.json();
            } else if (response) {
                throw new Error('Failed to check rating');
            }
        })
        .then(data => {
            if (data && data.success) {
                if (data.hasRated) {
                    console.log('✅ User has already rated, showing update form');
                    showRatingUpdate(data.existingRating);
                } else {
                    console.log('✅ User has not rated, showing rating form');
                    showRatingForm();
                }
            } else {
                console.log('❌ Rating check failed, showing rating form');
                showRatingForm();
            }
        })
        .catch(error => {
            console.error('❌ Error checking rating:', error);
            showRatingForm();
        });
}

function showRatingForm() {
    console.log('🔍 showRatingForm called');
    
    const ratingForm = document.getElementById('rating-form');
    const ratingUpdate = document.getElementById('rating-update');
    
    if (ratingForm) {
        ratingForm.style.display = 'block';
        console.log('✅ Rating form shown');
    }
    if (ratingUpdate) {
        ratingUpdate.style.display = 'none';
        console.log('✅ Rating update hidden');
    }
    
    // Reset rating form
    const commentField = document.getElementById('rating-comment');
    if (commentField) commentField.value = '';
    
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.checked = false;
    });
    
    // Reset star colors
    const starLabels = document.querySelectorAll('.star-label');
    starLabels.forEach(star => {
        star.style.color = '#d1d5db';
    });
    
    // Change button text and action to submit new rating
    const submitBtn = document.getElementById('submit-rating-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Trimite rating';
        submitBtn.onclick = submitRating;
    }
    
    console.log('✅ Rating form reset and ready');
}

function showRatingUpdate(existingRating) {
    console.log('🔍 showRatingUpdate called with existingRating:', existingRating);
    
    // Instead of showing the update section, directly show the rating form
    // This allows users to change their rating by simply selecting new stars and submitting
    showRatingForm();
    
    // Pre-fill the form with existing rating data
    if (existingRating) {
        // Set the rating
        const ratingInput = document.getElementById(`star${existingRating.rating}`);
        if (ratingInput) {
            ratingInput.checked = true;
        }
        
        // Set the comment
        const commentField = document.getElementById('rating-comment');
        if (commentField && existingRating.comment) {
            commentField.value = existingRating.comment;
        }
        
        // Update star colors to show the current rating
        const starLabels = document.querySelectorAll('.star-label');
        starLabels.forEach((star, i) => {
            // Since stars are ordered 5,4,3,2,1 in HTML, we need to reverse the logic
            const starIndex = 4 - i; // Convert 0,1,2,3,4 to 4,3,2,1,0
            if (starIndex < existingRating.rating) {
                star.style.color = '#fbbf24';
            } else {
                star.style.color = '#d1d5db';
            }
        });
        
        // Change submit button text to indicate this is an update
        const submitBtn = document.getElementById('submit-rating-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Actualizează rating-ul';
        }
        
        console.log('✅ Rating form pre-filled with existing rating data');
    }
}

function submitRating() {
    console.log('🔍 submitRating called');
    
    // Get rating value
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    if (!ratingInput) {
        showNotification('Te rog să selectezi un rating!', 'error');
        return;
    }
    
    const rating = parseInt(ratingInput.value);
    const comment = document.getElementById('rating-comment').value;
    
    console.log('📝 Rating data:', { rating, comment });
    
    // Get the user ID from the URL
    const pathSegments = window.location.pathname.split('/');
    const ratedUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    if (!ratedUserId) {
        showNotification('Eroare: ID utilizator invalid!', 'error');
        return;
    }
    
    console.log('👤 Submitting rating for user:', ratedUserId);
    
    // First check if user is authenticated
    fetch('/api/auth/check')
        .then(response => response.json())
        .then(authData => {
            if (!authData.authenticated) {
                throw new Error('User not authenticated');
            }
            
            console.log('✅ User authenticated, proceeding with rating submission');
            
            // Use the simple endpoint that handles both create and update
            console.log('🔄 Submitting rating (will create new or update existing)');
            const formData = new FormData();
            formData.append('ratedUserId', ratedUserId);
            formData.append('rating', rating);
            formData.append('comment', comment);
            
            return fetch('/api/ratings/rate', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => {
            console.log('📡 Rating response status:', response.status);
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        })
        .then(data => {
            console.log('✅ Rating processed successfully:', data);
            const message = data.message || 'Rating-ul a fost procesat cu succes!';
            showNotification(message, 'success');
            
            // Reload the entire page after successful rating submission
            console.log('🔄 Reloading page after successful rating submission');
            window.location.reload();
        })
        .catch(error => {
            console.error('❌ Error processing rating:', error);
            if (error.message.includes('not authenticated')) {
                showNotification('Trebuie să fiți logat pentru a pune un rating!', 'error');
            } else {
                showNotification('Eroare la procesarea rating-ului: ' + error.message, 'error');
            }
        });
}







