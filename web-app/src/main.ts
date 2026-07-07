const API_URL = 'http://localhost:8080/graphql';
const UPLOAD_URL = 'http://localhost:8080/api/upload';

// Types
interface Category { id: string; name: string; }
interface User { id: string; fullName: string; email: string; role: string; }
interface Review { id: string; rating: number; comment: string; user: User; }
interface Product { id: string; title: string; price: number; imageUrl: string; category: Category; reviews: Review[]; }
interface CartItem { product: Product; quantity: number; }

// State
let categories: Category[] = [];
let products: Product[] = [];
let cart: CartItem[] = [];
let currentUserToken: string = localStorage.getItem('token') || '';
let currentRole: string = localStorage.getItem('role') || '';
let currentUserEmail: string = localStorage.getItem('email') || '';

// DOM Elements
const productGrid = document.getElementById('productGrid') as HTMLElement;
const cartCount = document.getElementById('cartCount') as HTMLElement;
const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
const btnPlaceOrder = document.getElementById('btnPlaceOrder') as HTMLButtonElement;
const userInfo = document.getElementById('userInfo') as HTMLElement;
const btnLoginOpen = document.getElementById('btnLoginOpen') as HTMLButtonElement;
const btnNewUser = document.getElementById('btnNewUser') as HTMLButtonElement;
const btnLogout = document.getElementById('btnLogout') as HTMLButtonElement;
const btnAdminDashboard = document.getElementById('btnAdminDashboard') as HTMLButtonElement;
const adminActions = document.getElementById('adminActions') as HTMLElement;

// Search Elements
const searchTitle = document.getElementById('searchTitle') as HTMLInputElement;
const searchCategory = document.getElementById('searchCategory') as HTMLSelectElement;
const searchMinPrice = document.getElementById('searchMinPrice') as HTMLInputElement;
const searchMaxPrice = document.getElementById('searchMaxPrice') as HTMLInputElement;

// GraphQL Fetcher
async function fetchGraphQL(query: string, variables: any = {}) {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (currentUserToken) headers['Authorization'] = `Bearer ${currentUserToken}`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
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
  updateUIForUser();
  await loadCategories();
  await performSearch();
}

async function loadCategories() {
  const data = await fetchGraphQL(`query { getAllCategories { id name } }`);
  if (data) {
    categories = data.getAllCategories;
    renderCategories();
  }
}

async function performSearch() {
  const title = searchTitle.value || null;
  const categoryId = searchCategory.value || null;
  const minPrice = searchMinPrice.value ? parseFloat(searchMinPrice.value) : null;
  const maxPrice = searchMaxPrice.value ? parseFloat(searchMaxPrice.value) : null;

  const query = `
    query Search($title: String, $categoryId: ID, $minPrice: Float, $maxPrice: Float) {
      searchProducts(title: $title, categoryId: $categoryId, minPrice: $minPrice, maxPrice: $maxPrice, page: 0, size: 50) {
        id title price imageUrl
        category { name }
        reviews { id rating comment user { fullName } }
      }
    }
  `;
  const data = await fetchGraphQL(query, { title, categoryId, minPrice, maxPrice });
  if (data) {
    products = data.searchProducts;
    renderProducts();
  }
}

function updateUIForUser() {
  if (currentUserToken) {
    userInfo.textContent = `Salom, ${currentUserEmail}`;
    userInfo.style.display = 'inline';
    btnLoginOpen.style.display = 'none';
    btnNewUser.style.display = 'none';
    btnLogout.style.display = 'inline-block';

    if (currentRole === 'ADMIN') {
      btnAdminDashboard.style.display = 'inline-block';
      adminActions.style.display = 'block';
    } else {
      btnAdminDashboard.style.display = 'none';
      adminActions.style.display = 'none';
    }
  } else {
    userInfo.style.display = 'none';
    btnLoginOpen.style.display = 'inline-block';
    btnNewUser.style.display = 'inline-block';
    btnLogout.style.display = 'none';
    btnAdminDashboard.style.display = 'none';
    adminActions.style.display = 'none';
  }
}

// Event Listeners for Search
searchTitle.addEventListener('input', performSearch);
searchCategory.addEventListener('change', performSearch);
searchMinPrice.addEventListener('input', performSearch);
searchMaxPrice.addEventListener('input', performSearch);

// Render Functions
function renderCategories() {
  const options = '<option value="">Barcha Kategoriyalar</option>' + 
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  searchCategory.innerHTML = options;
  const productCat = document.getElementById('productCategory') as HTMLSelectElement;
  if(productCat) productCat.innerHTML = options;
}

function renderProducts() {
  productGrid.innerHTML = '';
  products.forEach(p => {
    const avgRating = p.reviews.length > 0 
      ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1)
      : '0.0';

    const imgTag = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:1rem;">` : '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${imgTag}
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
  const paymentSection = document.getElementById('paymentSection') as HTMLElement;
  
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
  
  if (cart.length > 0) {
    btnPlaceOrder.style.display = 'inline-block';
    paymentSection.style.display = 'block';
  } else {
    btnPlaceOrder.style.display = 'none';
    paymentSection.style.display = 'none';
  }
}

// Modals
function openModal(id: string) {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

btnLoginOpen.addEventListener('click', () => openModal('loginModal'));
btnNewUser.addEventListener('click', () => openModal('userModal'));
document.getElementById('btnNewProduct')?.addEventListener('click', () => openModal('productModal'));
document.getElementById('floatingCart')?.addEventListener('click', () => { renderCart(); openModal('cartModal'); });

btnLogout.addEventListener('click', () => {
  localStorage.clear();
  currentUserToken = '';
  currentRole = '';
  currentUserEmail = '';
  updateUIForUser();
});

btnAdminDashboard.addEventListener('click', () => {
  alert("Bu yerda kelajakda chiroyli qizil rangli ADMIN Boshqaruv paneli ochiladi!");
});

// Forms
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
  const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
  
  const query = `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) }`;
  const data = await fetchGraphQL(query, { email, password });
  
  if (data && data.login) {
    const token = data.login;
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    currentUserToken = token;
    currentRole = payload.role;
    currentUserEmail = email;
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', currentRole);
    localStorage.setItem('email', email);
    
    closeModal();
    (e.target as HTMLFormElement).reset();
    updateUIForUser();
    alert("Tizimga kirdingiz!");
  }
});

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
  alert("Ro'yxatdan o'tdingiz, endi tizimga kiring!");
});

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (currentRole !== 'ADMIN') return alert("Faqat Adminlar qo'sha oladi!");

  const title = (document.getElementById('productTitle') as HTMLInputElement).value;
  const price = parseFloat((document.getElementById('productPrice') as HTMLInputElement).value);
  const categoryId = (document.getElementById('productCategory') as HTMLSelectElement).value;
  const fileInput = document.getElementById('productImage') as HTMLInputElement;

  let imageUrl = null;
  if (fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    imageUrl = await res.text();
  }
  
  const query = `
    mutation CreateProduct($title: String!, $price: Float!, $categoryId: ID!, $imageUrl: String) {
      createProduct(request: { title: $title, price: $price, categoryId: $categoryId, imageUrl: $imageUrl }) { id }
    }
  `;
  await fetchGraphQL(query, { title, price, categoryId, imageUrl });
  closeModal();
  (e.target as HTMLFormElement).reset();
  await performSearch();
});

document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUserToken) return alert("Avval tizimga kiring!");
  
  const productId = (document.getElementById('reviewProductId') as HTMLInputElement).value;
  const rating = parseInt((document.getElementById('reviewRating') as HTMLInputElement).value);
  const comment = (document.getElementById('reviewComment') as HTMLInputElement).value;
  
  const query = `
    mutation LeaveReview($productId: ID!, $userId: ID!, $rating: Int!, $comment: String!) {
      leaveReview(request: { productId: $productId, userId: $userId, rating: $rating, comment: $comment }) { id }
    }
  `;
  // Mock userId as 1 for now since we don't fetch my user info directly. In a real app we fetch "me" from JWT.
  await fetchGraphQL(query, { productId, userId: "1", rating, comment });
  closeModal();
  (e.target as HTMLFormElement).reset();
  await performSearch();
});

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
  if (!currentUserToken) return alert("Xarid qilish uchun tizimga kiring!");
  if (cart.length === 0) return alert("Savat bo'sh!");

  const creditCard = (document.getElementById('creditCard') as HTMLInputElement).value;
  
  const items = cart.map(c => ({ productId: c.product.id, quantity: c.quantity }));
  const query = `
    mutation PlaceOrder($userId: ID!, $items: [OrderItemRequest]!, $creditCard: String) {
      placeOrder(request: { userId: $userId, items: $items, creditCardNumber: $creditCard }) { id status }
    }
  `;
  
  try {
    const data = await fetchGraphQL(query, { userId: "1", items, creditCard });
    if(data.placeOrder.status === 'PAID') {
        alert("Xarid muvaffaqiyatli yakunlandi! To'lov qabul qilindi. 🎉");
    } else {
        alert("Buyurtma olindi, lekin to'lov qilinmadi (PENDING).");
    }
    cart = [];
    closeModal();
    renderCart();
  } catch(e) {}
});

// Init
loadData();
