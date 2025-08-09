// Funcții comune pentru autocompletarea localităților
// Updated: 2024-12-19 15:30 - Fixed extractShortAddress function with logging
let autocompleteInitialized = false;

// Inițializarea autocomplete pentru toate paginile
function initializeGlobalAutocomplete() {
    if (autocompleteInitialized) return;
    
    console.log('Initializing global autocomplete...');
    
    // Găsim toate input-urile pentru localități
    const locationInputs = document.querySelectorAll('input[id*="location"], input[id*="filter"], input[id="from"], input[id="to"]');
    
    locationInputs.forEach(input => {
        const inputId = input.id;
        let suggestionsId;
        let type;
        
        // Determinăm ID-ul containerului de sugestii și tipul
        if (inputId.includes('filter')) {
            // Pentru pagina rides
            suggestionsId = `${inputId}-suggestions`;
            type = inputId; // Păstrăm ID-ul complet pentru a putea diferenția
        } else if (inputId === 'from' || inputId === 'to') {
            // Pentru pagina index
            suggestionsId = `${inputId}-suggestions`;
            type = inputId;
        } else {
            // Pentru paginile add-ride
            suggestionsId = inputId.replace('location', 'suggestions');
            type = inputId.includes('from') ? 'from' : 'to';
        }
        
        console.log(`Setting up autocomplete for ${inputId} with suggestions ${suggestionsId}, type: ${type}`);
        setupAutocomplete(input, suggestionsId, type);
    });
    
    autocompleteInitialized = true;
}

// Configurarea autocomplete pentru un input
function setupAutocomplete(input, suggestionsId, type) {
    let timeoutId;
    let selectedIndex = -1;
    let lastClickTime = 0;
    const suggestionsContainer = document.getElementById(suggestionsId);
    
    if (!suggestionsContainer) {
        console.warn(`Suggestions container not found: ${suggestionsId}`);
        return;
    }
    
    console.log(`Setting up autocomplete for ${type}, container:`, !!suggestionsContainer);
    
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
    
    // Click pe sugestii - folosim event delegation pentru a gestiona click-urile
    suggestionsContainer.addEventListener('click', function(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevenim click-urile multiple rapide
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 500) {
                return;
            }
            lastClickTime = currentTime;
            
            selectSuggestion(suggestionItem, input, type);
        }
    });
    
    // Închiderea sugestiilor când se face click în altă parte
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions(suggestionsContainer);
        }
    });
    
    // Pentru input-urile din pagina index, verificăm și wrapper-ul
    if (input.parentNode && input.parentNode.classList.contains('input-wrapper')) {
        document.addEventListener('click', function(e) {
            const wrapper = input.parentNode;
            if (!wrapper.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                hideSuggestions(suggestionsContainer);
            }
        });
    }
    
    // Gestionarea focus-ului pentru a afișa sugestiile dacă există text
    input.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length >= 2) {
            searchLocations(query, suggestionsContainer, type);
        }
    });
    
    // Gestionarea blur-ului pentru a închide sugestiile după un delay mic
    input.addEventListener('blur', function() {
        setTimeout(() => {
            hideSuggestions(suggestionsContainer);
        }, 200);
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
        
        // Procesăm rezultatele și le sortăm pentru a avea localitățile relevante primele
        const processedResults = data.map(item => {
            const displayName = formatDisplayName(item);
            const locationType = getLocationType(item);
            
            return {
                name: displayName,
                lat: item.lat,
                lon: item.lon,
                type: locationType,
                fullAddress: item.display_name,
                relevance: calculateRelevance(item, query)
            };
        }).sort((a, b) => b.relevance - a.relevance);
        
        displaySuggestions(processedResults, container, type);
    } catch (error) {
        console.error('Eroare la căutarea localităților:', error);
        showNotification('Eroare la căutarea localităților. Vă rugăm să încercați din nou.', 'error');
        hideSuggestions(container);
    }
}

// Calcularea relevanței pentru sortare
function calculateRelevance(item, query) {
    const address = item.address || {};
    const queryLower = query.toLowerCase();
    let relevance = 0;
    
    // Verificăm dacă query-ul se potrivește cu numele localității
    if (address.city && address.city.toLowerCase().includes(queryLower)) relevance += 10;
    if (address.town && address.town.toLowerCase().includes(queryLower)) relevance += 10;
    if (address.village && address.village.toLowerCase().includes(queryLower)) relevance += 10;
    if (address.hamlet && address.hamlet.toLowerCase().includes(queryLower)) relevance += 10;
    
    // Bonus pentru potrivirea exactă
    if (address.city && address.city.toLowerCase() === queryLower) relevance += 5;
    if (address.town && address.town.toLowerCase() === queryLower) relevance += 5;
    if (address.village && address.village.toLowerCase() === queryLower) relevance += 5;
    if (address.hamlet && address.hamlet.toLowerCase() === queryLower) relevance += 5;
    
    // Bonus pentru localități din Moldova
    if (address.country === 'Moldova') relevance += 2;
    
    return relevance;
}

// Formatarea numelui pentru afișare
function formatDisplayName(item) {
    const address = item.address || {};
    
    // Pentru orașe mari, returnăm doar numele
    const majorCities = ['chisinau', 'bălți', 'orhei', 'soroca', 'ungheni', 'cahul', 'strășeni', 'călărași', 'florești', 'drochia', 'rîșcani', 'glodeni', 'fălești', 'sîngerei', 'rezina', 'telenești', 'criuleni', 'aneni noi', 'cimișlia', 'leova', 'cantemir', 'ștefan vodă', 'căușeni', 'hîncești', 'ialoveni', 'nisporeni', 'ocnița', 'dondușeni', 'edineț', 'briceni', 'comrat', 'vulcănești', 'ceadîr-lunga', 'taraclia', 'basarabeasca', 'căinari', 'criuleni', 'dubăsari', 'grigoriopol', 'camenca', 'rîbnița', 'slobozia', 'tiraspol', 'bender', 'tiraspol'];
    
    // Verificăm dacă este un oraș mare
    if (address.city) {
        const cityName = address.city.toLowerCase();
        if (majorCities.some(city => cityName.includes(city) || city.includes(cityName))) {
            return address.city; // Returnăm doar numele orașului
        }
    }
    if (address.town) {
        const townName = address.town.toLowerCase();
        if (majorCities.some(city => townName.includes(city) || city.includes(townName))) {
            return address.town; // Returnăm doar numele orașului
        }
    }
    
    // Pentru sate și orașe mici, returnăm numele complet
    if (address.city) return address.city;
    if (address.town) return address.town;
    if (address.village) return address.village;
    if (address.hamlet) return address.hamlet;
    if (address.suburb) return address.suburb;
    if (address.neighbourhood) return address.neighbourhood;
    
    // Dacă nu găsim în address, încercăm să extragem din display_name
    const parts = item.display_name.split(',');
    // Căutăm primul element care pare a fi numele unei localități
    for (let part of parts) {
        part = part.trim();
        // Verificăm dacă nu este un tip de locație (raion, țară, etc.)
        if (part && !part.toLowerCase().includes('raion') && 
            !part.toLowerCase().includes('moldova') && 
            !part.toLowerCase().includes('md-') &&
            part.length > 1) {
            return part;
        }
    }
    
    // Fallback la primul element
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
        
        // Afișăm numele localității în titlu și adresa completă în subtitlu
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

// Extragerea doar a satului și raionului din adresa completă
function extractShortAddress(fullAddress) {
    if (!fullAddress) return '';
    
    console.log('extractShortAddress called with:', fullAddress);
    
    const parts = fullAddress.split(',').map(part => part.trim());
    let shortAddress = [];
    
    console.log('Parts split:', parts);
    
    // Pentru orașe mari (Chisinau, Balti, Orhei, Soroca, etc.) - returnăm doar numele
    const majorCities = ['chisinau', 'bălți', 'orhei', 'soroca', 'ungheni', 'cahul', 'strășeni', 'călărași', 'florești', 'drochia', 'rîșcani', 'glodeni', 'fălești', 'sîngerei', 'rezina', 'telenești', 'criuleni', 'aneni noi', 'cimișlia', 'leova', 'cantemir', 'ștefan vodă', 'căușeni', 'hîncești', 'ialoveni', 'nisporeni', 'ocnița', 'dondușeni', 'edineț', 'briceni', 'comrat', 'vulcănești', 'ceadîr-lunga', 'taraclia', 'basarabeasca', 'căinari', 'criuleni', 'dubăsari', 'grigoriopol', 'camenca', 'rîbnița', 'slobozia', 'tiraspol', 'bender', 'tiraspol'];
    
    // Verificăm dacă primul element este un oraș mare
    if (parts.length > 0) {
        const firstPart = parts[0].toLowerCase();
        if (majorCities.some(city => firstPart.includes(city) || city.includes(firstPart))) {
            return parts[0]; // Returnăm doar numele orașului
        }
    }
    
    // Pentru sate și orașe mici - căutăm satul/orășelul (primul element relevant)
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Verificăm dacă nu este doar un tip de locație (raion, țară, etc.)
        if (part && 
            !part.toLowerCase().includes('raion') && 
            !part.toLowerCase().includes('moldova') && 
            !part.toLowerCase().includes('md-') &&
            !part.toLowerCase().includes('district') &&
            !part.toLowerCase().includes('county') &&
            !part.toLowerCase().includes('municipality') &&
            part.length > 1) {
            shortAddress.push(part);
            break;
        }
    }
    
    // Căutăm raionul (următorul element relevant)
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part && part.toLowerCase().includes('raion')) {
            shortAddress.push(part);
            break;
        }
    }
    
    // Dacă nu am găsit raion, încercăm să găsim district, county, municipality sau alte diviziuni administrative
    if (shortAddress.length === 1) {
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part && 
                (part.toLowerCase().includes('district') || 
                 part.toLowerCase().includes('county') ||
                 part.toLowerCase().includes('municipality') ||
                 part.toLowerCase().includes('gagauzia') ||
                 part.toLowerCase().includes('autonomous')) &&
                !part.toLowerCase().includes('moldova')) {
                
                // Pentru district, county, municipality - extragem doar numele, nu cuvântul complet
                let cleanPart = part;
                if (part.toLowerCase().includes('district')) {
                    cleanPart = part.replace(/district/i, '').trim();
                } else if (part.toLowerCase().includes('county')) {
                    cleanPart = part.replace(/county/i, '').trim();
                } else if (part.toLowerCase().includes('municipality')) {
                    cleanPart = part.replace(/municipality/i, '').trim();
                }
                
                shortAddress.push(cleanPart);
                break;
            }
        }
    }
    
    // Dacă nu am găsit nimic, returnăm primul element
    if (shortAddress.length === 0 && parts.length > 0) {
        shortAddress.push(parts[0]);
    }
    
    const result = shortAddress.join(', ');
    console.log('Final short address result:', result);
    return result;
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
    const lat = suggestionItem.dataset.lat;
    const lon = suggestionItem.dataset.lon;
    
    console.log('selectSuggestion called with:', { displayName, fullAddress, type });
    
    // Extragem doar satul și raionul din adresa completă
    const shortAddress = extractShortAddress(fullAddress);
    
    console.log('Short address extracted:', shortAddress);
    
    // Afișăm doar satul și raionul în input
    input.value = shortAddress;
    
    // Adăugăm atribute pentru referință
    input.setAttribute('data-full-address', fullAddress);
    input.setAttribute('data-short-address', shortAddress);
    input.setAttribute('data-lat', lat);
    input.setAttribute('data-lon', lon);
    
    // Găsim containerul de sugestii pentru acest input
    const suggestionsContainer = input.parentNode.querySelector('.suggestions-dropdown');
    if (suggestionsContainer) {
        hideSuggestions(suggestionsContainer);
    }
    
    // Pentru input-urile din pagina index, căutăm în wrapper
    if (!suggestionsContainer && input.parentNode.parentNode) {
        const wrapperSuggestions = input.parentNode.parentNode.querySelector('.suggestions-dropdown');
        if (wrapperSuggestions) {
            hideSuggestions(wrapperSuggestions);
        }
    }
    
    // Trigger pentru evenimente custom dacă există
    const event = new CustomEvent('locationSelected', {
        detail: {
            input: input,
            value: shortAddress,
            fullAddress: fullAddress,
            shortAddress: shortAddress,
            type: type,
            lat: lat,
            lon: lon
        }
    });
    document.dispatchEvent(event);
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

// Inițializarea când se încarcă pagina
document.addEventListener('DOMContentLoaded', function() {
    console.log('Global autocomplete script loaded');
    initializeGlobalAutocomplete();
});
