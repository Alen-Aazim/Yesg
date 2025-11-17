
// cart.js - handles cart display and management
(() => {
  function getCart(){return JSON.parse(localStorage.getItem('cart')||'[]')}
  function saveCart(c){localStorage.setItem('cart', JSON.stringify(c))}
  async function getProducts(){
    try {
      const res = await fetch('/api/products');
      return await res.json();
    } catch {
      return [];
    }
  }

  const cartItems = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  const clearBtn = document.getElementById('clear-cart');
  const checkoutBtn = document.getElementById('checkout');

  async function render(){
    // Guard clause for missing elements
    if(!cartItems || !cartSummary) {
      console.warn('Cart elements not found on page');
      return;
    }
    
    const cart = getCart();
    const products = await getProducts();
    
    if(cart.length === 0){
      cartItems.innerHTML = '<p style="text-align:center; color:var(--muted); padding:40px 0;">Your cart is empty.</p>';
      cartSummary.innerHTML = '<p><strong>Total:</strong> ₹0</p>';
      return;
    }

    let total = 0;
    const html = cart.map(item=>{
      const product = products.find(p=>p.id===item.id);
      if(!product) return '';
      const subtotal = product.price * item.qty;
      total += subtotal;
      return `
        <div class="card" data-id="${item.id}" style="margin-bottom:16px; padding:16px; display:flex; gap:16px; align-items:center;">
          <img src="${product.image}" alt="${product.title}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
          <div style="flex:1;">
            <h3 style="margin:0 0 8px 0;">${product.title}</h3>
            <p style="margin:0; color:var(--muted);">₹${product.price} each</p>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn dec" style="padding:8px 14px;">−</button>
            <span style="min-width:30px; text-align:center; font-weight:600;">${item.qty}</span>
            <button class="btn inc" style="padding:8px 14px;">+</button>
          </div>
          <div style="min-width:100px; text-align:right;">
            <p style="margin:0; font-weight:700; font-size:1.1rem;">₹${subtotal}</p>
          </div>
          <button class="btn remove" style="background:#ff6b6b; color:white; padding:8px 14px;">×</button>
        </div>
      `;
    }).join('');

    cartItems.innerHTML = html;
    cartSummary.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0;">Total:</h2>
        <h2 style="margin:0; color:var(--accent);">₹${total}</h2>
      </div>
    `;

    // Event listeners
    document.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', e=>{
      const id = e.target.closest('.card').dataset.id;
      const newCart = getCart().filter(i=>i.id!==id);
      saveCart(newCart); render(); updateCounts();
    }));
    document.querySelectorAll('.inc').forEach(b=>b.addEventListener('click', e=>{
      const id = e.target.closest('.card').dataset.id;
      const cart = getCart(); const it = cart.find(i=>i.id===id); it.qty++; saveCart(cart); render(); updateCounts();
    }));
    document.querySelectorAll('.dec').forEach(b=>b.addEventListener('click', e=>{
      const id = e.target.closest('.card').dataset.id;
      const cart = getCart(); const it = cart.find(i=>i.id===id); 
      if(it.qty>1) it.qty--; 
      else{ const nc = cart.filter(i=>i.id!==id); saveCart(nc); render(); updateCounts(); return; } 
      saveCart(cart); render(); updateCounts();
    }));
  }

  function updateCounts(){
    const count = getCart().reduce((s,i)=>s + i.qty,0);
    document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
  }

  if(clearBtn) clearBtn.addEventListener('click', ()=>{
    if(confirm('Clear all items from cart?')){
      localStorage.removeItem('cart'); render(); updateCounts();
    }
  });
  
  if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{
    const cart = getCart();
    if(cart.length === 0){
      alert('Your cart is empty!');
      return;
    }
    alert('Contact whatsapp or  Call Us '); 
    localStorage.removeItem('cart'); render(); updateCounts();
  });

  render(); updateCounts();
})();
