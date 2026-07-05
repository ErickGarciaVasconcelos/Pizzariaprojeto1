/* ============================================
   BELLA PIZZA - JavaScript Completo
   Etapa 4: Carrinho + Meio a Meio + WhatsApp
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // DADOS DO CARDÁPIO (carregados de cardapio.js)
  // ============================================

  // Taxas de entrega por bairro
  const DELIVERY_FEES = {
    centro: 5.00,
    norte: 8.00,
    sul: 8.00,
    leste: 10.00,
    oeste: 10.00
  };

  // ============================================
  // CONFIGURAÇÃO DO WHATSAPP
  // ============================================

  const WHATSAPP_CONFIG = {
    phoneNumber: '5511940690820',  // Numero da pizzaria (formato: 55+DDD+Numero)
    businessName: 'Bella Pizza'
  };

  // ============================================
  // ESTADO DA APLICAÇÃO
  // ============================================

  const state = {
    cart: [],
    activeCategory: 'pizzas',
    meioMeio: {
      sabor1: null,
      sabor2: null
    },
    checkout: {
      deliveryType: 'entrega',    // 'entrega' ou 'retirada'
      paymentMethod: null,        // 'cartao', 'pix', 'dinheiro'
      needChange: false,          // true se precisa de troco
      deliveryFee: 0              // taxa de entrega
    }
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const elements = {
    // Categorias (carrossel)
    categoryPills: document.querySelectorAll('.category-pill'),
    categoryCarousel: document.getElementById('categoryCarousel'),
    sections: document.querySelectorAll('.menu-section'),

    // Bottom Navigation
    bottomNav: document.getElementById('bottomNav'),
    bottomNavItems: document.querySelectorAll('.bottom-nav__item'),

    // Carrinho
    cartFloating: document.getElementById('cartFloating'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    cartBadge: document.getElementById('cartBadge'),
    openCartBtn: document.getElementById('openCartBtn'),
    openCartBtnFloat: document.getElementById('openCartBtnFloat'),

    // Modal Meio a Meio
    modalMeioMeio: document.getElementById('modalMeioMeio'),
    sabor1Options: document.getElementById('sabor1Options'),
    sabor2Options: document.getElementById('sabor2Options'),
    meioMeioSummary: document.getElementById('meioMeioSummary'),
    confirmMeioMeio: document.getElementById('confirmMeioMeio'),
    btnMeioMeio: document.getElementById('btnMeioMeio'),

    // Modal Carrinho
    modalCarrinho: document.getElementById('modalCarrinho'),
    cartItemsContainer: document.getElementById('cartItemsContainer'),
    cartEmpty: document.getElementById('cartEmpty'),
    cartFooter: document.getElementById('cartFooter'),
    cartModalTotal: document.getElementById('cartModalTotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),

    // Formulário de Checkout
    checkoutForm: document.getElementById('checkoutForm'),
    clientName: document.getElementById('clientName'),
    clientPhone: document.getElementById('clientPhone'),

    // Entrega
    optEntrega: document.getElementById('optEntrega'),
    optRetirada: document.getElementById('optRetirada'),
    addressFields: document.getElementById('addressFields'),
    clientAddress: document.getElementById('clientAddress'),
    clientNumber: document.getElementById('clientNumber'),
    clientNeighborhood: document.getElementById('clientNeighborhood'),
    clientReference: document.getElementById('clientReference'),
    deliveryFeeDisplay: document.getElementById('deliveryFeeDisplay'),
    deliveryFeeValue: document.getElementById('deliveryFeeValue'),

    // Pagamento
    optCartao: document.getElementById('optCartao'),
    optPix: document.getElementById('optPix'),
    optDinheiro: document.getElementById('optDinheiro'),
    changeField: document.getElementById('changeField'),
    optTrocoSim: document.getElementById('optTrocoSim'),
    optTrocoNao: document.getElementById('optTrocoNao'),
    changeAmountGroup: document.getElementById('changeAmountGroup'),
    changeAmount: document.getElementById('changeAmount'),

    // Observações
    clientObs: document.getElementById('clientObs'),

    // Resumo
    subtotalValue: document.getElementById('subtotalValue'),
    feeRow: document.getElementById('feeRow'),
    deliveryFeeFooter: document.getElementById('deliveryFeeFooter'),

    // Modal Busca
    modalBusca: document.getElementById('modalBusca'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    searchResults: document.getElementById('searchResults'),
    searchEmpty: document.getElementById('searchEmpty')
  };

  // ============================================
  // UTILITÁRIOS
  // ============================================

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function getProductById(productId) {
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    return cardapio.find(p => p.id === id) || null;
  }

  function generateCartItemId() {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  // ============================================
  // NAVEGAÇÃO POR CATEGORIAS (CARROSSEL)
  // ============================================

  function switchCategory(category) {
    state.activeCategory = category;

    // Atualiza pills do carrossel
    elements.categoryPills.forEach(pill => {
      const isActive = pill.dataset.category === category;
      pill.classList.toggle('category-pill--active', isActive);
      
      // Centraliza a pill ativa no carrossel
      if (isActive) {
        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    // Renderiza cardápio da categoria selecionada
    const categoriaMap = {
      'pizzas': 'pizzas',
      'bebidas': 'bebidas',
      'sobremesas': 'doces'
    };
    renderizarCardapio(categoriaMap[category] || 'pizzas');

    // Mostra/esconde seções com scroll suave
    elements.sections.forEach(section => {
      const sectionCategory = section.dataset.section;
      if (sectionCategory === category) {
        section.hidden = false;
        section.style.animation = 'fadeInUp 0.3s ease forwards';
        // Scroll suave até a seção
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        section.hidden = true;
      }
    });

    }

    // Event listeners para pills do carrossel
  elements.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      switchCategory(pill.dataset.category);
    });
  });

  // Event listeners para bottom navigation
  elements.bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const navType = item.dataset.nav;
      
      // Atualiza visual
      elements.bottomNavItems.forEach(i => i.classList.remove('bottom-nav__item--active'));
      item.classList.add('bottom-nav__item--active');
      
      if (navType === 'buscar') {
        // Abre modal de busca
        openModal('modalBusca');
        var si = document.getElementById('searchInput');
        var scb = document.getElementById('searchClearBtn');
        if (si) { si.value = ''; }
        if (scb) { scb.style.display = 'none'; }
        renderSearchResults('');
        setTimeout(function() { if (si) { si.focus(); } }, 300);
      } else if (navType === 'carrinho') {
        // Abre modal do carrinho
        renderCartItems();
        openModal('modalCarrinho');
      }
    });
  });

  // ============================================
  // MODAL - CONTROLE GENÉRICO
  // ============================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      closeModal(el.dataset.closeModal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('modalMeioMeio');
      closeModal('modalCarrinho');
      closeModal('modalBusca');
    }
  });

  // ============================================
  // BOTTOM SHEET - SWIPE TO CLOSE
  // ============================================

  function initBottomSheetSwipe() {
    const cartSheet = document.getElementById('cartSheet');
    const cartHandle = document.getElementById('cartHandle');
    if (!cartSheet || !cartHandle) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    cartHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      cartSheet.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY > 0) {
        cartSheet.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      cartSheet.style.transition = '';
      const deltaY = currentY - startY;
      if (deltaY > 100) {
        closeModal('modalCarrinho');
      }
      cartSheet.style.transform = '';
    });
  }

  // ============================================
  // FUNCIONALIDADE DO CARRINHO
  // ============================================

  function addToCart(productId, options = {}) {
    const product = getProductById(productId);
    if (!product && !options.isMeioMeio) return;

    let itemName, itemPrice, itemFlavor, itemTamanho;

    if (options.isMeioMeio) {
      const sabor1 = getProductById(options.sabor1);
      const sabor2 = getProductById(options.sabor2);
      if (!sabor1 || !sabor2) return;

      itemPrice = Math.max(sabor1.preco, sabor2.preco);
      itemName = 'Pizza Meio a Meio';
      itemFlavor = `${sabor1.nome.split(' ').pop()} / ${sabor2.nome.split(' ').pop()}`;
      itemTamanho = null;
    } else if (options.tamanho) {
      // Tamanho selecionado via popup (Grande ou Broto)
      itemPrice = options.price;
      itemName = product.nome;
      itemFlavor = null;
      itemTamanho = options.tamanho;
    } else {
      itemPrice = product.preco;
      itemName = product.nome;
      itemFlavor = null;
      itemTamanho = null;
    }

    const existingItem = state.cart.find(item => {
      if (options.isMeioMeio) {
        return item.isMeioMeio &&
               item.sabor1 === options.sabor1 &&
               item.sabor2 === options.sabor2;
      }
      return item.productId === productId &&
             !item.isMeioMeio &&
             item.tamanho === (itemTamanho || null);
    });

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      state.cart.push({
        id: generateCartItemId(),
        productId: productId,
        name: itemName,
        flavor: itemFlavor,
        price: itemPrice,
        quantity: 1,
        isMeioMeio: options.isMeioMeio || false,
        sabor1: options.sabor1 || null,
        sabor2: options.sabor2 || null,
        tamanho: itemTamanho
      });
    }

    updateCartUI();
    renderCartItems();
    showAddFeedback(productId, options.isMeioMeio);
  }

  function removeFromCart(cartItemId) {
    const index = state.cart.findIndex(item => item.id === cartItemId);
    if (index !== -1) {
      state.cart.splice(index, 1);
      updateCartUI();
      renderCartItems();
      validateForm();
    }
  }

  function updateItemQuantity(cartItemId, delta) {
    const item = state.cart.find(item => item.id === cartItemId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      updateCartUI();
      renderCartItems();
      validateForm();
    }
  }

  function calculateCartTotal() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = state.checkout.deliveryType === 'entrega' ? state.checkout.deliveryFee : 0;
    const totalPrice = subtotal + deliveryFee;
    return { totalItems, subtotal, deliveryFee, totalPrice };
  }

  function updateCartUI() {
    const { totalItems, subtotal } = calculateCartTotal();

    // Atualiza contadores
    elements.cartCount.textContent = totalItems;
    elements.cartTotal.textContent = formatCurrency(subtotal);
    elements.cartBadge.textContent = totalItems;

    // Mostra/esconde badge do carrinho
    if (totalItems > 0) {
      elements.cartBadge.classList.add('bottom-nav__badge--visible');
      elements.cartFloating.style.display = 'block';
    } else {
      elements.cartBadge.classList.remove('bottom-nav__badge--visible');
      elements.cartFloating.style.display = 'none';
    }
  }

  function renderCartItems() {
    const { totalItems, subtotal, deliveryFee, totalPrice } = calculateCartTotal();

    const existingItems = elements.cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(item => item.remove());

    // Remove formulário se existir
    const existingForm = elements.cartItemsContainer.querySelector('.checkout-form');
    if (existingForm) existingForm.remove();

    // Remove divider se existir
    const existingDivider = elements.cartItemsContainer.querySelector('.cart-divider');
    if (existingDivider) existingDivider.remove();

    if (state.cart.length === 0) {
      elements.cartEmpty.style.display = 'block';
      elements.cartFooter.style.display = 'none';
      elements.checkoutForm.style.display = 'none';
    } else {
      elements.cartEmpty.style.display = 'none';
      
      // Footer fixo (já no DOM como bottom-sheet__footer)
      elements.cartFooter.style.display = 'block';

      // Renderiza itens com animação
      state.cart.forEach((item, index) => {
        const itemEl = createCartItemElement(item);
        itemEl.style.animationDelay = `${index * 0.05}s`;
        elements.cartItemsContainer.appendChild(itemEl);
      });

      // Adiciona divider e formulário
      const divider = document.createElement('div');
      divider.className = 'cart-divider';
      divider.innerHTML = '<hr style="border: none; border-top: 2px solid var(--color-border); margin: 16px 0;">';
      elements.cartItemsContainer.appendChild(divider);

      // Clona e insere o formulário
      const formClone = elements.checkoutForm.cloneNode(true);
      formClone.style.display = 'block';
      formClone.removeAttribute('id');
      elements.cartItemsContainer.appendChild(formClone);

      // Re-binda os eventos do formulário
      bindFormEvents(formClone);

      // Atualiza resumo
      elements.subtotalValue.textContent = formatCurrency(subtotal);
      updateDeliveryFeeUI();
      
      // Força validação após renderizar
      setTimeout(() => validateForm(), 100);
    }
  }

  function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.cartItemId = item.id;

    const flavorHtml = item.flavor
      ? `<span class="cart-item__flavor">${item.flavor}</span>`
      : '';

    const tamanhoHtml = item.tamanho
      ? `<span class="cart-item__flavor">${item.tamanho}</span>`
      : '';

    div.innerHTML = `
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        ${flavorHtml}
        ${tamanhoHtml}
        <span class="cart-item__price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
      <div class="cart-item__controls">
        <button class="cart-item__qty-btn cart-item__qty-btn--minus" data-action="decrease" aria-label="Diminuir quantidade">−</button>
        <span class="cart-item__qty">${item.quantity}</span>
        <button class="cart-item__qty-btn cart-item__qty-btn--plus" data-action="increase" aria-label="Aumentar quantidade">+</button>
      </div>
    `;

    div.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      if (item.quantity <= 1) {
        // Animação de remoção
        div.classList.add('removing');
        div.addEventListener('animationend', () => {
          removeFromCart(item.id);
        }, { once: true });
      } else {
        updateItemQuantity(item.id, -1);
      }
    });

    div.querySelector('[data-action="increase"]').addEventListener('click', () => {
      updateItemQuantity(item.id, +1);
    });

    return div;
  }

  function showAddFeedback(productId, isMeioMeio = false) {
    let btn;
    if (isMeioMeio) {
      btn = elements.btnMeioMeio;
    } else {
      btn = document.querySelector(`[data-product="${productId}"]`);
    }
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = '✓ Adicionado!';
    btn.style.backgroundColor = 'var(--color-secondary)';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  }

  // Event listeners para botões de adicionar
  document.addEventListener('click', (e) => {
    // Botão "Adicionar" de pizza com opção broto — abre popup
    const btnComBroto = e.target.closest('.card__btn-add--com-broto');
    if (btnComBroto) {
      e.stopPropagation();
      const productId = btnComBroto.dataset.product;
      const popup = document.querySelector(`.size-popup[data-popup-for="${productId}"]`);
      if (popup) {
        // Fecha outros popups abertos
        document.querySelectorAll('.size-popup--visible').forEach(p => p.classList.remove('size-popup--visible'));
        popup.classList.toggle('size-popup--visible');
      }
      return;
    }

    // Opção de tamanho selecionada no popup
    const sizeOption = e.target.closest('.size-popup__option');
    if (sizeOption) {
      e.stopPropagation();
      const productId = sizeOption.dataset.product;
      const tamanho = sizeOption.dataset.tamanho;
      const price = parseFloat(sizeOption.dataset.price);
      addToCart(productId, { tamanho, price });
      // Fecha o popup
      sizeOption.closest('.size-popup').classList.remove('size-popup--visible');
      return;
    }

    // Botão normal "Adicionar" (sem broto)
    const btn = e.target.closest('.card__btn-add:not(.card__btn-add--meioameio):not(.card__btn-add--com-broto)');
    if (!btn) return;

    e.stopPropagation();
    const productId = btn.dataset.product;
    addToCart(productId);
  });

  // Fecha popup de tamanho ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.card__btn-add--com-broto') && !e.target.closest('.size-popup')) {
      document.querySelectorAll('.size-popup--visible').forEach(p => p.classList.remove('size-popup--visible'));
    }
  });

  // Abrir modal do carrinho (botão flutuante)
  elements.openCartBtnFloat.addEventListener('click', () => {
    renderCartItems();
    openModal('modalCarrinho');
  });

  // ============================================
  // FORMULÁRIO DE CHECKOUT - EVENTOS
  // ============================================

  function bindFormEvents(formContainer) {
    console.log('Bindindo eventos no formulário:', formContainer);
    
    // Botões de entrega
    const entregaBtns = formContainer.querySelectorAll('[data-delivery]');
    entregaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = btn.dataset.delivery;
        state.checkout.deliveryType = type;

        // Atualiza visual
        entregaBtns.forEach(b => b.classList.remove('delivery-option--active'));
        btn.classList.add('delivery-option--active');

        // Mostra/esconde campos de endereço
        const addressFieldsEl = formContainer.querySelector('.address-fields');
        if (addressFieldsEl) {
          addressFieldsEl.style.display = type === 'entrega' ? 'block' : 'none';
        }

        updateDeliveryFeeUI();
        validateForm();
      });
    });

    // Seleção de bairro
    const neighborhoodSelect = formContainer.querySelector('[name="clientNeighborhood"]');
    if (neighborhoodSelect) {
      neighborhoodSelect.addEventListener('change', (e) => {
        e.preventDefault();
        const neighborhood = e.target.value;
        if (neighborhood && DELIVERY_FEES[neighborhood] !== undefined) {
          state.checkout.deliveryFee = DELIVERY_FEES[neighborhood];
        } else {
          state.checkout.deliveryFee = 0;
        }
        updateDeliveryFeeUI();
        validateForm();
      });
    }

    // Botões de pagamento
    const paymentBtns = formContainer.querySelectorAll('[data-payment]');
    paymentBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const method = btn.dataset.payment;
        state.checkout.paymentMethod = method;
        console.log('Método de pagamento selecionado:', method);

        // Atualiza visual
        paymentBtns.forEach(b => b.classList.remove('payment-option--active'));
        btn.classList.add('payment-option--active');

        // Mostra/esconde campo de troco
        const changeFieldEl = formContainer.querySelector('.change-field');
        if (changeFieldEl) {
          changeFieldEl.style.display = method === 'dinheiro' ? 'block' : 'none';
        }

        validateForm();
      });
    });

    // Botões de troco
    const changeBtns = formContainer.querySelectorAll('[data-change]');
    changeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const needChange = btn.dataset.change === 'sim';
        state.checkout.needChange = needChange;

        // Atualiza visual
        changeBtns.forEach(b => b.classList.remove('change-option--active'));
        btn.classList.add('change-option--active');

        // Mostra/esconde campo de valor
        const changeAmountGroupEl = formContainer.querySelector('[id="changeAmountGroup"]');
        if (changeAmountGroupEl) {
          changeAmountGroupEl.style.display = needChange ? 'block' : 'none';
        }
      });
    });

    // Formatação de telefone
    const phoneInput = formContainer.querySelector('[name="clientPhone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = formatPhone(e.target.value);
      });
    }

    // Validação em tempo real
    const inputs = formContainer.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => validateForm());
      input.addEventListener('input', () => validateForm());
    });
  }

  function updateDeliveryFeeUI() {
    const { subtotal, deliveryFee, totalPrice } = calculateCartTotal();

    // Busca o formulário ativo (clone visível)
    const activeForm = elements.cartItemsContainer.querySelector('.checkout-form');
    
    // Atualiza display da taxa no formulário clonado
    const feeDisplay = activeForm ? activeForm.querySelector('#deliveryFeeDisplay') : null;
    const feeValue = activeForm ? activeForm.querySelector('#deliveryFeeValue') : null;

    if (state.checkout.deliveryType === 'entrega' && state.checkout.deliveryFee > 0) {
      if (feeDisplay) feeDisplay.style.display = 'flex';
      if (feeValue) feeValue.textContent = formatCurrency(state.checkout.deliveryFee);
      elements.feeRow.style.display = 'flex';
      elements.deliveryFeeFooter.textContent = formatCurrency(state.checkout.deliveryFee);
    } else {
      if (feeDisplay) feeDisplay.style.display = 'none';
      elements.feeRow.style.display = 'none';
      elements.deliveryFeeFooter.textContent = formatCurrency(0);
    }

    elements.cartModalTotal.textContent = formatCurrency(totalPrice);
    elements.subtotalValue.textContent = formatCurrency(subtotal);
  }

  function validateForm() {
    console.log('Executando validação...');
    
    if (state.cart.length === 0) {
      console.log('Carrinho vazio, desabilitando botão');
      elements.checkoutBtn.disabled = true;
      return;
    }

    // Busca o formulário ativo (clone visível)
    const activeForm = elements.cartItemsContainer.querySelector('.checkout-form');
    
    // Se não encontrar formulário clonado, desabilita
    if (!activeForm) {
      console.log('Formulário não encontrado, desabilitando botão');
      elements.checkoutBtn.disabled = true;
      return;
    }

    // Pega os inputs do formulário clonado
    const nameInput = activeForm.querySelector('[name="clientName"]');
    const phoneInput = activeForm.querySelector('[name="clientPhone"]');
    const addressInput = activeForm.querySelector('[name="clientAddress"]');
    const numberInput = activeForm.querySelector('[name="clientNumber"]');
    const neighborhoodSelect = activeForm.querySelector('[name="clientNeighborhood"]');

    console.log('Inputs encontrados:', {
      name: nameInput ? nameInput.value : 'null',
      phone: phoneInput ? phoneInput.value : 'null',
      address: addressInput ? addressInput.value : 'null',
      number: numberInput ? numberInput.value : 'null',
      neighborhood: neighborhoodSelect ? neighborhoodSelect.value : 'null'
    });

    // Validações básicas
    const nameValid = nameInput && nameInput.value.trim().length >= 3;
    const phoneValid = phoneInput && phoneInput.value.replace(/\D/g, '').length >= 10;
    const paymentValid = state.checkout.paymentMethod !== null;

    // Validação de endereço (apenas se entrega)
    let addressValid = true;
    if (state.checkout.deliveryType === 'entrega') {
      const address = addressInput && addressInput.value.trim().length >= 3;
      const number = numberInput && numberInput.value.trim().length >= 1;
      const neighborhood = neighborhoodSelect && neighborhoodSelect.value !== '';
      addressValid = address && number && neighborhood;
    }

    const allValid = nameValid && phoneValid && paymentValid && addressValid;
    elements.checkoutBtn.disabled = !allValid;
    
    console.log('Resultado da validação:', { nameValid, phoneValid, paymentValid, addressValid, allValid });
    console.log('Botão habilitado:', !elements.checkoutBtn.disabled);
  }

  // ============================================
  // PIZZA MEIO A MEIO - MODAL
  // ============================================

  function renderMeioMeioOptions() {
    const pizzas = cardapio.filter(item => item.categoria === 'pizzas');

    elements.sabor1Options.innerHTML = pizzas.map(pizza => `
      <div class="half-pizza__option" data-sabor="1" data-pizza-id="${pizza.id}">
        <span class="half-pizza__option-radio"></span>
        <span class="half-pizza__option-name">${pizza.nome}</span>
        <span class="half-pizza__option-price">${formatCurrency(pizza.preco)}</span>
      </div>
    `).join('');

    elements.sabor2Options.innerHTML = pizzas.map(pizza => `
      <div class="half-pizza__option" data-sabor="2" data-pizza-id="${pizza.id}">
        <span class="half-pizza__option-radio"></span>
        <span class="half-pizza__option-name">${pizza.nome}</span>
        <span class="half-pizza__option-price">${formatCurrency(pizza.preco)}</span>
      </div>
    `).join('');

    document.querySelectorAll('.half-pizza__option').forEach(option => {
      option.addEventListener('click', () => {
        const saborNum = option.dataset.sabor;
        const pizzaId = option.dataset.pizzaId;
        selectMeioMeioOption(saborNum, pizzaId);
      });
    });
  }

  function selectMeioMeioOption(saborNum, pizzaId) {
    if (saborNum === '1') {
      state.meioMeio.sabor1 = pizzaId;
    } else {
      state.meioMeio.sabor2 = pizzaId;
    }

    const container = saborNum === '1' ? elements.sabor1Options : elements.sabor2Options;
    container.querySelectorAll('.half-pizza__option').forEach(opt => {
      const isSelected = opt.dataset.pizzaId === pizzaId;
      opt.classList.toggle('half-pizza__option--selected', isSelected);
    });

    updateMeioMeioSummary();
  }

  function updateMeioMeioSummary() {
    const { sabor1, sabor2 } = state.meioMeio;

    if (!sabor1 || !sabor2) {
      elements.meioMeioSummary.innerHTML = `
        <p class="half-pizza__summary-text">Selecione os dois sabores para ver o preço</p>
      `;
      elements.confirmMeioMeio.disabled = true;
      return;
    }

    const pizza1 = getProductById(sabor1);
    const pizza2 = getProductById(sabor2);

    if (!pizza1 || !pizza2) return;

    const finalPrice = Math.max(pizza1.preco, pizza2.preco);

    elements.meioMeioSummary.innerHTML = `
      <p class="half-pizza__summary-text">
        ${pizza1.nome.replace('Pizza ', '')} / ${pizza2.nome.replace('Pizza ', '')}
      </p>
      <p class="half-pizza__summary-price">${formatCurrency(finalPrice)}</p>
      <p class="half-pizza__summary-rule">* Preço cobrado pelo sabor de maior valor</p>
    `;

    elements.confirmMeioMeio.disabled = false;
  }

  if (elements.btnMeioMeio) {
    elements.btnMeioMeio.addEventListener('click', () => {
      state.meioMeio.sabor1 = null;
      state.meioMeio.sabor2 = null;

      document.querySelectorAll('.half-pizza__option--selected').forEach(opt => {
        opt.classList.remove('half-pizza__option--selected');
      });

      updateMeioMeioSummary();
      openModal('modalMeioMeio');
    });
  }

  if (elements.confirmMeioMeio) {
    elements.confirmMeioMeio.addEventListener('click', () => {
      const { sabor1, sabor2 } = state.meioMeio;

      if (sabor1 && sabor2) {
        addToCart(null, {
          isMeioMeio: true,
          sabor1: sabor1,
          sabor2: sabor2
        });

        closeModal('modalMeioMeio');
      }
    });
  }

  // ============================================
  // WHATSAPP - FORMATAÇÃO DA MENSAGEM
  // ============================================

  /**
   * Formata a lista de itens do carrinho para a mensagem do WhatsApp
   * @returns {string} Lista formatada dos itens
   */
  function formatCartItemsForWhatsApp() {
    return state.cart.map((item, index) => {
      let itemText = `${index + 1}. *${item.name}*`;
      
      // Adiciona tamanho se tiver (Grande/Broto)
      if (item.tamanho) {
        itemText += ` (${item.tamanho})`;
      }
      
      // Adiciona sabores se for meio a meio
      if (item.isMeioMeio && item.flavor) {
        itemText += `\n   Sabores: ${item.flavor}`;
      }
      
      // Adiciona quantidade e preço
      itemText += `\n   Qtd: ${item.quantity}x ${formatCurrency(item.price)}`;
      itemText += ` = *${formatCurrency(item.price * item.quantity)}*`;
      
      return itemText;
    }).join('\n\n');
  }

  /**
   * Formata a mensagem completa do pedido para WhatsApp
   * @param {Object} orderData - Dados do pedido
   * @returns {string} Mensagem formatada
   */
  function formatWhatsAppMessage(orderData) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Cabeçalho
    let message = `🍕 *NOVO PEDIDO - ${WHATSAPP_CONFIG.businessName}* 🍕\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Dados do cliente
    message += `👤 *DADOS DO CLIENTE*\n`;
    message += `Nome: ${orderData.client.name}\n`;
    message += `Telefone: ${orderData.client.phone}\n\n`;

    // Itens do pedido
    message += `📋 *PEDIDO*\n`;
    message += `${formatCartItemsForWhatsApp()}\n\n`;

    // Resumo financeiro
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *RESUMO*\n`;
    message += `Subtotal: ${formatCurrency(orderData.subtotal)}\n`;
    
    if (orderData.deliveryFee > 0) {
      message += `Taxa de Entrega: ${formatCurrency(orderData.deliveryFee)}\n`;
    }
    
    message += `*TOTAL: ${formatCurrency(orderData.total)}*\n\n`;

    // Forma de entrega
    message += `🚗 *ENTREGA*\n`;
    if (orderData.delivery.type === 'entrega') {
      message += `Tipo: Entrega\n`;
      message += `Endereço: ${orderData.delivery.address.street}, ${orderData.delivery.address.number}\n`;
      message += `Bairro: ${orderData.delivery.address.neighborhood}\n`;
      if (orderData.delivery.address.reference) {
        message += `Referência: ${orderData.delivery.address.reference}\n`;
      }
    } else {
      message += `Tipo: *Retirada na pizzaria*\n`;
    }
    message += '\n';

    // Forma de pagamento
    message += `💳 *PAGAMENTO*\n`;
    const paymentLabels = {
      cartao: 'Cartão (Crédito/Débito)',
      pix: 'Pix',
      dinheiro: 'Dinheiro'
    };
    message += `Método: ${paymentLabels[orderData.payment.method]}\n`;
    
    if (orderData.payment.method === 'dinheiro' && orderData.payment.needChange) {
      message += `Precisa de troco para: ${orderData.payment.changeAmount}\n`;
    } else if (orderData.payment.method === 'dinheiro') {
      message += `Não precisa de troco\n`;
    }
    message += '\n';

    // Observações
    if (orderData.obs) {
      message += `📝 *OBSERVAÇÕES*\n`;
      message += `${orderData.obs}\n\n`;
    }

    // Rodapé
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 Data: ${dateStr} às ${timeStr}\n`;
    message += `Obrigado pela preferência! 😊`;

    return message;
  }

  /**
   * Envia o pedido para o WhatsApp
   * @param {string} message - Mensagem formatada
   */
  function sendToWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${encodedMessage}`;
    
    // Abre o WhatsApp em nova aba
    window.open(whatsappURL, '_blank');
  }

  // ============================================
  // FINALIZAR PEDIDO
  // ============================================

  elements.checkoutBtn.addEventListener('click', () => {
    if (elements.checkoutBtn.disabled) return;

    const { subtotal, deliveryFee, totalPrice } = calculateCartTotal();

    // Busca o formulário ativo (clone visível)
    const activeForm = elements.cartItemsContainer.querySelector('.checkout-form');
    
    // Lê dados do formulário clonado ou original
    const nameInput = activeForm ? activeForm.querySelector('#clientName') : elements.clientName;
    const phoneInput = activeForm ? activeForm.querySelector('#clientPhone') : elements.clientPhone;
    const addressInput = activeForm ? activeForm.querySelector('#clientAddress') : elements.clientAddress;
    const numberInput = activeForm ? activeForm.querySelector('#clientNumber') : elements.clientNumber;
    const neighborhoodSelect = activeForm ? activeForm.querySelector('#clientNeighborhood') : elements.clientNeighborhood;
    const referenceInput = activeForm ? activeForm.querySelector('#clientReference') : elements.clientReference;
    const changeAmountInput = activeForm ? activeForm.querySelector('#changeAmount') : elements.changeAmount;
    const obsInput = activeForm ? activeForm.querySelector('#clientObs') : elements.clientObs;

    // Coleta dados do formulário
    const orderData = {
      client: {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : ''
      },
      delivery: {
        type: state.checkout.deliveryType,
        address: state.checkout.deliveryType === 'entrega' ? {
          street: addressInput ? addressInput.value.trim() : '',
          number: numberInput ? numberInput.value.trim() : '',
          neighborhood: neighborhoodSelect ? neighborhoodSelect.options[neighborhoodSelect.selectedIndex].text : '',
          reference: referenceInput ? referenceInput.value.trim() : ''
        } : null
      },
      payment: {
        method: state.checkout.paymentMethod,
        needChange: state.checkout.needChange,
        changeAmount: state.checkout.needChange && changeAmountInput ? changeAmountInput.value : null
      },
      items: state.cart,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: totalPrice,
      obs: obsInput ? obsInput.value.trim() : ''
    };

    console.log('Pedido:', orderData);

    // Formata a mensagem para WhatsApp
    const whatsappMessage = formatWhatsAppMessage(orderData);

    // Envia para o WhatsApp
    sendToWhatsApp(whatsappMessage);

    // Feedback visual
    const originalText = elements.checkoutBtn.textContent;
    elements.checkoutBtn.textContent = '✓ Abrindo WhatsApp...';
    elements.checkoutBtn.style.backgroundColor = '#25D366';

    setTimeout(() => {
      // Limpa carrinho e reseta formulário
      state.cart = [];
      state.checkout = {
        deliveryType: 'entrega',
        paymentMethod: null,
        needChange: false,
        deliveryFee: 0
      };

      updateCartUI();
      renderCartItems();
      closeModal('modalCarrinho');

      // Restaura botão
      elements.checkoutBtn.textContent = originalText;
      elements.checkoutBtn.style.backgroundColor = '';
    }, 2000);
  });

  // ============================================
  // RENDERIZAÇÃO DINÂMICA DO CARDÁPIO + PAGINAÇÃO
  // ============================================

  const ITEMS_PER_PAGE = 16;
  const paginationState = {
    pizzas: { page: 1, totalPages: 1 },
    bebidas: { page: 1, totalPages: 1 },
    doces: { page: 1, totalPages: 1 }
  };

  function createCardHTML(item) {
    const isBebida = item.categoria === 'bebidas';
    const cardClass = isBebida ? 'card card--horizontal' : 'card';
    const imgContainerClass = isBebida ? 'card__image-container card__image-container--small' : 'card__image-container';

    let buttonsHtml = '';
    if (item.precoBroto && item.categoria === 'pizzas') {
      buttonsHtml = `
        <button class="card__btn-add card__btn-add--com-broto" data-product="${item.id}">
          Adicionar
        </button>
        <div class="size-popup" data-popup-for="${item.id}">
          <span class="size-popup__title">Escolha o tamanho</span>
          <button class="size-popup__option" data-product="${item.id}" data-tamanho="Grande" data-price="${item.preco}">
            <span class="size-popup__label">Grande</span>
            <span class="size-popup__price">${formatCurrency(item.preco)}</span>
          </button>
          <button class="size-popup__option size-popup__option--broto" data-product="${item.id}" data-tamanho="Broto" data-price="${item.precoBroto}">
            <span class="size-popup__label">Broto</span>
            <span class="size-popup__price">${formatCurrency(item.precoBroto)}</span>
          </button>
        </div>
      `;
    } else {
      buttonsHtml = `
        <button class="card__btn-add" data-product="${item.id}" data-price="${item.preco}">
          Adicionar
        </button>
      `;
    }

    return `
      <article class="${cardClass}">
        <div class="${imgContainerClass}">
          <img src="${item.imagem}" alt="${item.nome}" class="card__image" loading="lazy">
        </div>
        <div class="card__body">
          <h3 class="card__title">${item.nome}</h3>
          <p class="card__description">${item.descricao}</p>
          <div class="card__footer">
            <div class="card__buttons">
              ${buttonsHtml}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderPagination(categoria, totalPages, currentPage) {
    const paginationId = {
      'pizzas': 'paginationPizzas',
      'bebidas': 'paginationBebidas',
      'doces': 'paginationDoces'
    };

    const paginationEl = document.getElementById(paginationId[categoria]);
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.classList.remove('pagination--visible');
      paginationEl.innerHTML = '';
      return;
    }

    paginationEl.classList.add('pagination--visible');

    let html = '';

    html += `<button class="pagination__btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination__btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('.pagination__btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const page = this.dataset.page;
        if (page === 'prev') {
          paginationState[categoria].page = Math.max(1, currentPage - 1);
        } else if (page === 'next') {
          paginationState[categoria].page = Math.min(totalPages, currentPage + 1);
        } else {
          paginationState[categoria].page = parseInt(page);
        }
        renderizarCardapio(categoria);
      });
    });
  }

  function renderizarCardapio(categoria) {
    const containerMap = {
      'pizzas': document.getElementById('cardsPizzas'),
      'bebidas': document.getElementById('cardsBebidas'),
      'doces': document.getElementById('cardsSobremesas')
    };

    const container = containerMap[categoria];
    if (!container) return;

    container.innerHTML = '';

    const itens = cardapio.filter(item => item.categoria === categoria);
    const isDesktop = window.innerWidth >= 768;
    const perPage = isDesktop ? ITEMS_PER_PAGE : itens.length;
    const totalPages = Math.ceil(itens.length / perPage);

    paginationState[categoria].totalPages = totalPages;
    if (paginationState[categoria].page > totalPages) {
      paginationState[categoria].page = totalPages;
    }

    const currentPage = paginationState[categoria].page;
    const startIndex = (currentPage - 1) * perPage;
    const pageItems = isDesktop ? itens.slice(startIndex, startIndex + perPage) : itens;

    pageItems.forEach(item => {
      container.insertAdjacentHTML('beforeend', createCardHTML(item));
    });

    container.querySelectorAll('.card__btn-add:not(.card__btn-add--com-broto):not(.card__btn-add--meioameio)').forEach(btn => {
      btn.addEventListener('click', handleAddToCart);
    });

    renderPagination(categoria, totalPages, currentPage);

    console.log(`Renderizados ${pageItems.length} itens na categoria "${categoria}" (página ${currentPage}/${totalPages})`);
  }

  function handleAddToCart(e) {
    e.stopPropagation();

    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const price = parseFloat(btn.dataset.price);
    const tamanho = btn.dataset.tamanho || '';

    const item = cardapio.find(p => p.id === parseInt(productId));
    if (!item) return;

    const nomeFormatado = tamanho ? `${item.nome} (${tamanho})` : item.nome;

    const cartItem = {
      id: state.cart.length + 1,
      productId: item.id,
      name: nomeFormatado,
      price: price,
      quantity: 1,
      category: item.categoria,
      tamanho: tamanho
    };

    const existing = state.cart.find(c => c.productId === cartItem.productId && c.price === cartItem.price);
    if (existing) {
      existing.quantity++;
    } else {
      state.cart.push(cartItem);
    }

    updateCartUI();
    renderCartItems();
    openModal('modalCarrinho');
  }

  // ============================================
  // SISTEMA DE BUSCA
  // ============================================

  let searchActiveFilter = 'todos';

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  function searchMatchesQuery(item, query) {
    if (!query) return true;
    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

    const normalizedName = normalizeText(item.nome);
    const normalizedDesc = normalizeText(item.descricao);
    const combined = normalizedName + ' ' + normalizedDesc;

    return queryWords.every(word => combined.includes(word));
  }

  function searchMatchesFilter(item, filter) {
    if (filter === 'todos') return true;
    return item.categoria === filter;
  }

  function renderSearchResults(query) {
    const trimmedQuery = (query || '').trim();
    const container = document.getElementById('searchResults');
    if (!container) return;

    container.innerHTML = '';

    if (!trimmedQuery) {
      container.innerHTML = `
        <div class="search-empty">
          <p class="search-empty__icon">🔍</p>
          <p class="search-empty__text">Digite para buscar</p>
          <p class="search-empty__subtext">Busque por nome ou ingrediente</p>
        </div>
      `;
      return;
    }

    const results = cardapio.filter(item => {
      return searchMatchesQuery(item, trimmedQuery) && searchMatchesFilter(item, searchActiveFilter);
    });

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-empty">
          <p class="search-empty__icon">😔</p>
          <p class="search-empty__text">Nenhum resultado encontrado</p>
          <p class="search-empty__subtext">Tente buscar por outro termo</p>
        </div>
      `;
      return;
    }

    const countEl = document.createElement('div');
    countEl.className = 'search-results-count';
    countEl.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`;
    container.appendChild(countEl);

    results.forEach(item => {
      const card = createSearchResultCard(item);
      container.appendChild(card);
    });
  }

  function createSearchResultCard(item) {
    const div = document.createElement('div');
    div.className = 'search-result-card';

    const categoryLabels = {
      pizzas: 'Pizza',
      doces: 'Pizza Doce',
      bebidas: 'Bebida'
    };

    let pricesHtml = `<span class="search-result-card__price">${formatCurrency(item.preco)}</span>`;
    if (item.precoBroto) {
      pricesHtml += `<span class="search-result-card__price--broto">Broto: ${formatCurrency(item.precoBroto)}</span>`;
    }

    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="search-result-card__image" loading="lazy">
      <div class="search-result-card__info">
        <p class="search-result-card__name">${item.nome}</p>
        <p class="search-result-card__desc">${item.descricao}</p>
        <span class="search-result-card__category">${categoryLabels[item.categoria] || item.categoria}</span>
      </div>
      <div class="search-result-card__prices">
        ${pricesHtml}
      </div>
      <button class="search-result-card__add" data-product="${item.id}" aria-label="Adicionar ${item.nome}">+</button>
    `;

    const addBtn = div.querySelector('.search-result-card__add');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSearchAddToCart(item, false, addBtn);
    });

    if (item.precoBroto) {
      const brotoBtn = document.createElement('button');
      brotoBtn.className = 'search-result-card__add search-result-card__add--broto';
      brotoBtn.dataset.product = item.id;
      brotoBtn.setAttribute('aria-label', `Adicionar ${item.nome} Broto`);
      brotoBtn.textContent = 'Broto';
      brotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSearchAddToCart(item, true, brotoBtn);
      });
      div.querySelector('.search-result-card__prices').appendChild(brotoBtn);
    }

    return div;
  }

  function handleSearchAddToCart(item, isBroto, btn) {
    const tamanho = isBroto ? 'Broto' : (item.precoBroto !== null ? 'Grande' : '');
    const price = isBroto ? item.precoBroto : item.preco;
    const nomeFormatado = tamanho ? `${item.nome} (${tamanho})` : item.nome;

    const cartItem = {
      id: state.cart.length + 1,
      productId: item.id,
      name: nomeFormatado,
      price: price,
      quantity: 1,
      category: item.categoria,
      tamanho: tamanho
    };

    const existing = state.cart.find(c => c.productId === cartItem.productId && c.price === cartItem.price);
    if (existing) {
      existing.quantity++;
    } else {
      state.cart.push(cartItem);
    }

    updateCartUI();

    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = 'var(--color-primary)';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 1000);
  }

  function initSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (!searchInput) {
      console.warn('Elemento #searchInput não encontrado');
      return;
    }

    searchInput.addEventListener('input', function() {
      const query = this.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }
      renderSearchResults(query);
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchClearBtn.style.display = 'none';
        renderSearchResults('');
        searchInput.focus();
      });
    }

    document.querySelectorAll('[data-search-filter]').forEach(function(pill) {
      pill.addEventListener('click', function() {
        searchActiveFilter = pill.dataset.searchFilter;
        document.querySelectorAll('[data-search-filter]').forEach(function(p) {
          p.classList.toggle('search-filter-pill--active', p.dataset.searchFilter === searchActiveFilter);
        });
        var currentQuery = searchInput ? searchInput.value : '';
        renderSearchResults(currentQuery);
      });
    });
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  function init() {
    // Mostra apenas a primeira seção (pizzas)
    elements.sections.forEach(section => {
      if (section.dataset.section !== 'pizzas') {
        section.hidden = true;
      }
    });

    // Esconde botão flutuante do carrinho inicialmente
    elements.cartFloating.style.display = 'none';

    // Renderiza cardápio inicial (pizzas)
    renderizarCardapio('pizzas');

    // Renderiza opções do meio a meio
    renderMeioMeioOptions();

    // Bind eventos do formulário original (será clonado depois)
    bindFormEvents(elements.checkoutForm);

    // Inicializa eventos de busca
    initSearchEvents();

    // Inicializa swipe-to-close no bottom sheet do carrinho
    initBottomSheetSwipe();

    // Inicializa hamburger menu e modais
    initHamburgerMenu();
    initModals();

    // Re-renderiza ao mudar tamanho da tela (mobile <-> desktop)
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        var activeCat = state.activeCategory;
        var catMap = { 'pizzas': 'pizzas', 'bebidas': 'bebidas', 'sobremesas': 'doces' };
        var cat = catMap[activeCat] || 'pizzas';
        renderizarCardapio(cat);
      }, 250);
    });

    // Adiciona feedback visual nos botões (efeito de clique)
    addTouchFeedback();

    console.log('🍕 Bella Pizza - App inicializada com cardápio dinâmico!');
  }

  // ============================================
  // FEEDBACK VISUAL (EFEITO DE CLIQUE)
  // ============================================

  function addTouchFeedback() {
    // Efeito de ripple nos botões interativos
    const interactiveElements = document.querySelectorAll(
      '.category-pill, .bottom-nav__item, .card__btn-add, .modal__btn'
    );
    
    interactiveElements.forEach(el => {
      el.addEventListener('click', function(e) {
        // Cria efeito de onda
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          width: 100px;
          height: 100px;
          margin-top: -50px;
          margin-left: -50px;
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ============================================
  // HAMBURGER MENU & MODAIS
  // ============================================

  function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const menuItems = document.querySelectorAll('.hamburger-menu__item');

    if (!hamburgerBtn || !hamburgerMenu) return;

    // Toggle menu
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerBtn.classList.toggle('hamburger-btn--active');
      hamburgerMenu.classList.toggle('hamburger-menu--active');
    });

    // Close menu on outside click
    document.addEventListener('click', () => {
      hamburgerBtn.classList.remove('hamburger-btn--active');
      hamburgerMenu.classList.remove('hamburger-menu--active');
    });

    // Open modal on menu item click
    menuItems.forEach((item) => {
      item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        const modalId = page === 'sobre' ? 'modalSobre' : 'modalContato';
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('modal--active');
          document.body.style.overflow = 'hidden';
        }
        // Close hamburger menu
        hamburgerBtn.classList.remove('hamburger-btn--active');
        hamburgerMenu.classList.remove('hamburger-menu--active');
      });
    });
  }

  function initModals() {
    // Close modal on overlay or close button click
    document.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', () => {
        const modalId = el.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.remove('modal--active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal--active').forEach((modal) => {
          modal.classList.remove('modal--active');
          document.body.style.overflow = '';
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
