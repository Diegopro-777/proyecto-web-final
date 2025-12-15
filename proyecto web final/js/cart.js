let cart = [];
const cartListDiv = document.getElementById('cart-list');
const cartTotalSpan = document.getElementById('cart-total');
const cartCountLink = document.getElementById('cart-count');
const cartCountPage = document.getElementById('cart-count-page');



const saveCartToLocalStorage = () => {
    localStorage.setItem('supplemenCart', JSON.stringify(cart));
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountLink) {
        cartCountLink.textContent = totalItems;
    }
};

const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem('supplemenCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
};



const renderCart = () => {
    saveCartToLocalStorage();

    if (!cartListDiv) return;

    cartListDiv.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartListDiv.innerHTML = '<p class="empty-cart-message">Tu carrito de compras está vacío. 😢</p>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalItems += item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');


            cartItemDiv.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)} c/u</p>
                </div>
                <div class="item-controls">
                    <span class="item-quantity">Cantidad: ${item.quantity}</span>
                    <span class="item-subtotal">Total: $${itemTotal.toFixed(2)}</span>
                    <button class="btn delete-btn remove-from-cart-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartListDiv.appendChild(cartItemDiv);
        });
    }


    if (cartTotalSpan) cartTotalSpan.textContent = total.toFixed(2);
    if (cartCountPage) cartCountPage.textContent = totalItems;


    if (cartCountLink) cartCountLink.textContent = totalItems;
};





/**
 * Agrega un producto por su ID al carrito.
 * @param {string} productId - ID del producto a agregar.
 */

const addToCart = (productId) => {

    const productData = window.getSupplements ? window.getSupplements() : [];

    if (productData.length === 0 && !window.areProductsLoaded()) {
        alert("El catálogo aún se está cargando o ha fallado. Inténtalo de nuevo.");
        return;
    }


    const productToAdd = productData.find(p => p.id === productId);

    if (!productToAdd) {
        console.error(`Producto con ID ${productId} no encontrado en el catálogo.`);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {

        cart.push({
            id: productToAdd.id,
            name: productToAdd.name,
            price: productToAdd.price,
            quantity: 1
        });
    }

    renderCart();


    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    alert(`${productToAdd.name} agregado al carrito! Tienes ${totalItems} ítems.`);
};


const removeFromCart = (index) => {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    renderCart();
};

const clearCart = () => {
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
        cart = [];
        renderCart();
    }
};

const checkout = () => {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
        return;
    }
    alert('Compra finalizada con éxito! Total a pagar: $' + cartTotalSpan.textContent);
    clearCart();

};



document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    renderCart();

    document.addEventListener('click', (e) => {

        if (e.target.classList.contains('add-to-cart-btn')) {
            e.preventDefault();
            const productId = e.target.dataset.id;

            if (productId) {
                addToCart(productId);
            }
        }


        if (e.target.classList.contains('remove-from-cart-btn')) {
            const itemIndex = parseInt(e.target.dataset.index);
            if (!isNaN(itemIndex)) {
                removeFromCart(itemIndex);
            }
        }


        if (e.target.classList.contains('clear-cart-btn')) {
            clearCart();
        }


        if (e.target.classList.contains('checkout-btn')) {
            checkout();
        }
    });
});