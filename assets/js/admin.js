(() => {

  const DEMO_USER = 'faisal';
  const DEMO_PASS = 'faisal1424';

  async function getProducts(){
    try {
      const res = await fetch('/api/products');
      return await res.json();
    } catch {
      return [];
    }
  }
  async function saveProducts(p){
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(p)
      });
    } catch (error) {
      console.error('Failed to save products:', error);
    }
  }

  
  const loginForm = document.getElementById('admin-login');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const u = loginForm.username.value, p = loginForm.password.value;
      if(u===DEMO_USER && p===DEMO_PASS){ sessionStorage.setItem('admin_logged','1'); location.href = '/admin/dashboard.html'; }
      else alert('Invalid credentials');
    })
  }


  if(location.pathname.startsWith('/admin') && !location.pathname.endsWith('login.html')){
    if(!sessionStorage.getItem('admin_logged')) location.href = '/admin/login.html';
  }


  const logout = document.getElementById('admin-logout');
  const logout2 = document.getElementById('admin-logout2');
  if(logout) logout.addEventListener('click', e=>{e.preventDefault(); sessionStorage.removeItem('admin_logged'); location.href='/admin/login.html';});
  if(logout2) logout2.addEventListener('click', e=>{e.preventDefault(); sessionStorage.removeItem('admin_logged'); location.href='/admin/login.html';});


  const prodCount = document.getElementById('admin-products-count');
  const cartTotal = document.getElementById('admin-cart-total');
  if(prodCount) getProducts().then(p => prodCount.textContent = p.length);
  if(cartTotal) cartTotal.textContent = (JSON.parse(localStorage.getItem('cart')||'[]')).length;


  const productForm = document.getElementById('product-form');
  const adminList = document.getElementById('admin-products-list');
  if(productForm){
    function resetForm(){productForm.id.value=''; productForm.title.value=''; productForm.category.value=''; productForm.price.value=''; productForm.image.value=''; productForm.description.value=''}
    async function renderList(){
      const products = await getProducts();
      adminList.innerHTML = products.map(p=>`
        <div class="card">
          <img src="${p.image}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px">
          <h4>${p.title}</h4>
          <p>₹${p.price} · ${p.category}</p>
          <div style="display:flex;gap:8px">
            <button class="btn edit" data-id="${p.id}">Edit</button>
            <button class="btn remove" data-id="${p.id}">Delete</button>
          </div>
        </div>
      `).join('');

      adminList.querySelectorAll('.edit').forEach(b=>b.addEventListener('click',async e=>{
        const id = e.currentTarget.dataset.id; const products = await getProducts(); const p = products.find(x=>x.id===id);
        productForm.id.value = p.id; productForm.title.value = p.title; productForm.category.value = p.category; productForm.price.value = p.price; productForm.image.value = p.image; productForm.description.value = p.description;
      }));
      adminList.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', async e=>{
        if(!confirm('Delete product?')) return; const id=e.currentTarget.dataset.id; const products = await getProducts(); const newP = products.filter(x=>x.id!==id); await saveProducts(newP); renderList();
      }));
    }

    productForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const id = productForm.id.value || ('p'+Date.now());
      const p = {id, title:productForm.title.value, category:productForm.category.value, price:parseFloat(productForm.price.value||0), image:productForm.image.value||'/assets/images/placeholder.jpg', description:productForm.description.value};
      let products = await getProducts();
      const existing = products.find(x=>x.id===id);
      if(existing){ products = products.map(x=> x.id===id ? p : x); }
      else { products.unshift(p); }
      await saveProducts(products); renderList(); resetForm(); alert('Saved');
    });

    document.getElementById('new-product').addEventListener('click', ()=>{productForm.id.value=''; productForm.title.value=''; productForm.price.value=''; productForm.image.value=''; productForm.description.value=''});

    renderList();
  }

})();