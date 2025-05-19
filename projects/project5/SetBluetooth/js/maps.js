import { sendCoordinatesToDevice } from './bluetooth.js';

let map;
let markers = [];
let selectedMarker = null;
let directionsService;
let directionsRenderer;
let searchBox;
let sendToDeviceBtn;
let selectedWaypointLabel;

function initMap() {
    sendToDeviceBtn = document.getElementById('sendToDeviceBtn');
    selectedWaypointLabel = document.getElementById('selectedWaypointLabel');

    // Handle send button click
    sendToDeviceBtn.addEventListener('click', async () => {
        if (selectedMarker) {
            await sendSelectedMarkerToDevice();
        }
    });

    // Default center (Paris)
    const defaultCenter = { lat: 48.8566, lng: 2.3522 };
    
    // Initialize Direction Services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#0071e3',
            strokeWeight: 4
        }
    });
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: defaultCenter,
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#1d1d1f"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"weight": 2}]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f7"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#0071e3"}]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    });

    directionsRenderer.setMap(map);

    // Initialize search box
    const input = document.getElementById('addressSearch');
    searchBox = new google.maps.places.SearchBox(input);

    // Bind search events
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        map.setCenter(place.geometry.location);
        addMarker(place.geometry.location, place.name);
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
        const address = document.getElementById('addressSearch').value;
        if (!address) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                map.setCenter(location);
                addMarker(location, address);
            } else {
                alert('Adresse non trouvée');
            }
        });
    });

    document.getElementById('planRouteBtn').addEventListener('click', calculateAndDisplayRoute);
    document.getElementById('clearRouteBtn').addEventListener('click', clearRoute);

    // Add click listener for adding markers
    map.addListener('click', (event) => {
        addMarker(event.latLng);
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                addMarker(pos, 'Ma position');
            },
            () => {
                console.log('Error: The Geolocation service failed.');
            }
        );
    }
}

function calculateAndDisplayRoute() {
    if (markers.length < 2) {
        alert('Ajoutez au moins deux points pour tracer un itinéraire');
        return;
    }

    const waypoints = markers.slice(1, -1).map(m => ({
        location: m.marker.getPosition(),
        stopover: true
    }));

    const origin = markers[0].marker.getPosition();
    const destination = markers[markers.length - 1].marker.getPosition();

    directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);

            // Update marker labels based on optimized route
            const route = response.routes[0];
            const order = route.waypoint_order;
            
            markers.forEach((m, i) => {
                const label = String.fromCharCode(65 + i); // A, B, C, etc.
                m.marker.setLabel(label);
            });
        } else {
            alert('Impossible de calculer l\'itinéraire');
        }
    });
}

function clearRoute() {
    directionsRenderer.setDirections({ routes: [] });
    markers.forEach(m => m.marker.setMap(null));
    markers = [];
}

function addMarker(position, title = 'Point') {
    const label = String.fromCharCode(65 + markers.length); // A, B, C, etc.
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: `${title}`,
        label: label
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px;">${marker.title} (${label})</h3>
                <p style="margin: 0; font-size: 12px;">
                    Lat: ${position.lat().toFixed(6)}<br>
                    Lng: ${position.lng().toFixed(6)}
                </p>
            </div>
        `
    });

    marker.addListener('click', () => {
        if (selectedMarker) {
            selectedMarker.infoWindow.close();
        }
        infoWindow.open(map, marker);
        selectedMarker = { marker, infoWindow };
        updateSelectedMarkerInfo(marker, label);
    });

    marker.addListener('dragend', () => {
        if (selectedMarker && selectedMarker.marker === marker) {
            updateInfoWindow(marker, infoWindow, label);
        }
        if (markers.length > 1) {
            calculateAndDisplayRoute();
        }
    });

    markers.push({ marker, infoWindow });
    
    if (markers.length > 1) {
        calculateAndDisplayRoute();
    }
    
    return marker;
}

function updateInfoWindow(marker, infoWindow, label) {
    const position = marker.getPosition();
    infoWindow.setContent(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px;">${marker.title} (${label})</h3>
            <p style="margin: 0; font-size: 12px;">
                Lat: ${position.lat().toFixed(6)}<br>
                Lng: ${position.lng().toFixed(6)}
            </p>
        </div>
    `);
}

function updateSelectedMarkerInfo(marker, label) {
    if (selectedWaypointLabel && sendToDeviceBtn) {
        selectedWaypointLabel.textContent = `Point ${label}`;
        sendToDeviceBtn.disabled = false;
    }
}

async function sendSelectedMarkerToDevice() {
    if (!selectedMarker) return;

    const position = selectedMarker.marker.getPosition();
    const coords = {
        lat: position.lat(),
        lng: position.lng()
    };

    try {
        sendToDeviceBtn.disabled = true;
        await sendCoordinatesToDevice(coords);
        selectedMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            selectedMarker.marker.setAnimation(null);
            sendToDeviceBtn.disabled = false;
        }, 2100);
    } catch (error) {
        console.error('Failed to send coordinates:', error);
        alert('Échec de l\'envoi des coordonnées. Vérifiez la connexion Bluetooth.');
        sendToDeviceBtn.disabled = false;
    }
}

// Initialize map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMap, 100);
});

export { map, markers };
