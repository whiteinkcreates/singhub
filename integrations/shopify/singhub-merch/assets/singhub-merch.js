(() => {
  function mount(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = 'true';
    const bag = root.querySelector('#sh-bag');
    const lines = root.querySelector('[data-cart-lines]');
    const status = root.querySelector('[data-bag-status]');
    const checkout = root.querySelector('[data-checkout]');
    const prefix = root.dataset.root || '/';
    let mutating = false;
    let cartReady = false;
    let cartCount = 0;
    let loadVersion = 0;

    const destinations = {
      account: 'https://singhub.app/account#merch',
      discover: 'https://singhub.app/',
      venues: 'https://singhub.app/find-karaoke',
      hosts: 'https://singhub.app/hosts',
      hotels: 'https://singhub.app/hotel',
      singboard: 'https://singhub.app/singboard',
    };
    try {
      const entry = new URLSearchParams(location.search).get('entry');
      if (entry && destinations[entry]) sessionStorage.setItem('singhub-merch-entry', entry);
      const back = destinations[sessionStorage.getItem('singhub-merch-entry')] || destinations.account;
      root.querySelector('[data-entry-return]').href = back;
    } catch { /* Storage is optional; the fixed return link remains available. */ }

    const money = (amount, currency) => new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
      style: 'currency', currency: currency || root.dataset.currency || 'USD',
    }).format(amount / 100);
    const element = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    const imageUrl = (value) => {
      if (typeof value !== 'string' || !value.trim()) return '';
      try {
        const url = new URL(value, location.origin);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
      } catch { return ''; }
    };

    async function request(path, data) {
      const response = await fetch(prefix + path, {
        credentials: 'same-origin', cache: 'no-store',
        ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
      });
      let result;
      try { result = await response.json(); }
      catch { throw new Error('The store could not respond. Use Open full cart or try again.'); }
      if (!response.ok) throw new Error(typeof result.description === 'string' ? result.description : 'The store could not update your bag. Please try again.');
      return result;
    }
    function updateDisabled() {
      root.querySelectorAll('.sh-add').forEach(button => { button.disabled = mutating || button.dataset.available !== 'true'; });
      lines.querySelectorAll('button').forEach(button => { button.disabled = mutating; });
      checkout.disabled = mutating || !cartReady || !cartCount;
    }
    function render(cart) {
      cartReady = true;
      cartCount = cart.item_count;
      root.querySelector('[data-cart-count]').textContent = cart.item_count;
      root.querySelector('[data-subtotal]').textContent = money(cart.total_price, cart.currency);
      lines.replaceChildren();
      if (!cart.items.length) {
        lines.append(element('p', 'Your bag is waiting for its first encore.'));
      }
      for (const item of cart.items) {
        const row = element('article', undefined, 'sh-cart-line');
        const photo = element('div');
        const src = imageUrl(item.image || item.featured_image?.url);
        if (src) {
          const img = element('img'); img.src = src; img.alt = item.product_title; photo.append(img);
        }
        const copy = element('div');
        copy.append(element('h3', item.product_title));
        if (item.variant_title && item.variant_title !== 'Default Title') copy.append(element('p', item.variant_title));
        const price = element('p', money(item.final_line_price, cart.currency));
        price.setAttribute('aria-label', 'Line total'); copy.append(price);
        if (item.line_level_discount_allocations?.length) {
          copy.append(element('p', item.line_level_discount_allocations.map(d => d.discount_application.title).join(', ')));
        }
        const controls = element('div', undefined, 'sh-line-controls');
        for (const [label, quantity] of [['−', item.quantity - 1], ['+', item.quantity + 1]]) {
          const button = element('button', label); button.type = 'button';
          button.setAttribute('aria-label', (label === '+' ? 'Increase' : 'Decrease') + ' quantity of ' + item.product_title);
          button.addEventListener('click', () => change(item.key, quantity)); controls.append(button);
          if (label === '−') controls.append(element('span', String(item.quantity)));
        }
        const remove = element('button', 'Remove', 'sh-remove'); remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove ' + item.product_title);
        remove.addEventListener('click', () => change(item.key, 0)); controls.append(remove);
        copy.append(controls); row.append(photo, copy); lines.append(row);
      }
      updateDisabled();
    }
    async function refresh() {
      const version = ++loadVersion;
      const cart = await request('cart.js');
      if (version === loadVersion) render(cart);
    }
    async function change(id, quantity) {
      if (mutating) return;
      mutating = true; loadVersion++; status.textContent = 'Updating your bag…'; updateDisabled();
      try { render(await request('cart/change.js', { id, quantity })); status.textContent = 'Bag updated.'; }
      catch (error) {
        status.textContent = error.message;
        try { await refresh(); } catch { cartReady = false; }
      } finally { mutating = false; updateDisabled(); }
    }
    function openBag() {
      if (!bag.open) bag.showModal();
      status.textContent = 'Checking your bag…';
      refresh().then(() => { status.textContent = ''; }).catch(error => {
        cartReady = false; updateDisabled(); status.textContent = error.message;
      });
    }
    root.querySelector('[data-open-bag]').addEventListener('click', openBag);
    root.querySelector('[data-close-bag]').addEventListener('click', () => bag.close());
    bag.addEventListener('click', event => { if (event.target === bag) bag.close(); });

    for (const form of root.querySelectorAll('.sh-product-form')) {
      const select = form.querySelector('[data-variant]');
      select?.addEventListener('change', () => {
        const option = select.selectedOptions[0]; const card = form.closest('[data-product]');
        card.querySelector('[data-price]').textContent = option.dataset.price;
        const compare = card.querySelector('[data-compare]');
        compare.textContent = option.dataset.compare; compare.hidden = !option.dataset.compare;
        const src = imageUrl(option.dataset.image); const image = card.querySelector('.sh-product-photo');
        if (src && image) { image.removeAttribute('srcset'); image.src = src; }
      });
      form.addEventListener('submit', async event => {
        event.preventDefault(); if (mutating) return;
        const data = new FormData(form); const id = String(data.get('id') || '');
        const message = form.querySelector('[role="status"]');
        if (!/^\d+$/.test(id)) { message.textContent = 'Choose an available option first.'; return; }
        mutating = true; loadVersion++; updateDisabled(); message.textContent = 'Adding to your bag…';
        let added = false;
        try {
          await request('cart/add.js', { items: [{ id, quantity: 1 }] }); added = true;
          await refresh(); message.textContent = 'Added to your bag.';
          if (!bag.open) bag.showModal(); status.textContent = '';
        } catch (error) {
          // Inventory limits can change the cart even when Shopify returns 422.
          try { await refresh(); } catch { cartReady = false; }
          message.textContent = added ? 'Added. Open your bag to review it before adding again.' : error.message;
          status.textContent = error.message;
        } finally { mutating = false; updateDisabled(); }
      });
    }
    refresh().catch(() => { cartReady = false; updateDisabled(); });
  }
  document.querySelectorAll('[data-singhub-merch]').forEach(mount);
  document.addEventListener('shopify:section:load', event => {
    event.target.querySelectorAll('[data-singhub-merch]').forEach(mount);
  });
})();
