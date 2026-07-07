const API_URL = 'http://localhost:8080/graphql';

// Types
interface Category { id: string; name: string; }
interface User { id: string; fullName: string; }
interface Review { id: string; rating: number; comment: string; user: User; }
interface Product { id: string; title: string; price: number; category: Category; reviews: Review[]; }
interface CartItem { product: Product; quantity: number; }

// State
let users: User[] = [];
let categories: Category[] = [];
let products: Product[] = [];
let cart: CartItem[] = [];
let currentUser: string = '';

// DOM Elements
const userSelect = document.getElementById('userSelect') as HTMLSelectElement;
const productGrid = document.getElementById('productGrid') as HTMLElement;
const cartCount = document.getElementById('cartCount') as HTMLElement;
const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
const btnPlaceOrder = document.getElementById('btnPlaceOrder') as HTMLButtonElement;

// GraphQL Fetcher
async function fetchGraphQL(query: string, variables: any = {}) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  } catch (err: any) {
    alert("GraphQL Xatolik: " + err.message);
    throw err;
  }
}

// Initial Data Load
async function loadData() {
  const query = `
    query {
      getAllUsers { id fullName }
      getAllCategories { id name }
      getAllProducts(page: 0, size: 50) {
        id title price
        category { name }
        reviews { id rating comment user { fullName } }
      }
    }
  `;
  const data = await fetchGraphQL(query);
  if (data) {
    users = data.getAllUsers;
    categories = data.getAllCategories;
    products = data.getAllProducts;
    renderUsers();
    renderCategories();
    renderProducts();
  }
}

// Render Functions
function renderUsers() {
  userSelect.innerHTML = '<option value="">-- Profil tanlang --</option>';
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.fullName;
    userSelect.appendChild(opt);
  });
  userSelect.value = currentUser;
}

function renderCategories() {
  const catSelect = document.getElementById('productCategory') as HTMLSelectElement;
  catSelect.innerHTML = '<option value="">Tanlang...</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    catSelect.appendChild(opt);
  });
}

function renderProducts() {
  productGrid.innerHTML = '';
  products.forEach(p => {
    const avgRating = p.reviews.length > 0 
      ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1)
      : '0.0';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-cat">${p.category?.name || 'Kategoriyasiz'}</div>
      <div class="product-title">${p.title}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <div class="product-reviews">⭐ ${avgRating} (${p.reviews.length} sharhlar)</div>
      
      <div class="card-actions">
        <button class="btn-secondary btn-review" data-id="${p.id}">💬 Sharh</button>
        <button class="btn-primary btn-cart" data-id="${p.id}">🛒 Savat</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer') as HTMLElement;
  const totalEl = document.getElementById('cartTotalPrice') as HTMLElement;
  
  container.innerHTML = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.quantity * item.product.price;
    total += itemTotal;
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <strong>${item.product.title}</strong><br>
        <small>${item.quantity} ta x $${item.product.price}</small>
      </div>
      <div>
        <strong>$${itemTotal.toFixed(2)}</strong>
        <button class="btn-secondary remove-cart" data-id="${item.product.id}" style="margin-left:1rem; padding:0.2rem 0.5rem">X</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  cartCount.textContent = cart.length.toString();
  totalEl.textContent = total.toFixed(2);
  
  btnPlaceOrder.style.display = cart.length > 0 ? 'inline-block' : 'none';
}

// Modal logic
function openModal(id: string) {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

// Event Listeners
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', closeModal);
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

userSelect.addEventListener('change', (e) => {
  currentUser = (e.target as HTMLSelectElement).value;
});

document.getElementById('btnNewUser')?.addEventListener('click', () => openModal('userModal'));
document.getElementById('btnNewProduct')?.addEventListener('click', () => openModal('productModal'));
document.getElementById('floatingCart')?.addEventListener('click', () => {
  renderCart();
  openModal('cartModal');
});

// Forms
document.getElementById('userForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullName = (document.getElementById('userName') as HTMLInputElement).value;
  const email = (document.getElementById('userEmail') as HTMLInputElement).value;
  const password = (document.getElementById('userPassword') as HTMLInputElement).value;
  
  const query = `
    mutation RegisterUser($fullName: String!, $email: String!, $password: String!) {
      registerUser(request: { fullName: $fullName, email: $email, password: $password }) { id }
    }
  `;
  await fetchGraphQL(query, { fullName, email, password });
  closeModal();
  (e.target as HTMLFormElement).reset();
  await loadData();
});

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = (document.getElementById('productTitle') as HTMLInputElement).value;
  const price = parseFloat((document.getElementById('productPrice') as HTMLInputElement).value);
  const categoryId = (document.getElementById('productCategory') as HTMLSelectElement).value;
  
  const query = `
    mutation CreateProduct($title: String!, $price: Float!, $categoryId: ID!) {
      createProduct(request: { title: $title, price: $price, categoryId: $categoryId }) { id }
    }
  `;
  await fetchGraphQL(query, { title, price, categoryId });
  closeModal();
  (e.target as HTMLFormElement).reset();
  await loadData();
});

document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return alert("Avval profilga kiring!");
  
  const productId = (document.getElementById('reviewProductId') as HTMLInputElement).value;
  const rating = parseInt((document.getElementById('reviewRating') as HTMLInputElement).value);
  const comment = (document.getElementById('reviewComment') as HTMLInputElement).value;
  
  const query = `
    mutation LeaveReview($productId: ID!, $userId: ID!, $rating: Int!, $comment: String!) {
      leaveReview(request: { productId: $productId, userId: $userId, rating: $rating, comment: $comment }) { id }
    }
  `;
  await fetchGraphQL(query, { productId, userId: currentUser, rating, comment });
  closeModal();
  (e.target as HTMLFormElement).reset();
  await loadData();
});

// Delegation for dynamic buttons
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  if (target.classList.contains('btn-review')) {
    const id = target.getAttribute('data-id');
    if (id) {
      (document.getElementById('reviewProductId') as HTMLInputElement).value = id;
      openModal('reviewModal');
    }
  }
  
  if (target.classList.contains('btn-cart')) {
    const id = target.getAttribute('data-id');
    const product = products.find(p => p.id === id);
    if (product) {
      const existing = cart.find(c => c.product.id === id);
      if (existing) existing.quantity++;
      else cart.push({ product, quantity: 1 });
      renderCart();
    }
  }
  
  if (target.classList.contains('remove-cart')) {
    const id = target.getAttribute('data-id');
    cart = cart.filter(c => c.product.id !== id);
    renderCart();
  }
});

btnPlaceOrder.addEventListener('click', async () => {
  if (!currentUser) return alert("Xarid qilish uchun profilga kiring!");
  if (cart.length === 0) return alert("Savat bo'sh!");
  
  const items = cart.map(c => ({ productId: c.product.id, quantity: c.quantity }));
  const query = `
    mutation PlaceOrder($userId: ID!, $items: [OrderItemRequest]!) {
      placeOrder(request: { userId: $userId, items: $items }) { id totalAmount }
    }
  `;
  
  await fetchGraphQL(query, { userId: currentUser, items });
  alert("Xarid muvaffaqiyatli yakunlandi! 🎉");
  cart = [];
  closeModal();
  renderCart();
});

// Init
loadData();
