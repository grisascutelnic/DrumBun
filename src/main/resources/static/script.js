// Variabile globale
let passengersCount = 1;
let luggageCount = 0;

// Inițializare când se încarcă pagina
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main page loaded, initializing...');
    
    initializeCounters();
    initializeSearchForm();
    initializeLocationAutocomplete();
    initializeHamburgerMenu();
    initializeAddRideButton();
    initializeRidesPageAutocomplete();
    initializeModernCalendar();
    initializeUserProfileLinks();
});

// Inițializarea contoarelor pentru pasageri și colete
function initializeCounters() {
    const minusButtons = document.querySelectorAll('.counter-btn.minus');
    const plusButtons = document.querySelectorAll('.counter-btn.plus');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type === 'passengers' && passengersCount > 1) {
                passengersCount--;
                document.getElementById('passengers-count').textContent = passengersCount;
            } else if (type === 'luggage' && luggageCount > 0) {
                luggageCount--;
                document.getElementById('luggage-count').textContent = luggageCount;
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type === 'passengers' && passengersCount < 8) {
                passengersCount++;
                document.getElementById('passengers-count').textContent = passengersCount;
            } else if (type === 'luggage' && luggageCount < 5) {
                luggageCount++;
                document.getElementById('luggage-count').textContent = luggageCount;
            }
        });
    });
}

// Inițializarea formularului de căutare
function initializeSearchForm() {
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }
}

// Inițializarea autocomplete pentru localități
function initializeLocationAutocomplete() {
    // Această funcție este acum gestionată de autocomplete.js
    console.log('Location autocomplete initialized by autocomplete.js');
}

// Inițializarea autocomplete pentru pagina rides
function initializeRidesPageAutocomplete() {
    // Această funcție este acum gestionată de autocomplete.js
    console.log('Rides page autocomplete initialized by autocomplete.js');
}

// Funcțiile de autocomplete au fost mutate în autocomplete.js pentru a evita conflictele

// Inițializarea meniului hamburger
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navAuth = document.querySelector('.nav-auth');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            navAuth.classList.toggle('active');
        });
    }
}

// Inițializarea butonului pentru adăugarea cursei
function initializeAddRideButton() {
    const addRideBtn = document.querySelector('.add-ride-btn');
    
    if (addRideBtn) {
        addRideBtn.addEventListener('click', function(e) {
            e.preventDefault();
            checkAuthAndRedirect();
        });
    }
}

// Funcție pentru verificarea autentificării și redirecționare
function checkAuthAndRedirect() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                // User is logged in, redirect to add-ride page
                window.location.href = '/add-ride';
            } else {
                // User is not logged in, redirect to login page
                // Save the target URL in sessionStorage for redirection after login
                sessionStorage.setItem('redirectAfterLogin', '/add-ride');
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            // On error, redirect to login page for safety
            sessionStorage.setItem('redirectAfterLogin', '/add-ride');
            window.location.href = '/login';
        });
}

// Efectuarea căutării
function performSearch() {
    const fromLocation = document.getElementById('from-location').value;
    const toLocation = document.getElementById('to-location').value;
    const travelDate = document.getElementById('travel-date').value;
    
    if (!fromLocation || !toLocation) {
        showNotification('Vă rugăm să completați localitățile de plecare și destinație.', 'warning');
        return;
    }
    
    // Construim obiectul de căutare
    const searchData = {
        fromLocation: fromLocation,
        toLocation: toLocation,
        travelDate: travelDate,
        passengers: passengersCount,
        luggage: luggageCount
    };
    
    console.log('Searching with data:', searchData);
    
    // Simulăm căutarea - în viitor va face request către backend
    showNotification('Căutarea cursei...', 'info');
    
    // Redirecționăm către pagina de curse cu parametrii de căutare
    const params = new URLSearchParams(searchData);
    window.location.href = `/rides?${params.toString()}`;
}

// Funcția pentru afișarea notificărilor
function showNotification(message, type = 'info') {
    // Ștergem notificările existente
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content ${type}">
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Ștergem notificarea după 5 secunde
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Inițializarea calendarului modern cu Flatpickr pentru pagina principală
function initializeModernCalendar() {
    // Calendar pentru data călătoriei în formularul de căutare
    const travelDateInput = document.getElementById('travel-date');
    
    if (travelDateInput) {
        flatpickr(travelDateInput, {
            dateFormat: "Y-m-d",
            locale: "ro",
            minDate: "today",
            maxDate: new Date().fp_incr(365), // Până la un an în viitor
            disableMobile: false,
            allowInput: true,
            clickOpens: true,
            theme: "material_blue",
            onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    console.log('Travel date selected:', dateStr);
                }
            },
            onReady: function(selectedDates, dateStr, instance) {
                // Adăugăm iconița de calendar
                const calendarIcon = document.createElement('i');
                calendarIcon.className = 'fas fa-calendar-alt calendar-icon';
                calendarIcon.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #10b981; pointer-events: none; z-index: 10;';
                
                const inputWrapper = travelDateInput.parentElement;
                if (inputWrapper) {
                    inputWrapper.style.position = 'relative';
                    inputWrapper.appendChild(calendarIcon);
                }
            }
        });
        
        console.log('Modern calendar initialized for main page travel date');
    }
}

// Inițializarea linkurilor pentru profilul utilizatorului
function initializeUserProfileLinks() {
    console.log('🔍 Initializing user profile links...');
    
    // Event delegation pentru linkurile de profil utilizator
    document.addEventListener('click', function(e) {
        console.log('🖱️ Click detected on:', e.target);
        
        if (e.target.closest('.user-profile-link')) {
            console.log('✅ Click on user profile link detected!');
            const link = e.target.closest('.user-profile-link');
            const userId = link.getAttribute('data-user-id');
            console.log('👤 User ID extracted:', userId);
            
            if (userId) {
                console.log('🚀 Navigating to user profile:', userId);
                navigateToUserProfile(userId);
            } else {
                console.error('❌ No user ID found in data-user-id attribute');
            }
        }
    });
    
    // Verificăm dacă există elemente cu clasa user-profile-link
    const profileLinks = document.querySelectorAll('.user-profile-link');
    console.log('🔗 Found profile links:', profileLinks.length);
    profileLinks.forEach((link, index) => {
        const userId = link.getAttribute('data-user-id');
        console.log(`🔗 Link ${index}: data-user-id="${userId}"`);
    });
}

// Navigarea la profilul utilizatorului
function navigateToUserProfile(userId) {
    console.log('🧭 navigateToUserProfile called with userId:', userId);
    
    if (userId) {
        const profileUrl = `/profile/${userId}`;
        console.log('🌐 Redirecting to:', profileUrl);
        window.location.href = profileUrl;
    } else {
        console.error('❌ User ID is missing for profile navigation.');
        showNotification('Eroare: ID-ul utilizatorului nu a fost găsit.', 'error');
    }
}
