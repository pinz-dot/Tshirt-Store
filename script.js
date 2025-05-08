let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let productSales = JSON.parse(localStorage.getItem('productSales')) || {};

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
    const notification = document.getElementById('cart-notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Fungsi untuk format Rupiah
function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(event) {
    event.stopPropagation();
    
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang');
        window.location.href = 'login.html';
        return;
    }

    const product = {
        id: event.target.dataset.id,
        name: event.target.dataset.name,
        price: event.target.dataset.price.replace(/\./g, ''),
        image: event.target.dataset.image,
        quantity: 1
    };

    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push(product);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    showNotification(`${product.name} ditambahkan ke keranjang`);
    updateCartModal();
}

// Fungsi untuk memperbarui jumlah keranjang
function updateCartCount() {
    cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.classList.add('cart-count-animation');
        setTimeout(() => {
            cartCountElement.classList.remove('cart-count-animation');
        }, 300);
    }
}

// Fungsi untuk memperbarui modal keranjang
function updateCartModal() {
    const cartList = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('cart-total-price');
    
    if (cartList && totalPriceElement) {
        cartList.innerHTML = '';
        
        let totalPrice = 0;

        cartItems.forEach((item, index) => {
            const itemPrice = parseInt(item.price) * (item.quantity || 1);
            totalPrice += itemPrice;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="50">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">Rp ${formatRupiah(item.price)} x ${item.quantity || 1}</span>
                    <span class="cart-item-total">Rp ${formatRupiah(itemPrice)}</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
            `;
            cartList.appendChild(li);
        });

        totalPriceElement.textContent = formatRupiah(totalPrice);
        
        const buyNowButton = document.getElementById('buy-now');
        if (buyNowButton) {
            buyNowButton.style.display = cartItems.length > 0 ? 'block' : 'none';
        }
    }
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    updateCartModal();
    
    if (window.location.pathname.includes('payment.html')) {
        loadCartItems();
    }
}

// Fungsi untuk toggle keranjang
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.toggle('hidden');
        if (!cartModal.classList.contains('hidden')) {
            updateCartModal();
        }
    }
}

// Fungsi untuk menutup keranjang
function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('hidden');
    }
}

// Fungsi untuk beli sekarang (dari keranjang)
function buyNow() {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk melakukan pembelian');
        window.location.href = 'login.html';
        return;
    }

    if (cartItems.length > 0) {
        window.location.href = 'payment.html';
    } else {
        alert('Keranjang Anda kosong!');
    }
}

// Fungsi untuk beli sekarang (langsung)
function buyNowSingle(event) {
    event.stopPropagation();
    
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk melakukan pembelian');
        window.location.href = 'login.html';
        return;
    }

    const product = {
        id: event.target.dataset.id,
        name: event.target.dataset.name,
        price: event.target.dataset.price.replace(/\./g, ''),
        image: event.target.dataset.image,
        quantity: 1
    };

    localStorage.setItem('cartItems', JSON.stringify([product]));
    window.location.href = 'payment.html';
}

// Fungsi untuk menampilkan detail produk
function showProductDetails(event) {
    event.stopPropagation();
    
    const card = event.currentTarget;
    const product = {
        id: card.dataset.id,
        name: card.dataset.name || card.querySelector('h2').textContent,
        price: card.dataset.price || card.querySelector('.price').textContent.replace('Rp ', '').replace(/\./g, ''),
        image: card.dataset.image || card.querySelector('img').src,
        description: card.dataset.description || 'Deskripsi produk tidak tersedia.'
    };

    // Ambil data penjualan
    const salesCount = productSales[product.id] || 0;

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p class="price">Rp ${formatRupiah(product.price)}</p>
            <div class="description-container">
                <h3>Deskripsi Produk:</h3>
                <div class="description">${product.description}</div>
            </div>
            <div class="sales-count">Terjual: ${salesCount}</div>
            <div class="modal-buttons">
                <button class="buy-now-btn" 
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    onclick="buyNowSingle(event)">Beli Sekarang</button>
                <button data-id="${product.id}" 
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    onclick="addToCart(event)">Tambah ke Keranjang</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    modal.querySelector('.close-modal').onclick = function() {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    };
}

// Fungsi untuk pencarian produk
function searchProducts() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    const resultsMessage = document.getElementById('search-results-message');
    
    let foundAny = false;

    productCards.forEach(card => {
        const productName = card.querySelector('h2').textContent.toLowerCase();
        if (productName.includes(searchInput)) {
            card.style.display = 'flex';
            foundAny = true;
        } else {
            card.style.display = 'none';
        }
    });

    if (searchInput && !foundAny) {
        resultsMessage.classList.remove('hidden');
    } else {
        resultsMessage.classList.add('hidden');
    }
}

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const isLoggedIn = currentUser !== null;
    const userMenu = document.getElementById('user-menu');
    
    if (userMenu) {
        if (isLoggedIn) {
            userMenu.innerHTML = `
                <a href="profile.html"><i class="fas fa-user"></i> Profil</a>
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
            `;
        } else {
            userMenu.innerHTML = `
                <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                <a href="register.html"><i class="fas fa-user-plus"></i> Register</a>
            `;
        }
    }
}

// Fungsi untuk logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    checkLoginStatus();
    window.location.href = 'index.html';
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    checkLoginStatus();
    
    // Tambahkan event click ke semua product card
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', showProductDetails);
    });

    // Event listener untuk input pencarian
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }

    // Tutup menu user saat klik di luar
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(event.target)) {
            const menuContent = document.querySelector('.user-menu-content');
            if (menuContent) {
                menuContent.style.display = 'none';
            }
        }
    });
});

