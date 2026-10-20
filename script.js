const products = [...document.querySelectorAll('.product-card')];
const filterButtons = [...document.querySelectorAll('.filter-tab')];
const productCount = document.getElementById('product-count');
const emptyState = document.getElementById('empty-state');
const searchPanel = document.getElementById('search-panel');
const searchInput = document.getElementById('search-input');
const toast = document.getElementById('toast');
let activeFilter = 'Todos';
let toastTimer;
let cart = [];

document.getElementById('year').textContent = new Date().getFullYear();

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function applyFilters() {
  const term = (searchInput?.value || '').trim().toLocaleLowerCase('pt-BR');
  let visible = 0;
  products.forEach(card => {
    const matchesCategory = activeFilter === 'Todos' || card.dataset.category === activeFilter;
    const matchesSearch = !term || (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase('pt-BR').includes(term);
    const show = matchesCategory && matchesSearch;
    card.hidden = !show;
    if (show) visible++;
  });
  productCount.textContent = String(visible).padStart(2, '0') + (visible === 1 ? ' PRODUTO' : ' PRODUTOS');
  emptyState.hidden = visible > 0;
}

filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  applyFilters();
}));

document.querySelectorAll('[data-category-link]').forEach(link => link.addEventListener('click', () => {
  activeFilter = link.dataset.categoryLink;
  filterButtons.forEach(item => item.classList.toggle('active', item.dataset.filter === activeFilter));
  applyFilters();
}));

document.querySelector('.search-toggle').addEventListener('click', () => {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) searchInput.focus();
});
document.getElementById('search-close').addEventListener('click', () => {
  searchInput.value = '';
  searchPanel.hidden = true;
  applyFilters();
});
searchInput.addEventListener('input', applyFilters);

const mobileNav = document.getElementById('mobile-nav');
const menuToggle = document.getElementById('menu-toggle');
menuToggle.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const drawer = document.getElementById('cart-drawer');
const backdrop = document.getElementById('cart-backdrop');
function openCart() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.classList.add('locked');
}
function closeCart() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.classList.remove('locked');
}
document.getElementById('open-cart').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });

function formatPrice(value) {
  return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}
function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById('cart-count').textContent = quantity;
  document.getElementById('drawer-count').textContent = '(' + quantity + ')';
  document.getElementById('cart-total').textContent = formatPrice(total);
  const list = document.getElementById('cart-items');
  if (!cart.length) {
    list.innerHTML = '<p class="cart-empty">Sua sacola está vazia.<br>Encontre algo para acompanhar seu ritmo.</p>';
    return;
  }
  list.innerHTML = cart.map(item => `<div class="cart-item"><div><h3>${item.name}</h3><p>${formatPrice(item.price)} cada</p><div class="cart-item-actions"><button data-cart-action="minus" data-name="${item.name}" aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button data-cart-action="plus" data-name="${item.name}" aria-label="Aumentar quantidade">+</button><button data-cart-action="remove" data-name="${item.name}" aria-label="Remover produto">×</button></div></div><span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span></div>`).join('');
}
document.getElementById('produtos').addEventListener('click', event => {
  const button = event.target.closest('.quick-add');
  if (!button) return;
  const price = Number(button.dataset.price);
  if (!price) {
    notify('Preço e link de compra deste produto ainda precisam ser cadastrados.');
    return;
  }
  const name = button.dataset.product;
  const existing = cart.find(item => item.name === name);
  if (existing) existing.quantity++;
  else cart.push({name, price, quantity: 1});
  renderCart();
  notify(name + ' adicionado à sacola.');
});
document.getElementById('cart-items').addEventListener('click', event => {
  const button = event.target.closest('button[data-cart-action]');
  if (!button) return;
  const item = cart.find(entry => entry.name === button.dataset.name);
  if (!item) return;
  if (button.dataset.cartAction === 'plus') item.quantity++;
  if (button.dataset.cartAction === 'minus') item.quantity--;
  if (button.dataset.cartAction === 'remove' || item.quantity <= 0) cart = cart.filter(entry => entry.name !== button.dataset.name);
  renderCart();
});
document.getElementById('checkout-button').addEventListener('click', () => {
  if (!cart.length) {
    notify('Sua sacola ainda está vazia.');
    return;
  }
  notify('Checkout ainda não configurado. Adicione seu link de pagamento antes de publicar.');
});
document.getElementById('newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  notify('Cadastro demonstrativo: conecte um serviço de e-mail para receber inscrições.');
  document.getElementById('newsletter-message').textContent = 'Para receber inscrições, conecte um serviço de e-mail.';
  event.target.reset();
});
applyFilters();
renderCart();