// Dados simulados (em produção, viriam de um backend/banco de dados)
let orders = [
    { id: 1001, customer: 'Maria Silva', items: 'Bolo Veludo + Chocolate', time: '10:30', price: 85.80, status: 'pending', date: new Date() },
    { id: 1002, customer: 'João Santos', items: 'Cookies & Creme', time: '11:15', price: 43.90, status: 'preparing', date: new Date() },
];

let conversations = {};
let currentChat = null;

// Elementos do DOM
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');
const modals = document.querySelectorAll('.modal');
const closeModals = document.querySelectorAll('.close-modal');

// Event Listeners para Navegação
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        switchSection(section);
    });
});

function switchSection(sectionId) {
    // Remove active de todos
    navItems.forEach(item => item.classList.remove('active'));
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Adiciona active ao selecionado
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    document.getElementById(sectionId).classList.add('active');
    
    // Atualiza título
    const titles = {
        dashboard: 'Dashboard',
        pedidos: 'Pedidos Pendentes',
        'em-preparacao': 'Pedidos em Preparação',
        finalizados: 'Pedidos Finalizados',
        chat: 'Chat com Clientes',
        relatorios: 'Relatórios'
    };
    
    pageTitle.textContent = titles[sectionId] || 'Dashboard';
    
    if (sectionId === 'pedidos') loadPedidos();
    if (sectionId === 'em-preparacao') loadEmPreparacao();
    if (sectionId === 'finalizados') loadFinalizados();
    if (sectionId === 'chat') loadChat();
    if (sectionId === 'relatorios') loadRelatorios();
    if (sectionId === 'dashboard') loadDashboard();
}

// ========== DASHBOARD ==========
function loadDashboard() {
    updateStats();
    loadRecentOrders();
}

function updateStats() {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
    
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-preparing').textContent = preparing;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-revenue').textContent = `R$ ${revenue.toFixed(2).replace('.', ',')}`;
    
    // Atualizar badges
    document.getElementById('pedidos-badge').textContent = pending;
    document.getElementById('preparacao-badge').textContent = preparing;
    document.getElementById('chat-badge').textContent = Object.keys(conversations).length;
}

function loadRecentOrders() {
    const recentList = document.getElementById('recent-list');
    const recent = orders.slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p class="empty-state">Nenhum pedido ainda</p>';
        return;
    }
    
    recentList.innerHTML = recent.map(order => `
        <div class="order-card">
            <div class="order-info">
                <h3>#${order.id}</h3>
                <p>${order.customer}</p>
                <div class="order-items">${order.items}</div>
            </div>
            <div class="order-time">
                <div class="time">${order.time}</div>
                <small>R$ ${order.price.toFixed(2).replace('.', ',')}</small>
            </div>
            <div class="order-status">
                <span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrderDetail(${order.id})">Ver</button>
                ${order.status === 'pending' ? `<button class="btn btn-primary btn-small" onclick="openAcceptModal(${order.id})">Aceitar</button>` : ''}
            </div>
        </div>
    `).join('');
}

// ========== PEDIDOS PENDENTES ==========
function loadPedidos() {
    const pedidosList = document.getElementById('pedidos-list');
    const pending = orders.filter(o => o.status === 'pending');
    
    if (pending.length === 0) {
        pedidosList.innerHTML = '<p class="empty-state">Nenhum pedido pendente</p>';
        return;
    }
    
    pedidosList.innerHTML = pending.map(order => `
        <div class="order-card">
            <div class="order-info">
                <h3>#${order.id}</h3>
                <p>${order.customer}</p>
                <div class="order-items">${order.items}</div>
            </div>
            <div class="order-time">
                <div class="time">${order.time}</div>
                <small>R$ ${order.price.toFixed(2).replace('.', ',')}</small>
            </div>
            <div class="order-status">
                <span class="status-badge pending">Aguardando</span>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrderDetail(${order.id})">Detalhes</button>
                <button class="btn btn-primary btn-small" onclick="openAcceptModal(${order.id})">Aceitar</button>
            </div>
        </div>
    `).join('');
}

// ========== PEDIDOS EM PREPARAÇÃO ==========
function loadEmPreparacao() {
    const preparacaoList = document.getElementById('preparacao-list');
    const preparing = orders.filter(o => o.status === 'preparing');
    
    if (preparing.length === 0) {
        preparacaoList.innerHTML = '<p class="empty-state">Nenhum pedido em preparação</p>';
        return;
    }
    
    preparacaoList.innerHTML = preparing.map(order => `
        <div class="order-card">
            <div class="order-info">
                <h3>#${order.id}</h3>
                <p>${order.customer}</p>
                <div class="order-items">${order.items}</div>
            </div>
            <div class="order-time">
                <div class="time">${order.time}</div>
                <small>R$ ${order.price.toFixed(2).replace('.', ',')}</small>
            </div>
            <div class="order-status">
                <span class="status-badge preparing">Preparando</span>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="openChat(${order.id})">Chat</button>
                <button class="btn btn-primary btn-small" onclick="openFinishModal(${order.id})">Finalizar</button>
            </div>
        </div>
    `).join('');
}

// ========== PEDIDOS FINALIZADOS ==========
function loadFinalizados() {
    const finalizadosList = document.getElementById('finalizados-list');
    const completed = orders.filter(o => o.status === 'completed');
    
    if (completed.length === 0) {
        finalizadosList.innerHTML = '<p class="empty-state">Nenhum pedido finalizado</p>';
        return;
    }
    
    finalizadosList.innerHTML = completed.map(order => `
        <div class="order-card">
            <div class="order-info">
                <h3>#${order.id}</h3>
                <p>${order.customer}</p>
                <div class="order-items">${order.items}</div>
            </div>
            <div class="order-time">
                <div class="time">${order.time}</div>
                <small>R$ ${order.price.toFixed(2).replace('.', ',')}</small>
            </div>
            <div class="order-status">
                <span class="status-badge completed">Finalizado</span>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="viewOrderDetail(${order.id})">Ver</button>
            </div>
        </div>
    `).join('');
}

// ========== CHAT ==========
function loadChat() {
    const chatList = document.getElementById('chat-list');
    const activeConversations = orders.filter(o => o.status === 'preparing');
    
    if (activeConversations.length === 0) {
        chatList.innerHTML = '<p class="empty-state">Nenhuma conversa ativa</p>';
        return;
    }
    
    chatList.innerHTML = activeConversations.map(order => `
        <div class="conversation-item ${currentChat === order.id ? 'active' : ''}" onclick="selectConversation(${order.id}, '${order.customer}')">
            <h4>${order.customer}</h4>
            <small>Pedido #${order.id}</small>
        </div>
    `).join('');
}

function selectConversation(orderId, customerName) {
    currentChat = orderId;
    const chatWindow = document.getElementById('chat-window');
    const chatEmpty = document.getElementById('chat-empty');
    
    document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[onclick*="selectConversation(${orderId}"]`).classList.add('active');
    
    chatWindow.style.display = 'flex';
    chatEmpty.style.display = 'none';
    
    document.getElementById('chat-customer-name').textContent = customerName;
    document.getElementById('chat-order-id').textContent = `Pedido #${orderId}`;
    
    // Inicializar conversa se não existir
    if (!conversations[orderId]) {
        conversations[orderId] = [
            { type: 'admin', text: 'Olá! Seu pedido foi aceito. Estou preparando!' }
        ];
    }
    
    loadMessages(orderId);
}

function loadMessages(orderId) {
    const container = document.getElementById('messages-container');
    const msgs = conversations[orderId] || [];
    
    container.innerHTML = msgs.map(msg => `
        <div class="message ${msg.type}">
            <div>
                <div class="message-content">${msg.text}</div>
                <div class="message-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

document.getElementById('send-message-btn')?.addEventListener('click', function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    if (text && currentChat) {
        if (!conversations[currentChat]) {
            conversations[currentChat] = [];
        }
        conversations[currentChat].push({ type: 'admin', text: text });
        input.value = '';
        loadMessages(currentChat);
    }
});

// ========== RELATÓRIOS ==========
function loadRelatorios() {
    const completed = orders.filter(o => o.status === 'completed');
    const totalRevenue = completed.reduce((sum, o) => sum + o.price, 0);
    const avgPrice = completed.length > 0 ? totalRevenue / completed.length : 0;
    
    document.getElementById('report-monthly').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    document.getElementById('report-bestseller').textContent = 'Veludo Vermelho';
    document.getElementById('report-completion').textContent = `${Math.round((completed.length / orders.length) * 100)}%`;
    document.getElementById('report-average').textContent = `R$ ${avgPrice.toFixed(2).replace('.', ',')}`;
}

// ========== MODAIS ==========
closeModals.forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('show');
    });
});

window.addEventListener('click', function(e) {
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

function openAcceptModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    const modal = document.getElementById('accept-modal');
    document.getElementById('modal-order-details').textContent = `Pedido #${order.id} de ${order.customer}`;
    
    document.getElementById('confirm-accept').onclick = function() {
        acceptOrder(orderId);
    };
    
    modal.classList.add('show');
}

function acceptOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    order.status = 'preparing';
    conversations[orderId] = [
        { type: 'admin', text: 'Olá! Seu pedido foi aceito. Estou preparando!' }
    ];
    
    document.getElementById('accept-modal').classList.remove('show');
    updateStats();
    loadDashboard();
    loadChat();
    showNotification('Pedido aceito! Abra o chat para conversar com o cliente.');
}

function openFinishModal(orderId) {
    const modal = document.getElementById('finish-modal');
    
    document.getElementById('confirm-finish').onclick = function() {
        const phone = document.getElementById('finish-phone').value.trim();
        const address = document.getElementById('finish-address').value.trim();
        
        if (!phone || !address) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        finishOrder(orderId, phone, address);
    };
    
    modal.classList.add('show');
}

function finishOrder(orderId, phone, address) {
    const order = orders.find(o => o.id === orderId);
    order.status = 'completed';
    order.phone = phone;
    order.address = address;
    
    // Adicionar mensagem no chat
    if (conversations[orderId]) {
        conversations[orderId].push({
            type: 'admin',
            text: `Seu pedido está pronto! 🎉\n\nTelefone para contato: ${phone}\nEndereço de entrega: ${address}\n\nVenha buscar ou confirme a entrega!`
        });
    }
    
    document.getElementById('finish-modal').classList.remove('show');
    document.getElementById('finish-phone').value = '';
    document.getElementById('finish-address').value = '';
    
    updateStats();
    loadDashboard();
    showNotification('Pedido finalizado! Cliente notificado com telefone e endereço.');
}

function openChat(orderId) {
    const order = orders.find(o => o.id === orderId);
    switchSection('chat');
    setTimeout(() => selectConversation(orderId, order.customer), 100);
}

function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3>Informações do Pedido</h3>
                <p><strong>ID:</strong> #${order.id}</p>
                <p><strong>Cliente:</strong> ${order.customer}</p>
                <p><strong>Itens:</strong> ${order.items}</p>
                <p><strong>Valor:</strong> R$ ${order.price.toFixed(2).replace('.', ',')}</p>
                <p><strong>Status:</strong> ${getStatusLabel(order.status)}</p>
                <p><strong>Horário:</strong> ${order.time}</p>
            </div>
            ${order.phone ? `
            <div>
                <h3>Informações de Entrega</h3>
                <p><strong>Telefone:</strong> ${order.phone}</p>
                <p><strong>Endereço:</strong> ${order.address}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('show');
}

function getStatusLabel(status) {
    const labels = {
        pending: '⏳ Aguardando',
        preparing: '🔥 Preparando',
        completed: '✅ Finalizado'
    };
    return labels[status] || status;
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #52b788;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        font-family: Poppins, sans-serif;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inicializar
loadDashboard();
