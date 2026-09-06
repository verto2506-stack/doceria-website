// Sistema de Carrinho e Pedidos
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartBadge();
    }

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ name, price, quantity: 1 });
        }
        
        this.save();
        this.showNotification(`${name} adicionado ao carrinho! 🛒`);
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.save();
    }

    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
        } else {
            this.items[index].quantity = quantity;
            this.save();
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartBadge();
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        const count = this.getItemCount();
        if (badge) {
            badge.textContent = count;
            if (count > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    showNotification(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 2000;
            font-family: Poppins, sans-serif;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

let cart = new ShoppingCart();

// Função para adicionar item ao carrinho (usada nos botões dos bolos)
function addToCart(productName, price) {
    cart.addItem(productName, price);
}

// Abrir Modal do Carrinho
function openCartModal() {
    document.getElementById('cart-modal').classList.add('show');
    updateCartModal();
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('show');
}

function updateCartModal() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const cartEmptyElement = document.getElementById('cart-empty');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.items.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartTotalElement.style.display = 'none';
        checkoutBtn.style.display = 'none';
        cartEmptyElement.style.display = 'block';
    } else {
        cartItemsContainer.style.display = 'block';
        cartTotalElement.style.display = 'block';
        checkoutBtn.style.display = 'block';
        cartEmptyElement.style.display = 'none';

        cartItemsContainer.innerHTML = cart.items.map((item, index) => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="item-quantity">
                    <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})" class="qty-btn">−</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)" class="qty-input">
                    <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})" class="qty-btn">+</button>
                </div>
                <div class="item-total">
                    <p>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    <button onclick="removeCartItem(${index})" class="remove-btn">Remover</button>
                </div>
            </div>
        `).join('');

        cartTotalElement.innerHTML = `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>R$ ${cart.getTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="summary-row">
                    <span>Taxa de Entrega:</span>
                    <span>R$ 5,00</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>R$ ${(cart.getTotal() + 5).toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        `;
    }
}

function updateCartQuantity(index, newQuantity) {
    cart.updateQuantity(index, parseInt(newQuantity));
    updateCartModal();
}

function removeCartItem(index) {
    cart.removeItem(index);
    updateCartModal();
}

function clearCart() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        cart.clear();
        updateCartModal();
    }
}

// Abrir Modal de Checkout
function openCheckout() {
    if (cart.items.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    document.getElementById('checkout-modal').classList.add('show');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('show');
}

// Processar Pedido
function processOrder() {
    const form = document.getElementById('checkout-form');
    const clientName = document.getElementById('client-name').value.trim();
    const clientPhone = document.getElementById('client-phone').value.trim();
    const clientAddress = document.getElementById('client-address').value.trim();
    const paymentMethod = document.getElementById('payment-method').value;

    if (!clientName || !clientPhone || !clientAddress || !paymentMethod) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Criar objeto do pedido
    const order = {
        id: Date.now(),
        customer: clientName,
        phone: clientPhone,
        address: clientAddress,
        paymentMethod: paymentMethod,
        items: cart.items,
        subtotal: cart.getTotal(),
        delivery: 5.00,
        total: cart.getTotal() + 5,
        status: 'pending',
        date: new Date().toLocaleString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // Salvar pedido
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Salvar também no sistema de admin
    let adminOrders = JSON.parse(localStorage.getItem('admin_orders')) || [];
    adminOrders.push(order);
    localStorage.setItem('admin_orders', JSON.stringify(adminOrders));

    // Mostrar confirmação
    showOrderConfirmation(order);

    // Limpar carrinho
    cart.clear();
    form.reset();
    closeCheckoutModal();
    closeCartModal();
}

function showOrderConfirmation(order) {
    const modal = document.getElementById('confirmation-modal');
    const content = document.getElementById('confirmation-content');

    const itemsList = order.items.map(item => 
        `<li>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</li>`
    ).join('');

    content.innerHTML = `
        <div class="confirmation-header">
            <i class="fas fa-check-circle"></i>
            <h2>Pedido Confirmado! ✅</h2>
        </div>
        <div class="confirmation-body">
            <div class="order-details">
                <h3>Número do Pedido: #${order.id}</h3>
                <p><strong>Cliente:</strong> ${order.customer}</p>
                <p><strong>Telefone:</strong> ${order.phone}</p>
                <p><strong>Endereço:</strong> ${order.address}</p>
                <p><strong>Forma de Pagamento:</strong> ${order.paymentMethod}</p>
            </div>
            <div class="order-items">
                <h4>Itens do Pedido:</h4>
                <ul>
                    ${itemsList}
                </ul>
            </div>
            <div class="order-total">
                <p><strong>Subtotal:</strong> R$ ${order.subtotal.toFixed(2).replace('.', ',')}</p>
                <p><strong>Taxa de Entrega:</strong> R$ ${order.delivery.toFixed(2).replace('.', ',')}</p>
                <p class="total"><strong>Total:</strong> R$ ${order.total.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="payment-info">
                <p><strong>⚠️ Lembrete:</strong> O pagamento será realizado na entrega.</p>
                <p>Você receberá atualizações do seu pedido via chat quando o fabricante aceitar.</p>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.remove('show');
}

function viewMyOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const modal = document.getElementById('my-orders-modal');
    const content = document.getElementById('my-orders-content');

    if (orders.length === 0) {
        content.innerHTML = '<p class="empty-state">Você ainda não fez nenhum pedido.</p>';
    } else {
        content.innerHTML = orders.reverse().map(order => `
            <div class="order-history-card">
                <div class="order-header">
                    <h4>Pedido #${order.id}</h4>
                    <span class="order-status ${order.status}">${getOrderStatusLabel(order.status)}</span>
                </div>
                <p><strong>Data:</strong> ${order.date}</p>
                <p><strong>Total:</strong> R$ ${order.total.toFixed(2).replace('.', ',')}</p>
                <p><strong>Itens:</strong> ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">Ver Detalhes</button>
            </div>
        `).join('');
    }

    modal.classList.add('show');
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;

    const itemsList = order.items.map(item => 
        `<li>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</li>`
    ).join('');

    const detailsModal = document.getElementById('order-details-modal');
    const detailsContent = document.getElementById('order-details-content');

    detailsContent.innerHTML = `
        <div class="order-detail-header">
            <h3>Detalhes do Pedido #${order.id}</h3>
        </div>
        <div class="order-detail-body">
            <div class="detail-section">
                <h4>Status</h4>
                <p><span class="order-status ${order.status}">${getOrderStatusLabel(order.status)}</span></p>
            </div>
            <div class="detail-section">
                <h4>Informações Pessoais</h4>
                <p><strong>Nome:</strong> ${order.customer}</p>
                <p><strong>Telefone:</strong> ${order.phone}</p>
                <p><strong>Endereço:</strong> ${order.address}</p>
            </div>
            <div class="detail-section">
                <h4>Itens</h4>
                <ul>
                    ${itemsList}
                </ul>
            </div>
            <div class="detail-section">
                <h4>Resumo Financeiro</h4>
                <p><strong>Subtotal:</strong> R$ ${order.subtotal.toFixed(2).replace('.', ',')}</p>
                <p><strong>Taxa de Entrega:</strong> R$ ${order.delivery.toFixed(2).replace('.', ',')}</p>
                <p class="total"><strong>Total:</strong> R$ ${order.total.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="detail-section">
                <h4>Pagamento</h4>
                <p><strong>Forma:</strong> ${order.paymentMethod}</p>
                <p><strong>Status:</strong> Aguardando entrega</p>
            </div>
            <div class="detail-section">
                <h4>Data e Hora</h4>
                <p>${order.date}</p>
            </div>
        </div>
    `;

    detailsModal.classList.add('show');
}

function closeOrderDetailsModal() {
    document.getElementById('order-details-modal').classList.remove('show');
}

function closeMyOrdersModal() {
    document.getElementById('my-orders-modal').classList.remove('show');
}

function getOrderStatusLabel(status) {
    const labels = {
        'pending': '⏳ Aguardando Aceitação',
        'preparing': '🔥 Em Preparação',
        'completed': '✅ Finalizado'
    };
    return labels[status] || status;
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const myOrdersModal = document.getElementById('my-orders-modal');
    const orderDetailsModal = document.getElementById('order-details-modal');

    if (e.target === cartModal) closeCartModal();
    if (e.target === checkoutModal) closeCheckoutModal();
    if (e.target === confirmationModal) closeConfirmationModal();
    if (e.target === myOrdersModal) closeMyOrdersModal();
    if (e.target === orderDetailsModal) closeOrderDetailsModal();
});

// Formatar input de telefone
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('client-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `(${value}`;
                } else if (value.length <= 7) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                }
            }
            e.target.value = value;
        });
    }
});

console.log('🛒 Sistema de carrinho carregado!');
