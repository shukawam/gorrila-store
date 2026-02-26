import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CartPage from './CartPage';
import AskAIDialog from './AskAIDialog';
import './App.css';

function ProductList({
  products,
  handleAddToCart,
  cartItemCount,
}) {
  const [askAIOpen, setAskAIOpen] = useState(false);

  return (
    <>
      <header className="App-header">
        <h1>Gorilla Store</h1>
        <nav>
          <button className="ask-ai-btn" onClick={() => setAskAIOpen(true)}>Ask AI</button>
          <Link to="/cart" className="cart-link">View Cart ({cartItemCount})</Link>
        </nav>
      </header>
      {askAIOpen && <AskAIDialog onClose={() => setAskAIOpen(false)} />}
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product">
            <img src={product.imageUrl} alt={product.name} />
            <h2>{product.name}</h2>
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = () => {
    fetch('/cart')
      .then((response) => response.json())
      .then((data) => setCartItems(data))
      .catch((error) => console.error('Error fetching cart items:', error));
  };

  const handleAddToCart = (product) => {
    fetch('/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Item added to cart:', data);
        fetchCartItems(); // Refresh cart items after adding
      })
      .catch((error) => {
        console.error('Error adding item to cart:', error);
        alert('Error removing item to cart.');
      });
  };

  useEffect(() => {
    fetch('/catalogue')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
    fetchCartItems();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProductList
              products={products}
              handleAddToCart={handleAddToCart}
              cartItemCount={cartItems.length}
            />
          }
        />
        <Route path="/cart" element={<CartPage fetchCartItems={fetchCartItems} />} />
      </Routes>
    </Router>
  );
}

export default App;
