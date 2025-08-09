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
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Quick actions - se vor seta în funcție de tipul profilului
    // setupOwnProfileMode() și setupViewProfileMode() se vor apela din loadUserProfile()
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
    
    // Show rating section for other users' profiles
    const ratingSection = document.getElementById('rating-section');
    if (ratingSection) {
        ratingSection.style.display = 'block';
    }
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
    // Setup rating form event listeners
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', submitRating);
    }
    
    // Setup rating update event listeners
    const editRatingBtn = document.getElementById('edit-rating-btn');
    const deleteRatingBtn = document.getElementById('delete-rating-btn');
    
    if (editRatingBtn) {
        editRatingBtn.addEventListener('click', editRating);
    }
    
    if (deleteRatingBtn) {
        deleteRatingBtn.addEventListener('click', deleteRating);
    }
    
    // Setup star rating hover effects
    setupStarRatingEffects();
}

function setupStarRatingEffects() {
    const starLabels = document.querySelectorAll('.star-label');
    
    starLabels.forEach((label, index) => {
        label.addEventListener('mouseenter', function() {
            // Highlight stars from current to first
            for (let i = 0; i <= index; i++) {
                starLabels[i].style.color = '#fbbf24';
            }
        });
        
        label.addEventListener('mouseleave', function() {
            // Reset all stars to default color, but keep selected rating
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            if (selectedRating) {
                const ratingValue = parseInt(selectedRating.value);
                starLabels.forEach((star, i) => {
                    if (i < ratingValue) {
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
            
            // Update star colors to show selected rating
            starLabels.forEach((star, i) => {
                if (i < ratingValue) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '#d1d5db';
                }
            });
        });
    });
}

function loadUserRatingData(userId) {
    // Load rating summary
    fetch(`/api/ratings/user/${userId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load rating data');
            }
        })
        .then(data => {
            if (data.success) {
                const averageRating = data.averageRating || 0;
                const totalRatings = data.totalRatings || 0;
                updateRatingDisplay(averageRating, totalRatings);
                displayUserRatings(data.ratings);
            } else {
                // Set default values if no rating data
                updateRatingDisplay(0, 0);
            }
        })
        .catch(error => {
            console.error('Error loading rating data:', error);
            // Set default values on error
            updateRatingDisplay(0, 0);
        });
    
    // Check if current user has already rated this user
    checkCurrentUserRating(userId);
}

function updateRatingDisplay(averageRating, totalRatings) {
    const currentRating = document.getElementById('current-rating');
    const ratingCount = document.getElementById('rating-count');
    const starsDisplay = document.getElementById('stars-display');
    
    if (currentRating) {
        currentRating.textContent = averageRating.toFixed(1);
    }
    
    if (ratingCount) {
        if (totalRatings === 0) {
            ratingCount.textContent = '0 rating-uri';
        } else {
            ratingCount.textContent = `${totalRatings} rating${totalRatings !== 1 ? '-uri' : ''}`;
        }
    }
    
    if (starsDisplay) {
        updateStarsDisplay(starsDisplay, averageRating);
    }
}

function updateStarsDisplay(starsContainer, rating) {
    const stars = starsContainer.querySelectorAll('i');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    stars.forEach((star, index) => {
        if (rating === 0) {
            // No rating - show empty stars
            star.className = 'far fa-star';
            star.style.color = '#d1d5db';
        } else if (index < fullStars) {
            // Full star
            star.className = 'fas fa-star';
            star.style.color = '#fbbf24';
        } else if (index === fullStars && hasHalfStar) {
            // Half star
            star.className = 'fas fa-star-half-alt';
            star.style.color = '#fbbf24';
        } else {
            // Empty star
            star.className = 'far fa-star';
            star.style.color = '#d1d5db';
        }
    });
}

function displayUserRatings(ratings) {
    // This function can be expanded to show individual ratings
    // For now, we just use the summary data
    console.log('User ratings loaded:', ratings);
}

function checkCurrentUserRating(ratedUserId) {
    fetch(`/api/ratings/check/${ratedUserId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to check rating');
            }
        })
        .then(data => {
            if (data.success) {
                if (data.hasRated) {
                    showRatingUpdate(data.existingRating);
                } else {
                    showRatingForm();
                }
            }
        })
        .catch(error => {
            console.error('Error checking rating:', error);
            showRatingForm();
        });
}

function showRatingForm() {
    const ratingForm = document.getElementById('rating-form');
    const ratingUpdate = document.getElementById('rating-update');
    
    if (ratingForm) ratingForm.style.display = 'block';
    if (ratingUpdate) ratingUpdate.style.display = 'none';
    
    // Reset rating form
    document.getElementById('rating-comment').value = '';
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.checked = false;
    });
    
    // Reset star colors
    const starLabels = document.querySelectorAll('.star-label');
    starLabels.forEach(star => {
        star.style.color = '#d1d5db';
    });
}

function showRatingUpdate(existingRating) {
    const ratingForm = document.getElementById('rating-form');
    const ratingUpdate = document.getElementById('rating-update');
    const userRatingStars = document.getElementById('user-rating-stars');
    const userRatingComment = document.getElementById('user-rating-comment');
    
    if (ratingForm) ratingForm.style.display = 'none';
    if (ratingUpdate) ratingUpdate.style.display = 'block';
    
    // Display user's existing rating
    if (userRatingStars && existingRating) {
        userRatingStars.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            if (i <= existingRating.rating) {
                star.className = 'fas fa-star';
                star.style.color = '#fbbf24';
            } else {
                star.className = 'far fa-star';
                star.style.color = '#d1d5db';
            }
            userRatingStars.appendChild(star);
        }
    }
    
    if (userRatingComment) {
        if (existingRating && existingRating.comment && existingRating.comment.trim()) {
            userRatingComment.textContent = existingRating.comment;
        } else {
            userRatingComment.textContent = 'Nu a fost adăugat niciun comentariu.';
        }
    }
}

function submitRating() {
    // Get rating value
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    if (!ratingInput) {
        showNotification('Te rog să selectezi un rating!', 'error');
        return;
    }
    
    const rating = parseInt(ratingInput.value);
    const comment = document.getElementById('rating-comment').value;
    
    // Get the user ID from the URL
    const pathSegments = window.location.pathname.split('/');
    const ratedUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    if (!ratedUserId) {
        showNotification('Eroare: ID utilizator invalid!', 'error');
        return;
    }
    
    // Submit rating
    const formData = new FormData();
    formData.append('ratedUserId', ratedUserId);
    formData.append('rating', rating);
    if (comment.trim()) {
        formData.append('comment', comment.trim());
    }
    
    fetch('/api/ratings/rate', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to submit rating');
        }
    })
    .then(data => {
        if (data.success) {
            showNotification('Rating-ul a fost salvat cu succes!', 'success');
            // Reload rating data
            loadUserRatingData(ratedUserId);
            // Reset form
            document.getElementById('rating-comment').value = '';
            document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
            
            // Reset star colors
            const starLabels = document.querySelectorAll('.star-label');
            starLabels.forEach(star => {
                star.style.color = '#d1d5db';
            });
        } else {
            showNotification(data.message || 'Eroare la salvarea rating-ului!', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting rating:', error);
        showNotification('Eroare la salvarea rating-ului!', 'error');
    });
}

function editRating() {
    // Show rating form for editing
    showRatingForm();
    
    // Get existing rating data
    const pathSegments = window.location.pathname.split('/');
    const ratedUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    if (ratedUserId) {
        checkCurrentUserRating(ratedUserId);
    }
    
    // Reset star colors
    const starLabels = document.querySelectorAll('.star-label');
    starLabels.forEach(star => {
        star.style.color = '#d1d5db';
    });
}

function deleteRating() {
    if (!confirm('Ești sigur că vrei să ștergi rating-ul tău?')) {
        return;
    }
    
    // Get the user ID from the URL
    const pathSegments = window.location.pathname.split('/');
    const ratedUserId = pathSegments.length > 2 && pathSegments[1] === 'profile' ? pathSegments[2] : null;
    
    if (!ratedUserId) {
        showNotification('Eroare: ID utilizator invalid!', 'error');
        return;
    }
    
    // Get existing rating to delete
    fetch(`/api/ratings/check/${ratedUserId}`)
        .then(data => {
            if (data.success && data.hasRated && data.existingRating) {
                return fetch(`/api/ratings/${data.existingRating.id}`, {
                    method: 'DELETE'
                });
            } else {
                throw new Error('Rating not found');
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to delete rating');
            }
        })
        .then(data => {
            if (data.success) {
                showNotification('Rating-ul a fost șters cu succes!', 'success');
                // Reload rating data
                loadUserRatingData(ratedUserId);
                // Reset form
                document.getElementById('rating-comment').value = '';
                document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
                
                // Reset star colors
                const starLabels = document.querySelectorAll('.star-label');
                starLabels.forEach(star => {
                    star.style.color = '#d1d5db';
                });
            } else {
                showNotification(data.message || 'Eroare la ștergerea rating-ului!', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting rating:', error);
            showNotification('Eroare la ștergerea rating-ului!', 'error');
        });
}
