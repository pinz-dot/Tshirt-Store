// Fungsi untuk format mata uang Rupiah
function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk menyimpan order dan update penjualan produk
function saveOrder(orderData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    // 1. Simpan ke riwayat transaksi user
    const userOrders = JSON.parse(localStorage.getItem('user_orders_' + currentUser.email)) || [];
    userOrders.push(orderData);
    localStorage.setItem('user_orders_' + currentUser.email, JSON.stringify(userOrders));
    
    // 2. Update jumlah penjualan produk
    let productSales = JSON.parse(localStorage.getItem('productSales')) || {};
    
    orderData.items.forEach(item => {
        const productId = item.id.toString(); // Pastikan ID sebagai string
        if (!productSales[productId]) {
            productSales[productId] = 0;
        }
        productSales[productId] += item.quantity || 1;
    });
    
    localStorage.setItem('productSales', JSON.stringify(productSales));
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
}

// Fungsi untuk memuat item keranjang
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const orderContainer = document.getElementById('order-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const totalElement = document.getElementById('total-price');

    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (orderContainer) orderContainer.innerHTML = '';
        if (totalElement) totalElement.textContent = '0';
        return;
    } else {
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    }

    let total = 0;
    if (orderContainer) {
        orderContainer.innerHTML = '';
        
        cartItems.forEach(item => {
            const price = parseInt(item.price);
            const quantity = item.quantity || 1;
            const subtotal = price * quantity;
            total += subtotal;

            const li = document.createElement('li');
            li.className = 'order-item';
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="50">
                <div class="order-item-info">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-quantity">${quantity}x</span>
                    <span class="order-item-price">Rp ${formatRupiah(price)}</span>
                </div>
                <span class="order-item-total">Rp ${formatRupiah(subtotal)}</span>
            `;
            orderContainer.appendChild(li);
        });
    }

    if (totalElement) {
        totalElement.textContent = formatRupiah(total);
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();

    // Handle payment method selection
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-details').forEach(div => {
                div.classList.add('hidden');
            });
            
            const detailsId = this.value + '-details';
            const detailsElement = document.getElementById(detailsId);
            if (detailsElement) {
                detailsElement.classList.remove('hidden');
            }
        });
    });

    // Handle form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('customer-name').value.trim();
            const address = document.getElementById('customer-address').value.trim();
            const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Validasi form
            if (!name || !address || !paymentMethod) {
                alert('Harap lengkapi semua data pembayaran!');
                return;
            }

            if (cartItems.length === 0) {
                alert('Keranjang belanja kosong!');
                return;
            }

            // Hitung total
            const total = cartItems.reduce((sum, item) => {
                return sum + (parseInt(item.price) * (item.quantity || 1));
            }, 0);

            // Buat data order
            const orderData = {
                items: cartItems.map(item => ({...item})), // Clone array
                total: total,
                customer: {
                    name: name,
                    address: address,
                    notes: document.getElementById('customer-notes').value.trim()
                },
                paymentMethod: paymentMethod.value,
                date: new Date().toISOString(),
                status: 'completed'
            };

            // Simpan order dan update penjualan
            saveOrder(orderData);
            
            // Kosongkan keranjang dan redirect
            localStorage.removeItem('cartItems');
            window.location.href = 'thank-you.html';
        });
    }
});

