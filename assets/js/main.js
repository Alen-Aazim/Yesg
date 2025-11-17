// main.js - handles product loading, featured, nav counts, contact form
(() => {
  const YEAR = new Date().getFullYear();
  document.getElementById('year') && (document.getElementById('year').textContent = YEAR);
  for (let i=2;i<=6;i++) document.getElementById('year'+i) && (document.getElementById('year'+i).textContent = YEAR);

  const defaultProducts = [
    {id:'p1',title:'4K CCTV Camera',category:'CCTV',price:4999,image:'/assets/images/p1.jpg',description:'4K weatherproof CCTV camera.'},
    {id:'p2',title:'Uninterruptible Power Supply',category:'Power',price:8999,image:'/assets/images/p2.jpg',description:'UPS for home and office.'},
    {id:'p3',title:'Smart Switch (Automation)',category:'Automation',price:1299,image:'/assets/images/p3.jpg',description:'Control lights remotely.'},
    {id:'p4',title:'Solar Inverter',category:'Solar',price:28999,image:'/assets/images/p4.jpg',description:'High efficiency inverter.'}
  ];

  // Ensure products exist in localStorage
  if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(defaultProducts));

  // Function to get products, now fetches from API
  async function getProducts(){
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Could not fetch products:", error);
      // Fallback to localStorage if API fails
      return JSON.parse(localStorage.getItem('products')||'[]');
    }
  }

  // Featured on home
  const featuredGrid = document.getElementById('featured-grid');
  if(featuredGrid){
    getProducts().then(allProducts => {
      const products = allProducts.slice(0,3);
      featuredGrid.innerHTML = products.map(p => `
      <div class="card product-card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>₹${p.price}</p>
        <a class="btn" href="product-details.html?id=${p.id}">View</a>
      </div>
    `).join('');
    });
  }

  // Products page
  const productsGrid = document.getElementById('products-grid');
  const categoryFilter = document.getElementById('category-filter');
  if(productsGrid){
    getProducts().then(products => {
      const categories = [...new Set(products.map(p=>p.category))];
      categories.forEach(c=>{const opt=document.createElement('option');opt.value=c;opt.textContent=c;categoryFilter.appendChild(opt)})

      async function render(filter='all'){
        const list = (await getProducts()).filter(p=>filter==='all'||p.category===filter);
      productsGrid.innerHTML = list.map(p=>`
        <div class="card product-card">
          <img src="${p.image}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>₹${p.price}</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <a class="btn" href="product-details.html?id=${p.id}">Details</a>
            <button class="btn add-product" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.add-product').forEach(b=>b.addEventListener('click',e=>{
        const id=e.currentTarget.dataset.id; addToCartById(id); updateCartCount(); alert('Added to cart')
      }));
    }

    render();
      categoryFilter && categoryFilter.addEventListener('change', e=>render(e.target.value));
    })();
  }

  // Product details page
  const pd = document.getElementById('product-detail');
  if(pd){
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    getProducts().then(products => {
      const product = products.find(p=>p.id===id);
    if(!product){pd.innerHTML='<p>Product not found.</p>';return}
    pd.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <div>
        <h1>${product.title}</h1>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p>${product.description || ''}</p>
        <div style="margin-top:12px">
          <button class="btn add-btn">Add to Cart</button>
        </div>
      </div>
    `;
    pd.querySelector('.add-btn').addEventListener('click', ()=>{addToCartById(product.id); updateCartCount(); alert('Added to cart')});
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      alert('Message sent .');
      contactForm.reset();
    })
  }

  // Expose cart functions to window for cart.js to use
  window.getProducts = getProducts;

  // Cart utilities
  function getCart(){return JSON.parse(localStorage.getItem('cart')||'[]')}
  function saveCart(c){localStorage.setItem('cart', JSON.stringify(c))}
  function addToCartById(id){
    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(item) item.qty++;
    else cart.push({id, qty:1});
    saveCart(cart);
  }
  function updateCartCount(){
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
  }

  // initial cart count
  updateCartCount();

  // Admin helper
  window.adminEnsureLogin = function(){
    const logged = sessionStorage.getItem('admin_logged');
    if(!logged) location.href = '/admin/login.html';
  }

})();