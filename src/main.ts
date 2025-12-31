import { Event } from './models/Event.js';
import { User } from './models/User.js';
import { Registration } from './models/Registration.js';

// Stockage en mémoire
export const events: Event[] = [];
export const users: User[] = [];
export const registrations: Registration[] = [];

// Éléments DOM
const eventForm = document.getElementById('event-form') as HTMLFormElement;
const userForm = document.getElementById('user-form') as HTMLFormElement;
const eventsList = document.getElementById('events-list') as HTMLDivElement;
const eventsCount = document.getElementById('events-count') as HTMLParagraphElement;
const filterCategory = document.getElementById('filter-category') as HTMLSelectElement;
const filterDateMin = document.getElementById('filter-date-min') as HTMLInputElement;
const filterDateMax = document.getElementById('filter-date-max') as HTMLInputElement;
const resetFiltersBtn = document.getElementById('reset-filters') as HTMLButtonElement;
const eventModal = document.getElementById('event-modal') as HTMLDivElement;
const modalClose = document.getElementById('modal-close') as HTMLButtonElement;
const modalBody = document.getElementById('modal-body') as HTMLDivElement;
const alertsContainer = document.getElementById('alerts') as HTMLDivElement;
const menuToggle = document.getElementById('menu-toggle') as HTMLButtonElement;
const navMenu = document.getElementById('nav-menu') as HTMLUListElement;
const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

// État de filtrage
let currentFilters = {
  category: '',
  dateMin: '',
  dateMax: ''
};

let currentEditEventId: string | null = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  renderEvents();
});

function initializeEventListeners(): void {
  eventForm?.addEventListener('submit', handleCreateEvent);
  userForm?.addEventListener('submit', handleCreateUser);
  filterCategory?.addEventListener('change', handleFilterChange);
  filterDateMin?.addEventListener('change', handleFilterChange);
  filterDateMax?.addEventListener('change', handleFilterChange);
  resetFiltersBtn?.addEventListener('click', resetFilters);
  modalClose?.addEventListener('click', closeModal);
  eventModal?.addEventListener('click', (e) => {
    if (e.target === eventModal) closeModal();
  });
  
  // Menu toggle (responsive)
  menuToggle?.addEventListener('click', toggleMenu);
  
  // Theme toggle
  themeToggle?.addEventListener('click', toggleTheme);
  
  // Fermer menu quand on clique sur un lien
  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Charger le thème sauvegardé
  initializeTheme();
}

// Création d'évènement
function handleCreateEvent(e: SubmitEvent): void {
  e.preventDefault();
  
  const title = (document.getElementById('event-title') as HTMLInputElement).value.trim();
  const description = (document.getElementById('event-description') as HTMLTextAreaElement).value.trim();
  const dateStr = (document.getElementById('event-date') as HTMLInputElement).value;
  const place = (document.getElementById('event-place') as HTMLInputElement).value.trim();
  const category = (document.getElementById('event-category') as HTMLSelectElement).value as Event['category'];
  const capacity = parseInt((document.getElementById('event-capacity') as HTMLInputElement).value);

  if (!title || !description || !dateStr || !place || !category || capacity < 1) {
    showAlert('Veuillez remplir tous les champs correctement.', 'error');
    return;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    showAlert('Date invalide.', 'error');
    return;
  }

  // Création simple : l'administrateur crée un évènement sans authentification.
  // Le champ `creatorEmail` n'est plus requis ; un email système est utilisé par défaut.
  const newEvent = new Event(title, description, date, place, category, capacity);
  events.push(newEvent);
  
  eventForm.reset();
  showAlert(`Évènement "${title}" créé avec succès !`, 'success');
  renderEvents();
  
  // Scroll vers la liste
  document.getElementById('list')?.scrollIntoView({ behavior: 'smooth' });
}

// Création d'utilisateur (email unique)
function handleCreateUser(e: SubmitEvent): void {
  e.preventDefault();

  const name = (document.getElementById('user-name') as HTMLInputElement)?.value.trim();
  const email = (document.getElementById('user-email') as HTMLInputElement)?.value.trim().toLowerCase();

  if (!name || !email) {
    showAlert('Veuillez renseigner le nom et l’email.', 'error');
    return;
  }

  if (!User.isValidEmail(email)) {
    showAlert('Email invalide. Utilisez un email institutionnel (ex: nom@institution.edu).', 'error');
    return;
  }

  if (users.some(u => u.email === email)) {
    showAlert('Un utilisateur avec cet email existe déjà.', 'error');
    return;
  }

  const user = new User(name, email);
  users.push(user);

  userForm?.reset();
  showAlert(`Utilisateur "${name}" enregistré.`, 'success');
}

// Rendu des évènements
function renderEvents(): void {
  const filtered = getFilteredEvents();
  
  if (eventsCount) {
    eventsCount.textContent = `${filtered.length} évènement${filtered.length > 1 ? 's' : ''}`;
  }

  if (!eventsList) return;

  if (filtered.length === 0) {
    eventsList.innerHTML = '<p class="empty-state">Aucun évènement trouvé.</p>';
    return;
  }

  eventsList.innerHTML = filtered.map(event => {
    const registrationsCount = getRegistrationsForEvent(event.id).length;
    const seatsLeft = event.capacity - registrationsCount;
    const isFull = seatsLeft <= 0;
    const isPassed = event.isPassed();
    
    return `
      <div class="event-card ${isPassed ? 'passed' : ''} ${isFull ? 'full' : ''}">
        <div class="event-card-header">
          <h3>${escapeHtml(event.title)}</h3>
          <span class="event-category badge-${event.category}">${event.category}</span>
        </div>
        <div class="event-card-body">
          <p class="event-description">${escapeHtml(event.description)}</p>
          <div class="event-info">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>${formatDate(event.date)}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${escapeHtml(event.place)}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-users"></i>
              <span>${seatsLeft} place${seatsLeft > 1 ? 's' : ''} restante${seatsLeft > 1 ? 's' : ''} / ${event.capacity}</span>
            </div>
          </div>
        </div>
        <div class="event-card-footer">
          <button class="btn-secondary" onclick="showEventDetail('${event.id}')">
            <i class="fas fa-info-circle"></i> Détail
          </button>
          ${!isPassed ? `
            <button class="btn-secondary" onclick="editEvent('${event.id}')">
              <i class="fas fa-pen"></i> Modifier
            </button>
          ` : ''}
          <button class="btn-primary" ${isPassed || isFull ? 'disabled' : ''} onclick="showEventDetail('${event.id}', true)">
            <i class="fas fa-user-plus"></i> Participer
          </button>
          ${isPassed ? '<span class="badge-passed">Terminé</span>' : ''}
          ${isFull ? '<span class="badge-full">Complet</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Filtrage
function handleFilterChange(): void {
  currentFilters.category = filterCategory?.value || '';
  currentFilters.dateMin = filterDateMin?.value || '';
  currentFilters.dateMax = filterDateMax?.value || '';
  renderEvents();
}

function resetFilters(): void {
  currentFilters = { category: '', dateMin: '', dateMax: '' };
  if (filterCategory) filterCategory.value = '';
  if (filterDateMin) filterDateMin.value = '';
  if (filterDateMax) filterDateMax.value = '';
  renderEvents();
}

function getFilteredEvents(): Event[] {
  return events.filter(event => {
    if (currentFilters.category && event.category !== currentFilters.category) {
      return false;
    }
    if (currentFilters.dateMin) {
      const minDate = new Date(currentFilters.dateMin);
      minDate.setHours(0, 0, 0, 0);
      if (event.date < minDate) return false;
    }
    if (currentFilters.dateMax) {
      const maxDate = new Date(currentFilters.dateMax);
      maxDate.setHours(23, 59, 59, 999);
      if (event.date > maxDate) return false;
    }
    return true;
  });
}

// Détail d'un évènement
(window as any).showEventDetail = function(eventId: string, showRegistrationForm: boolean = false): void {
  const event = getEventById(eventId);
  if (!event) {
    showAlert('Évènement introuvable.', 'error');
    return;
  }

  const eventRegistrations = getRegistrationsForEvent(eventId);
  const seatsLeft = event.capacity - eventRegistrations.length;
  const isFull = seatsLeft <= 0;
  const isPassed = event.isPassed();

  modalBody.innerHTML = `
    <div class="event-detail">
      <h2>${escapeHtml(event.title)}</h2>
      <div class="detail-meta">
        <span class="badge-${event.category}">${event.category}</span>
        ${isPassed ? '<span class="badge-passed">Terminé</span>' : ''}
        ${isFull ? '<span class="badge-full">Complet</span>' : ''}
      </div>
      <div class="detail-content">
        <p><strong>Description :</strong></p>
        <p>${escapeHtml(event.description)}</p>
        <div class="detail-info-grid">
          <div class="detail-info-item">
            <i class="fas fa-calendar"></i>
            <div>
              <strong>Date et heure</strong>
              <p>${formatDate(event.date)}</p>
            </div>
          </div>
          <div class="detail-info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <strong>Lieu</strong>
              <p>${escapeHtml(event.place)}</p>
            </div>
          </div>
          <div class="detail-info-item">
            <i class="fas fa-users"></i>
            <div>
              <strong>Capacité</strong>
              <p>${seatsLeft} place${seatsLeft > 1 ? 's' : ''} restante${seatsLeft > 1 ? 's' : ''} / ${event.capacity}</p>
            </div>
          </div>
        </div>
        ${eventRegistrations.length > 0 ? `
          <div class="registrations-list">
            <h3>Inscrits (${eventRegistrations.length})</h3>
            <ul>
              ${eventRegistrations.map(reg => {
                const user = getUserById(reg.userId);
                return user ? `<li>${escapeHtml(user.name)} (${escapeHtml(user.email)})</li>` : '';
              }).join('')}
            </ul>
          </div>
        ` : '<p class="muted">Aucun inscrit pour le moment.</p>'}
      </div>
      ${showRegistrationForm && !isPassed && !isFull ? `
        <div class="registration-form-section">
          <h3>S'inscrire à cet évènement</h3>
          <form id="registration-form" class="form-grid">
            <label>
              Nom complet
              <input type="text" id="reg-name" required />
            </label>
            <label>
              Email institutionnel
              <input type="email" id="reg-email" required placeholder="exemple@institution.edu" />
            </label>
            <button type="submit" class="btn-primary">S'inscrire</button>
          </form>
        </div>
      ` : ''}
    </div>
  `;

  const registrationForm = document.getElementById('registration-form') as HTMLFormElement;
  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegistration(eventId);
    });
  }

  eventModal.setAttribute('aria-hidden', 'false');
  eventModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Ouverture du formulaire d'édition d'un évènement
(window as any).editEvent = function(eventId: string): void {
  const event = getEventById(eventId);
  if (!event) {
    showAlert('Évènement introuvable.', 'error');
    return;
  }
  if (event.isPassed()) {
    showAlert('Impossible de modifier un évènement passé.', 'error');
    return;
  }
  // Simplification : ouvrir directement le formulaire d'édition sans demander d'email.
  currentEditEventId = eventId;
  showEditForm(event);
};

function showEditForm(event: Event): void {
  modalBody.innerHTML = `
    <div class="event-detail">
      <h2>Modifier l'évènement</h2>
      <form id="edit-event-form" class="form-grid">
        <label>Intitulé
          <input type="text" id="edit-title" value="${escapeHtml(event.title)}" required />
        </label>
        <label>Description
          <textarea id="edit-description" rows="3" required>${escapeHtml(event.description)}</textarea>
        </label>
        <label>Date et heure
          <input type="datetime-local" id="edit-date" value="${toLocalDateTimeValue(event.date)}" required />
        </label>
        <label>Lieu
          <input type="text" id="edit-place" value="${escapeHtml(event.place)}" required />
        </label>
        <label>Catégorie
          <select id="edit-category" required>
            <option value="conférence" ${event.category === 'conférence' ? 'selected' : ''}>Conférence</option>
            <option value="sport" ${event.category === 'sport' ? 'selected' : ''}>Sport</option>
            <option value="atelier" ${event.category === 'atelier' ? 'selected' : ''}>Atelier</option>
            <option value="autre" ${event.category === 'autre' ? 'selected' : ''}>Autre</option>
          </select>
        </label>
        <label>Capacité (places)
          <input type="number" id="edit-capacity" min="1" value="${event.capacity}" required />
        </label>
        <button type="submit" class="btn-primary">Enregistrer</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
      </form>
    </div>
  `;

  const editForm = document.getElementById('edit-event-form') as HTMLFormElement | null;
  editForm?.addEventListener('submit', handleEditEvent);
  // Ouvrir la modal pour l'édition
  eventModal.setAttribute('aria-hidden', 'false');
  eventModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function handleEditEvent(e: SubmitEvent): void {
  e.preventDefault();
  if (!currentEditEventId) return;

  const event = getEventById(currentEditEventId);
  if (!event) {
    showAlert('Évènement introuvable.', 'error');
    return;
  }

  const title = (document.getElementById('edit-title') as HTMLInputElement)?.value.trim();
  const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value.trim();
  const dateStr = (document.getElementById('edit-date') as HTMLInputElement)?.value;
  const place = (document.getElementById('edit-place') as HTMLInputElement)?.value.trim();
  const category = (document.getElementById('edit-category') as HTMLSelectElement)?.value as Event['category'];
  const capacity = parseInt((document.getElementById('edit-capacity') as HTMLInputElement)?.value);

  if (!title || !description || !dateStr || !place || !category || capacity < 1) {
    showAlert('Veuillez remplir tous les champs correctement.', 'error');
    return;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    showAlert('Date invalide.', 'error');
    return;
  }

  const currentRegistrations = getRegistrationsForEvent(event.id).length;
  if (capacity < currentRegistrations) {
    showAlert(`Capacité trop basse. Inscrits actuels : ${currentRegistrations}.`, 'error');
    return;
  }

  event.title = title;
  event.description = description;
  event.date = date;
  event.place = place;
  event.category = category;
  event.capacity = capacity;

  showAlert('Évènement mis à jour.', 'success');
  currentEditEventId = null;
  closeModal();
  renderEvents();
}
function closeModal(): void {
  eventModal.setAttribute('aria-hidden', 'true');
  eventModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Inscription
function handleRegistration(eventId: string): void {
  const nameInput = document.getElementById('reg-name') as HTMLInputElement;
  const emailInput = document.getElementById('reg-email') as HTMLInputElement;
  
  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();

  if (!name || !email) {
    showAlert('Veuillez remplir tous les champs.', 'error');
    return;
  }

  if (!User.isValidEmail(email)) {
    showAlert('Email invalide. Utilisez un email institutionnel (ex: nom@institution.edu).', 'error');
    return;
  }

  const event = getEventById(eventId);
  if (!event) {
    showAlert('Évènement introuvable.', 'error');
    return;
  }

  if (event.isPassed()) {
    showAlert('Impossible de s\'inscrire à un évènement passé.', 'error');
    return;
  }

  const eventRegistrations = getRegistrationsForEvent(eventId);
  if (eventRegistrations.length >= event.capacity) {
    showAlert('L\'évènement est complet.', 'error');
    return;
  }

  // Chercher ou créer l'utilisateur
  // Chercher l'utilisateur existant (l'utilisateur doit exister avant inscription)
  let user = users.find(u => u.email === email.toLowerCase());
  if (!user) {
    showAlert('Utilisateur introuvable. Créez d\'abord un compte avec cet email avant de vous inscrire.', 'error');
    return;
  }

  // Vérifier si déjà inscrit
  if (isUserRegistered(eventId, user.id)) {
    showAlert('Vous êtes déjà inscrit à cet évènement.', 'error');
    return;
  }

  // Créer l'inscription
  const registration = new Registration(eventId, user.id);
  registrations.push(registration);

  showAlert(`Inscription réussie ! Bienvenue ${name}.`, 'success');
  closeModal();
  renderEvents();
}

// Fonctions utilitaires
function getEventById(id: string): Event | undefined {
  return events.find(e => e.id === id);
}

function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

function getRegistrationsForEvent(eventId: string): Registration[] {
  return registrations.filter(r => r.eventId === eventId);
}

function isUserRegistered(eventId: string, userId: string): boolean {
  return registrations.some(r => r.eventId === eventId && r.userId === userId);
}

function formatDate(date: Date): string {
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toLocalDateTimeValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function showAlert(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  if (!alertsContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  alertsContainer.appendChild(alert);
  
  // Auto-suppression après 5 secondes
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
}

// Menu responsive
function toggleMenu(): void {
  navMenu?.classList.toggle('active');
}

function closeMenu(): void {
  navMenu?.classList.remove('active');
}

// Theme toggle
function toggleTheme(): void {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains('dark-mode');
  
  if (isDarkMode) {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateThemeIcon(false);
  } else {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateThemeIcon(true);
  }
}

function initializeTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const isDarkMode = savedTheme === 'dark';
  
  // Apply dark mode if saved
  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode');
  } else {
    // Ensure light mode is set (remove dark-mode class)
    document.documentElement.classList.remove('dark-mode');
  }
  
  updateThemeIcon(isDarkMode);
}

function updateThemeIcon(isDarkMode: boolean): void {
  if (!themeToggle) return;
  
  const icon = themeToggle.querySelector('i');
  if (icon) {
    // Remove both classes first
    icon.classList.remove('fa-moon', 'fa-sun');
    // Add the appropriate icon
    if (isDarkMode) {
      icon.classList.add('fa-sun'); // Show sun icon in dark mode
    } else {
      icon.classList.add('fa-moon'); // Show moon icon in light mode
    }
  }
}

