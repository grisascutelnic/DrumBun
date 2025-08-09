// Variabile globale pentru harta și autocomplete
let map;
let fromMarker, toMarker;
let routeLayer;
let currentFormData = {};

// Inițializare când se încarcă pagina
document.addEventListener('DOMContentLoaded', function() {
    console.log('Add-ride page loaded, initializing...');
    
    // Verificăm dacă utilizatorul este autentificat
    checkAuthentication();
    
    try {
        initializeMap();
        console.log('Map initialized');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
    
    try {
        initializeLocationAutocomplete();
        console.log('Autocomplete initialized');
    } catch (error) {
        console.error('Error initializing autocomplete:', error);
    }
    
    try {
        initializeFormHandlers();
        console.log('Form handlers initialized');
    } catch (error) {
        console.error('Error initializing form handlers:', error);
    }
    
    try {
        setDefaultDate();
        console.log('Default date set');
    } catch (error) {
        console.error('Error setting default date:', error);
    }
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
                sessionStorage.setItem('redirectAfterLogin', '/add-ride');
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            // În caz de eroare, redirecționăm la logare
            sessionStorage.setItem('redirectAfterLogin', '/add-ride');
            window.location.href = '/login';
        });
}

// Inițializarea hărții
function initializeMap() {
    const mapElement = document.getElementById('route-map');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }
    
    // Centrul hărții pe Moldova
    map = L.map('route-map').setView([47.0105, 28.8638], 8);
    
    // Adăugăm layer-ul OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Inițializăm controalele hărții
    initializeMapControls();
}

// Inițializarea controalelor hărții
function initializeMapControls() {
    const calculateRouteBtn = document.getElementById('calculate-route');
    const clearRouteBtn = document.getElementById('clear-route');
    
    if (calculateRouteBtn) {
        calculateRouteBtn.addEventListener('click', calculateRoute);
        console.log('Calculate route button handler added');
    }
    
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', clearRoute);
        console.log('Clear route button handler added');
    }
}

// Inițializarea autocomplete pentru localități
function initializeLocationAutocomplete() {
    // Această funcție este acum gestionată de autocomplete.js
    console.log('Location autocomplete initialized by autocomplete.js');
    
    // Adăugăm listener pentru evenimentul locationSelected pentru a gestiona markerii pe hartă
    document.addEventListener('locationSelected', function(e) {
        const { input, value, fullAddress, type, lat, lon } = e.detail;
        
        if (lat && lon) {
            // Determinăm tipul markerului bazat pe ID-ul input-ului
            let markerType;
            if (input.id.includes('from')) {
                markerType = 'from';
            } else if (input.id.includes('to')) {
                markerType = 'to';
            } else {
                // Fallback pentru alte cazuri
                markerType = type;
            }
            
            addMarkerToMap(lat, lon, value, markerType);
        }
    });
}

// Funcțiile de autocomplete au fost mutate în autocomplete.js pentru a evita conflictele

// Căutarea localităților folosind Nominatim
// Funcțiile de autocomplete au fost mutate în autocomplete.js pentru a evita conflictele

// Funcțiile de autocomplete au fost mutate în autocomplete.js pentru a evita conflictele

// Adăugarea unui marker pe hartă
function addMarkerToMap(lat, lon, name, type) {
    const marker = L.marker([lat, lon]).addTo(map);
    
    if (type === 'from') {
        if (fromMarker) map.removeLayer(fromMarker);
        fromMarker = marker;
        marker.setIcon(L.divIcon({
            className: 'custom-marker from-marker',
            html: '<i class="fas fa-map-marker-alt" style="color: #3b82f6;"></i>',
            iconSize: [30, 30]
        }));
    } else {
        if (toMarker) map.removeLayer(toMarker);
        toMarker = marker;
        marker.setIcon(L.divIcon({
            className: 'custom-marker to-marker',
            html: '<i class="fas fa-map-marker-alt" style="color: #ef4444;"></i>',
            iconSize: [30, 30]
        }));
    }
    
    marker.bindPopup(`<b>${name}</b>`);
    
    // Centrăm harta pe ambele markeri dacă există
    if (fromMarker && toMarker) {
        const group = L.featureGroup([fromMarker, toMarker]);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Ascunderea sugestiilor
function hideSuggestions(container) {
    if (container) {
        container.style.display = 'none';
    }
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

// Calcularea rutei
async function calculateRoute() {
    if (!fromMarker || !toMarker) {
        showNotification('Vă rugăm să selectați atât punctul de plecare cât și cel de destinație.', 'warning');
        return;
    }
    
    const fromLat = fromMarker.getLatLng().lat;
    const fromLon = fromMarker.getLatLng().lng;
    const toLat = toMarker.getLatLng().lat;
    const toLon = toMarker.getLatLng().lng;
    
    try {
        // Folosim OSRM pentru calculul rutei
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            displayRoute(data.routes[0]);
            showNotification('Ruta a fost calculată cu succes!', 'success');
        } else {
            showNotification('Nu s-a putut calcula ruta. Vă rugăm să încercați din nou.', 'error');
        }
    } catch (error) {
        console.error('Eroare la calcularea rutei:', error);
        showNotification('Eroare la calcularea rutei. Vă rugăm să încercați din nou.', 'error');
    }
}

// Afișarea rutei pe hartă
function displayRoute(route) {
    // Ștergem ruta anterioară
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    
    // Adăugăm noua rută
    routeLayer = L.geoJSON(route.geometry, {
        style: {
            color: '#10b981',
            weight: 4,
            opacity: 0.8
        }
    }).addTo(map);
    
    // Centrăm harta pe rută
    map.fitBounds(routeLayer.getBounds().pad(0.1));
}

// Ștergerea rutei
function clearRoute() {
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    
    if (fromMarker) {
        map.removeLayer(fromMarker);
        fromMarker = null;
    }
    
    if (toMarker) {
        map.removeLayer(toMarker);
        toMarker = null;
    }
    
    // Resetăm input-urile
    document.getElementById('from-location').value = '';
    document.getElementById('to-location').value = '';
    
    showNotification('Ruta a fost ștearsă.', 'info');
}

// Inițializarea handler-elor pentru formular
function initializeFormHandlers() {
    const form = document.getElementById('add-ride-form');
    const previewBtn = document.getElementById('preview-ride');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }
}

// Handler pentru submit-ul formularului
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(e.target);
    submitRideData(formData);
}

// Validarea formularului
function validateForm() {
    const requiredFields = ['fromLocation', 'toLocation', 'travelDate', 'departureTime', 'availableSeats', 'price'];
    
    for (const field of requiredFields) {
        const element = document.querySelector(`[name="${field}"]`);
        if (!element || !element.value.trim()) {
            showNotification(`Câmpul "${element?.placeholder || field}" este obligatoriu.`, 'error');
            return false;
        }
    }
    
    // Validare preț
    const price = parseFloat(document.getElementById('price').value);
    if (price <= 0) {
        showNotification('Prețul trebuie să fie mai mare decât 0.', 'error');
        return false;
    }
    
    // Validare locuri disponibile
    const seats = parseInt(document.getElementById('available-seats').value);
    if (seats < 1 || seats > 8) {
        showNotification('Numărul de locuri disponibile trebuie să fie între 1 și 8.', 'error');
        return false;
    }
    
    return true;
}

// Trimiterea datelor cursei
async function submitRideData(formData) {
    try {
        const response = await fetch('/api/rides', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            setTimeout(() => {
                window.location.href = '/rides';
            }, 2000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Eroare la trimiterea datelor:', error);
        showNotification('Eroare la trimiterea datelor. Vă rugăm să încercați din nou.', 'error');
    }
}

// Afișarea previzualizării
function showPreview() {
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(document.getElementById('add-ride-form'));
    currentFormData = Object.fromEntries(formData);
    
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = generatePreviewHTML(currentFormData);
    
    document.getElementById('preview-modal').style.display = 'block';
}

// Generarea HTML-ului pentru previzualizare
function generatePreviewHTML(data) {
    return `
        <div class="preview-ride">
            <div class="preview-section">
                <h4><i class="fas fa-route"></i> Ruta</h4>
                <p><strong>De la:</strong> ${data.fromLocation}</p>
                <p><strong>Până la:</strong> ${data.toLocation}</p>
            </div>
            
            <div class="preview-section">
                <h4><i class="fas fa-calendar"></i> Detalii Călătorie</h4>
                <p><strong>Data:</strong> ${data.travelDate}</p>
                <p><strong>Ora plecării:</strong> ${data.departureTime}</p>
                <p><strong>Locuri disponibile:</strong> ${data.availableSeats}</p>
                <p><strong>Preț per loc:</strong> ${data.price} RON</p>
            </div>
            
            ${data.description ? `
                <div class="preview-section">
                    <h4><i class="fas fa-info-circle"></i> Descriere</h4>
                    <p>${data.description}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Închiderea modalului
function closeModal() {
    document.getElementById('preview-modal').style.display = 'none';
}

// Submit-ul din modal
function submitRide() {
    if (Object.keys(currentFormData).length === 0) {
        showNotification('Nu există date pentru trimitere.', 'error');
        return;
    }
    
    const formData = new FormData();
    Object.entries(currentFormData).forEach(([key, value]) => {
        formData.append(key, value);
    });
    
    submitRideData(formData);
    closeModal();
}

// Setarea datei implicite (mâine)
function setDefaultDate() {
    const travelDate = document.getElementById('travel-date');
    if (travelDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        travelDate.value = formattedDate;
    }
}

// Închiderea modalului când se face click în afară
window.addEventListener('click', function(e) {
    const modal = document.getElementById('preview-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Închiderea modalului cu ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
