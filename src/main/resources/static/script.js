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
    const fromInput = document.getElementById('from-location');
    const toInput = document.getElementById('to-location');
    
    console.log('From input found:', !!fromInput);
    console.log('To input found:', !!toInput);
    
    if (fromInput) {
        setupAutocomplete(fromInput, 'from');
    }
    
    if (toInput) {
        setupAutocomplete(toInput, 'to');
    }
}

// Inițializarea autocomplete pentru pagina rides
function initializeRidesPageAutocomplete() {
    const filterFromInput = document.getElementById('filter-from');
    const filterToInput = document.getElementById('filter-to');
    
    console.log('Filter from input found:', !!filterFromInput);
    console.log('Filter to input found:', !!filterToInput);
    
    if (filterFromInput) {
        setupAutocomplete(filterFromInput, 'filter-from');
    }
    
    if (filterToInput) {
        setupAutocomplete(filterToInput, 'filter-to');
    }
}

// Configurarea autocomplete pentru un input
function setupAutocomplete(input, type) {
    let timeoutId;
    let selectedIndex = -1;
    
    // Creăm containerul pentru sugestii
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-dropdown';
    suggestionsContainer.id = `${type}-suggestions`;
    input.parentNode.appendChild(suggestionsContainer);
    
    console.log(`Setting up autocomplete for ${type}`);
    
    input.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const query = this.value.trim();
        
        console.log(`${type} input changed:`, query);
        
        if (query.length < 2) {
            hideSuggestions(suggestionsContainer);
            return;
        }
        
        timeoutId = setTimeout(() => {
            searchLocations(query, suggestionsContainer, type);
        }, 300);
    });
    
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                updateSelection(suggestions, selectedIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(suggestions, selectedIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    selectSuggestion(suggestions[selectedIndex], input, type);
                }
                break;
            case 'Escape':
                hideSuggestions(suggestionsContainer);
                break;
        }
    });
    
    // Click pe sugestii
    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            selectSuggestion(e.target, input, type);
        }
    });
    
    // Închiderea sugestiilor când se face click în altă parte
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions(suggestionsContainer);
        }
    });
}

// Căutarea localităților folosind Nominatim
async function searchLocations(query, container, type) {
    console.log(`Searching for: ${query} (${type})`);
    
    try {
        // Căutăm în Moldova cu Nominatim
        const searchQuery = `${query}, Moldova`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=md&limit=15&addressdetails=1`;
        
        console.log('Fetching from Nominatim:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Nominatim results:', data.length);
        
        // Procesăm rezultatele
        const processedResults = data.map(item => {
            const displayName = formatDisplayName(item);
            const locationType = getLocationType(item);
            
            return {
                name: displayName,
                lat: item.lat,
                lon: item.lon,
                type: locationType,
                fullAddress: item.display_name
            };
        });
        
        displaySuggestions(processedResults, container, type);
    } catch (error) {
        console.error('Eroare la căutarea localităților:', error);
        showNotification('Eroare la căutarea localităților. Vă rugăm să încercați din nou.', 'error');
        hideSuggestions(container);
    }
}

// Formatarea numelui pentru afișare
function formatDisplayName(item) {
    const address = item.address || {};
    
    // Încercăm să găsim cel mai specific nume
    if (address.city) return address.city;
    if (address.town) return address.town;
    if (address.village) return address.village;
    if (address.hamlet) return address.hamlet;
    if (address.suburb) return address.suburb;
    if (address.neighbourhood) return address.neighbourhood;
    
    // Dacă nu găsim, folosim primul element din display_name
    const parts = item.display_name.split(',');
    return parts[0].trim();
}

// Determinarea tipului de locație
function getLocationType(item) {
    const address = item.address || {};
    
    if (address.aerodrome || address.airport) return 'airport';
    if (address.railway_station || address.station) return 'station';
    if (address.city || address.town) return 'city';
    if (address.village || address.hamlet) return 'village';
    if (address.suburb || address.neighbourhood) return 'district';
    
    return 'location';
}

// Afișarea sugestiilor
function displaySuggestions(results, container, type) {
    console.log(`Displaying ${results.length} suggestions for ${type}`);
    
    if (!results || results.length === 0) {
        hideSuggestions(container);
        return;
    }
    
    let html = '';
    results.forEach((result, index) => {
        const displayName = result.name;
        const iconClass = getLocationIcon(result.type);
        const typeLabel = getLocationTypeLabel(result.type);
        
        html += `
            <div class="suggestion-item" data-index="${index}" data-lat="${result.lat}" data-lon="${result.lon}">
                <i class="${iconClass}"></i>
                <div class="suggestion-content">
                    <span class="suggestion-name">${displayName}</span>
                    <small class="suggestion-address">${result.fullAddress}</small>
                </div>
                <small class="suggestion-type">${typeLabel}</small>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.style.display = 'block';
    console.log(`Displayed ${results.length} suggestions`);
}

// Obținerea iconiței pentru tipul de locație
function getLocationIcon(type) {
    switch(type) {
        case 'city': return 'fas fa-city';
        case 'village': return 'fas fa-home';
        case 'airport': return 'fas fa-plane';
        case 'station': return 'fas fa-train';
        case 'district': return 'fas fa-map-marker-alt';
        default: return 'fas fa-map-marker-alt';
    }
}

// Obținerea etichetei pentru tipul de locație
function getLocationTypeLabel(type) {
    switch(type) {
        case 'city': return 'Oraș';
        case 'village': return 'Sat';
        case 'airport': return 'Aeroport';
        case 'station': return 'Gară';
        case 'district': return 'Cartier';
        default: return 'Locație';
    }
}

// Actualizarea selecției cu săgețile
function updateSelection(suggestions, selectedIndex) {
    suggestions.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Selectarea unei sugestii
function selectSuggestion(suggestionItem, input, type) {
    const displayName = suggestionItem.querySelector('.suggestion-name').textContent;
    const fullAddress = suggestionItem.querySelector('.suggestion-address').textContent;
    
    // Afișăm numele principal în input
    input.value = displayName;
    
    // Adăugăm un atribut cu adresa completă pentru referință
    input.setAttribute('data-full-address', fullAddress);
    
    const suggestionsContainer = document.getElementById(`${type}-suggestions`);
    if (suggestionsContainer) {
        hideSuggestions(suggestionsContainer);
    }
}

// Ascunderea sugestiilor
function hideSuggestions(container) {
    if (container) {
        container.style.display = 'none';
    }
}

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
        addRideBtn.addEventListener('click', function() {
            window.location.href = '/add-ride';
        });
    }
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
