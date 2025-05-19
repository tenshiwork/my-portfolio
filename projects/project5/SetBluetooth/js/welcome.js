import { connectBluetooth } from './bluetooth.js';

// Welcome screen functionality
export function initializeWelcomeScreen() {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    const skipBtn = document.getElementById('skipBtn');
    const welcomeConnectBtn = document.getElementById('welcomeConnectBtn');
    const sideMenuConnectBtn = document.getElementById('bluetoothConnectBtn');

    if (!welcomeOverlay || !skipBtn || !welcomeConnectBtn) {
        console.error('Welcome screen elements not found');
        return;
    }

    skipBtn.addEventListener('click', () => {
        hideWelcomeOverlay();
    });

    // Handle both welcome screen and side menu Bluetooth buttons
    [welcomeConnectBtn, sideMenuConnectBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    await connectBluetooth();
                    hideWelcomeOverlay();
                } catch (error) {
                    console.error('Bluetooth connection failed:', error);
                    alert('La connexion Bluetooth a échoué. Veuillez réessayer.');
                }
            });
        }
    });
}

function hideWelcomeOverlay() {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    if (welcomeOverlay) {
        welcomeOverlay.classList.add('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeWelcomeScreen);