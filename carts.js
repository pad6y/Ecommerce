const express = require('express');
const cartsRepo = require('../repo/carts');
const productsRepo = require('../repo/products');
const router = express.Router();
const cartTemplate = require('../views/cart/index');

router.post('/cart/products', async (req, res) => {
  const productId = req.body.productId;

  let cart;
  if (!req.session.cartId) {
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  const existingItem = cart.items.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({ id: productId, quantity: 1 });
  }

  await cartsRepo.update(cart.id, { items: cart.items });

  res.redirect('/');
});

router.get('/cart', async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.redirect('/');

  const foundCart = await cartsRepo.getOne(cartId);

  for (let item of foundCart.items) {
    const product = await productsRepo.getOne(item.id);

    item.product = product;
  }
  res.send(cartTemplate({ items: foundCart.items }));
});

router.post('/cart/product/delete', async (req, res) => {
  const { productId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => item.id !== productId);
  await cartsRepo.update(req.session.cartId, { items });

  res.redirect('/cart');
});

module.exports = router;
