// カート機能
const Cart = {
  // カートデータを取得
  getItems() {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  },

  // カートデータを保存
  saveItems(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.updateCartCount();
  },

  // カートに商品を追加
  addItem(id, name, price) {
    const items = this.getItems();
    const existingItem = items.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ id, name, price, quantity: 1 });
    }

    this.saveItems(items);
    this.showNotification(`${name} をカートに追加しました`);
  },

  // 数量を更新
  updateQuantity(id, quantity) {
    const items = this.getItems();
    const item = items.find(item => item.id === id);

    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveItems(items);
    }
  },

  // 商品を削除
  removeItem(id) {
    const items = this.getItems().filter(item => item.id !== id);
    this.saveItems(items);
  },

  // カートをクリア
  clear() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  },

  // 小計を計算（税抜）
  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // 消費税を計算（10%）
  getTax() {
    return Math.floor(this.getSubtotal() * 0.1);
  },

  // 合計金額を計算（税込）
  getTotal() {
    return this.getSubtotal() + this.getTax();
  },

  // 商品数を計算
  getItemCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  // カート数を更新
  updateCartCount() {
    const countElements = document.querySelectorAll('#cart-count');
    const count = this.getItemCount();
    countElements.forEach(el => {
      el.textContent = count;
    });
  },

  // 通知を表示
  showNotification(message) {
    // 既存の通知を削除
    const existing = document.querySelector('.cart-notification');
    if (existing) {
      existing.remove();
    }

    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // アニメーション
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  },

  // 金額をフォーマット
  formatPrice(price) {
    return '¥' + price.toLocaleString();
  }
};

// グローバル関数としてaddToCartを定義
function addToCart(id, name, price) {
  Cart.addItem(id, name, price);
}

// カートページの表示
function renderCartPage() {
  const items = Cart.getItems();
  const emptyEl = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');
  const itemsEl = document.getElementById('cart-items');

  if (!itemsEl) return;

  if (items.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  itemsEl.innerHTML = items.map(item => `
    <tr data-id="${item.id}">
      <td class="cart-item-name">${item.name}</td>
      <td class="cart-item-price">${Cart.formatPrice(item.price)}</td>
      <td class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">−</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">＋</button>
      </td>
      <td class="cart-item-subtotal">${Cart.formatPrice(item.price * item.quantity)}</td>
      <td class="cart-item-remove">
        <button class="remove-btn" onclick="removeCartItem('${item.id}')">削除</button>
      </td>
    </tr>
  `).join('');

  // 金額計算を更新
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total-price');

  if (subtotalEl) subtotalEl.textContent = Cart.formatPrice(Cart.getSubtotal());
  if (taxEl) taxEl.textContent = Cart.formatPrice(Cart.getTax());
  if (totalEl) totalEl.textContent = Cart.formatPrice(Cart.getTotal());
}

// 数量更新
function updateCartQuantity(id, quantity) {
  if (quantity < 1) {
    removeCartItem(id);
  } else {
    Cart.updateQuantity(id, quantity);
    renderCartPage();
  }
}

// 商品削除
function removeCartItem(id) {
  Cart.removeItem(id);
  renderCartPage();
}

// 注文ページの表示
function renderOrderPage() {
  const items = Cart.getItems();
  const itemsEl = document.getElementById('order-items');

  if (!itemsEl) return;

  // カートが空の場合はカートページへリダイレクト
  if (items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  itemsEl.innerHTML = items.map(item => `
    <div class="order-item">
      <span class="order-item-name">${item.name}</span>
      <span class="order-item-detail">× ${item.quantity}</span>
      <span class="order-item-price">${Cart.formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  // 金額計算を更新
  const subtotalEl = document.getElementById('order-subtotal');
  const taxEl = document.getElementById('order-tax');
  const totalEl = document.getElementById('order-total-price');

  if (subtotalEl) subtotalEl.textContent = Cart.formatPrice(Cart.getSubtotal());
  if (taxEl) taxEl.textContent = Cart.formatPrice(Cart.getTax());
  if (totalEl) totalEl.textContent = Cart.formatPrice(Cart.getTotal());

  // 法人/個人の切り替え
  const customerTypeRadios = document.querySelectorAll('input[name="customer-type"]');
  const corporateFields = document.querySelectorAll('.corporate-field');

  customerTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      corporateFields.forEach(field => {
        field.style.display = radio.value === 'corporate' && radio.checked ? 'block' : 'none';
        const input = field.querySelector('input');
        if (input) {
          input.required = radio.value === 'corporate' && radio.checked;
        }
      });
    });
  });

  // フォーム送信
  const form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // メールアドレス確認
      const email = document.getElementById('email').value;
      const emailConfirm = document.getElementById('email-confirm').value;
      if (email !== emailConfirm) {
        alert('メールアドレスが一致しません');
        return;
      }

      // 注文完了処理（実際はサーバーに送信）
      Cart.clear();
      window.location.href = 'order-complete.html';
    });
  }
}

// カタログページのタブ切り替え
function initCatalogTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const categories = document.querySelectorAll('.catalog-category');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;

      // タブのアクティブ状態を更新
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // カテゴリの表示を切り替え
      categories.forEach(c => {
        c.classList.toggle('hidden', c.id !== category);
      });
    });
  });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // カート数を更新
  Cart.updateCartCount();

  // ページに応じた初期化
  if (document.getElementById('cart-items')) {
    renderCartPage();
  }

  if (document.getElementById('order-items')) {
    renderOrderPage();
  }

  if (document.querySelector('.catalog-tabs')) {
    initCatalogTabs();
  }
});
