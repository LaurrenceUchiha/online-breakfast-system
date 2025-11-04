import { initApp } from './components/App.js';

console.log('🚀 app.js started loading');

try {
  document.addEventListener('DOMContentLoaded', initApp);
} catch (error) {
  console.error('❌ app.js failed:', error);
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; padding: 50px;">
      <h1>JavaScript Error</h1>
      <p>${error.message}</p>
    </div>
  `;
}