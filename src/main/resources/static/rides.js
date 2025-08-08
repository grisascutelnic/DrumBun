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
}

// Inițializarea autocomplete pentru filtre
function initializeFilterAutocomplete() {
    // Această funcție este gestionată de autocomplete.js
    console.log('Filter autocomplete initialized by autocomplete.js');
}

// Inițializarea acțiunilor pentru curse
function initializeRideActions() {
    // Event delegation pentru butoanele de rezervare
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-reserve')) {
            const button = e.target.closest('.btn-reserve');
            const rideId = button.getAttribute('data-ride-id');
            handleReservation(rideId);
        }
        
        if (e.target.closest('.btn-details')) {
            const button = e.target.closest('.btn-details');
            const rideId = button.getAttribute('data-ride-id');
            showRideDetails(rideId);
        }
        
        if (e.target.closest('.user-profile-link')) {
            const link = e.target.closest('.user-profile-link');
            const userId = link.getAttribute('data-user-id');
            navigateToUserProfile(userId);
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
    const fromLocation = document.getElementById('filter-from').value;
    const toLocation = document.getElementById('filter-to').value;
    const travelDate = document.getElementById('filter-date').value;
    
    // Construim URL-ul pentru căutare
    const params = new URLSearchParams();
    if (fromLocation) params.append('fromLocation', fromLocation);
    if (toLocation) params.append('toLocation', toLocation);
    if (travelDate) params.append('travelDate', travelDate);
    
    // Facem request către API
    fetch(`/api/rides/search?${params.toString()}`, {
        method: 'POST'
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
    const ridesList = document.getElementById('rides-list');
    
    if (rides.length === 0) {
        ridesList.innerHTML = `
            <div class="no-rides">
                <i class="fas fa-search"></i>
                <h3>Nu există curse disponibile</h3>
                <p>Încearcă să modifici filtrele sau să revii mai târziu.</p>
            </div>
        `;
        return;
    }
    
    ridesList.innerHTML = rides.map(ride => generateRideCardHTML(ride)).join('');
}

// Generarea HTML-ului pentru o carte de cursă
function generateRideCardHTML(ride) {
    const travelDate = new Date(ride.travelDate).toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    const departureTime = new Date(ride.departureTime).toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
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
                    <span class="price">${ride.price} RON</span>
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
                    <div class="info-item user-profile-link" data-user-id="${ride.userId}">
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
