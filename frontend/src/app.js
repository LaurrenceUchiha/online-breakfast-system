import { initApp } from './components/App.js';

// Global error handler for module loading
window.addEventListener('error', (e) => {
    console.error('Module loading error:', e.error);
    showErrorScreen('Failed to load application modules. Please refresh the page.');
});

function showErrorScreen(message) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; font-family: 'Inter', sans-serif;">
                <div style="font-size: 4rem; margin-bottom: 20px;">😕</div>
                <h1 style="color: #e74c3c; margin-bottom: 15px;">Application Error</h1>
                <p style="color: #666; margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    ${message}
                </p>
                <button onclick="window.location.reload()" 
                        style="padding: 12px 30px; background: #FF6B35; color: white; border: none; border-radius: 8px; 
                               cursor: pointer; font-size: 16px; font-weight: 500; transition: background 0.3s ease;">
                    🔄 Refresh Application
                </button>
                <div style="margin-top: 30px; color: #999; font-size: 0.9rem;">
                    If the problem persists, please contact support.
                </div>
            </div>
        `;
    }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Initializing Classic American Breakfast App...');
        initApp().catch(error => {
            console.error('App initialization failed:', error);
            showErrorScreen('Failed to initialize the application. Please check your console for details.');
        });
    });
} else {
    console.log('🚀 Initializing Classic American Breakfast App...');
    initApp().catch(error => {
        console.error('App initialization failed:', error);
        showErrorScreen('Failed to initialize the application. Please check your console for details.');
    });
}

// Export for potential debugging
window.BreakfastApp = {
    version: '1.0.0',
    init: initApp
};