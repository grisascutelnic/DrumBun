// Funcționalitate pentru pagina rides
document.addEventListener('DOMContentLoaded', function() {
    console.log('Rides page loaded, initializing...');
    
    try {
        initializeRidesPage();
        console.log('Rides page initialized');
    } catch (error) {
        console.error('Error initializing rides page:', error);
    }
});

// Inițializarea paginii rides
function initializeRidesPage() {
    // Inițializăm autocomplete pentru filtre
    initializeFilterAutocomplete();
    
    // Adăugăm event listeners pentru butoane
    initializeRideActions();
    
    // Adăugăm event listener pentru filtrare
    initializeFiltering();
    
    // Încărcăm toate cursele disponibile la inițializare
    loadAllRides();
}

// Inițializarea autocomplete pentru filtre
function initializeFilterAutocomplete() {
    // Inițializăm autocomplete-ul global
    if (typeof initializeGlobalAutocomplete === 'function') {
        initializeGlobalAutocomplete();
    } else {
        console.log('Global autocomplete function not available, skipping...');
    }
    
    // Verificăm dacă elementele de filtrare există
    const filterFrom = document.getElementById('filter-from');
    const filterTo = document.getElementById('filter-to');
    
    if (!filterFrom || !filterTo) {
        console.log('Filter elements not found, skipping autocomplete initialization');
        return;
    }
}

// Inițializarea acțiunilor pentru curse
function initializeRideActions() {
    // Event delegation pentru butoanele de rezervare
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-reserve')) {
            const button = e.target.closest('.btn-reserve');
            const rideId = button.getAttribute('data-ride-id');
            if (rideId) {
                handleReservation(rideId);
            }
        }
        
        if (e.target.closest('.btn-details')) {
            const button = e.target.closest('.btn-details');
            const rideId = button.getAttribute('data-ride-id');
            if (rideId) {
                showRideDetails(rideId);
            }
        }
        
        if (e.target.closest('.user-profile-link')) {
            const link = e.target.closest('.user-profile-link');
            const userId = link.getAttribute('data-user-id');
            if (userId) {
                navigateToUserProfile(userId);
            }
        }
    });
}

// Inițializarea filtrarei
function initializeFiltering() {
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    // Adăugăm event listener pentru formularul de căutare
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
}

// Gestionarea rezervării
function handleReservation(rideId) {
    // Verificăm dacă utilizatorul este logat
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                // Utilizatorul este logat, putem face rezervarea
                showNotification('Funcționalitatea de rezervare va fi implementată în curând!', 'info');
            } else {
                // Utilizatorul nu este logat, redirecționăm la login
                showNotification('Trebuie să fiți logat pentru a face o rezervare.', 'warning');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            showNotification('Eroare la verificarea autentificării.', 'error');
        });
}

// Afișarea detaliilor cursei
function showRideDetails(rideId) {
    // Pentru moment, afișăm o notificare
    showNotification('Detaliile cursei vor fi afișate în curând!', 'info');
}

// Navigarea la profilul utilizatorului
function navigateToUserProfile(userId) {
    if (userId) {
        window.location.href = `/profile/${userId}`;
    } else {
        showNotification('Eroare: ID-ul utilizatorului nu a fost găsit.', 'error');
    }
}

// Aplicarea filtrelor
function applyFilters() {
    const fromLocation = document.getElementById('filter-from')?.value || '';
    const toLocation = document.getElementById('filter-to')?.value || '';
    const travelDate = document.getElementById('filter-date')?.value || '';
    
    // Construim URL-ul pentru căutare
    const params = new URLSearchParams();
    if (fromLocation) params.append('fromLocation', fromLocation);
    if (toLocation) params.append('toLocation', toLocation);
    if (travelDate) params.append('travelDate', travelDate);
    
    // Facem request către API cu GET method
    fetch(`/api/rides/search?${params.toString()}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateRidesList(data.results);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error applying filters:', error);
        showNotification('Eroare la aplicarea filtrelor.', 'error');
    });
}

// Actualizarea listei de curse
function updateRidesList(rides) {
    console.log('Updating rides list with:', rides);
    
    const ridesList = document.getElementById('rides-list');
    console.log('Found rides list element:', ridesList);
    
    if (!ridesList) {
        console.error('Element rides-list not found in DOM');
        return;
    }
    
    if (!rides || rides.length === 0) {
        console.log('No rides to display, showing empty state');
        ridesList.innerHTML = `
            <div class="no-rides">
                <i class="fas fa-search"></i>
                <h3>Nu sunt curse disponibile</h3>
                <p>Încearcă să modifici filtrele sau să revii mai târziu.</p>
            </div>
        `;
        return;
    }
    
    console.log('Generating HTML for', rides.length, 'rides');
    const ridesHTML = rides.map(ride => generateRideCardHTML(ride)).join('');
    console.log('Generated HTML length:', ridesHTML.length);
    
    ridesList.innerHTML = ridesHTML;
    console.log('Updated rides list HTML');
}

// Generarea HTML-ului pentru o carte de cursă
function generateRideCardHTML(ride) {
    console.log('Generating HTML for ride:', ride);
    
    const travelDate = new Date(ride.travelDate).toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    const departureTime = new Date(ride.departureTime).toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    console.log('Formatted travel date:', travelDate);
    console.log('Formatted departure time:', departureTime);
    
    const html = `
        <div class="ride-card" data-ride-id="${ride.id}">
            <div class="ride-header">
                <div class="ride-route">
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
                <div class="ride-price">
                                            <span class="price">${ride.price} MDL</span>
                    <span class="per-seat">per loc</span>
                </div>
            </div>
            <div class="ride-details">
                <div class="ride-info">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${travelDate}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${departureTime}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${ride.availableSeats} locuri disponibile</span>
                    </div>
                    <div class="info-item user-profile-link" data-user-id="${ride.userId}" style="cursor: pointer;" onclick="navigateToUserProfile('${ride.userId}')">
                        <i class="fas fa-user"></i>
                        <span class="driver-name">${ride.driverName}</span>
                        <i class="fas fa-external-link-alt profile-link-icon"></i>
                    </div>
                </div>
                <div class="ride-actions">
                    <button class="btn-reserve" data-ride-id="${ride.id}">
                        <i class="fas fa-ticket-alt"></i>
                        Rezervă
                    </button>
                    <button class="btn-details" data-ride-id="${ride.id}">
                        <i class="fas fa-info-circle"></i>
                        Detalii
                    </button>
                </div>
            </div>
            ${ride.description ? `
                <div class="ride-description">
                    <p>${ride.description}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    console.log('Generated HTML for ride', ride.id, ':', html.substring(0, 100) + '...');
    return html;
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

// Inițializarea calendarului modern cu Flatpickr
function initializeModernCalendar() {
    const dateInput = document.getElementById('filter-date');
    
    if (dateInput) {
        // Configurare pentru calendarul de filtrare
        flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            locale: "ro",
            minDate: "today",
            maxDate: new Date().fp_incr(365), // Până la un an în viitor
            disableMobile: false,
            allowInput: true,
            clickOpens: true,
            theme: "material_blue",
            onChange: function(selectedDates, dateStr, instance) {
                // Aplicăm filtrele automat când se schimbă data
                if (selectedDates.length > 0) {
                    applyFilters();
                }
            },
            onReady: function(selectedDates, dateStr, instance) {
                // Adăugăm iconița de calendar
                const calendarIcon = document.createElement('i');
                calendarIcon.className = 'fas fa-calendar-alt calendar-icon';
                calendarIcon.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #10b981; pointer-events: none; z-index: 10;';
                
                const inputWrapper = dateInput.parentElement;
                if (inputWrapper) {
                    inputWrapper.style.position = 'relative';
                    inputWrapper.appendChild(calendarIcon);
                }
            }
        });
        
        console.log('Modern calendar initialized for filter date');
    }
}

// Încărcarea tuturor curselor disponibile
function loadAllRides() {
    console.log('Starting to load all rides...');
    
    // Verificăm dacă elementul rides-list există
    const ridesList = document.getElementById('rides-list');
    if (!ridesList) {
        console.error('Element rides-list not found in DOM');
        return;
    }
    
    // Mai întâi testăm conexiunea la baza de date
    fetch('/api/rides/test')
        .then(response => response.json())
        .then(testData => {
            console.log('Database test result:', testData);
            if (!testData.success) {
                throw new Error('Database connection failed: ' + testData.message);
            }
            
            // Dacă testul a reușit, încărcăm cursele
            return fetch('/api/rides');
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(rides => {
            console.log('Successfully loaded rides:', rides);
            console.log('Number of rides:', rides.length);
            
            if (!rides || rides.length === 0) {
                // Nu sunt curse disponibile
                ridesList.innerHTML = `
                    <div class="no-rides">
                        <i class="fas fa-search"></i>
                        <h3>Nu sunt curse disponibile</h3>
                        <p>Încearcă să modifici filtrele sau să revii mai târziu.</p>
                    </div>
                `;
            } else {
                updateRidesList(rides);
            }
        })
        .catch(error => {
            console.error('Error loading rides:', error);
            showNotification('Eroare la încărcarea curselor: ' + error.message, 'error');
            // Afișăm mesajul de eroare în lista de curse
            ridesList.innerHTML = `
                <div class="no-rides">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Eroare la încărcarea curselor</h3>
                    <p>${error.message}</p>
                    <p>Vă rugăm să reîncercați mai târziu.</p>
                    <button onclick="loadAllRides()" class="btn-retry">
                        <i class="fas fa-redo"></i>
                        Reîncearcă
                    </button>
                </div>
            `;
        });
}
