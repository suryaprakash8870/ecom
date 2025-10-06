'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
    const handler = () => fetchCartItems();
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:updated', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:updated', handler);
      }
    };
  }, []);

  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      } else {
        toast.error('Failed to load cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        if (newQuantity === 0) {
          setCartItems(prev => prev.filter(item => item.product_id !== productId));
          toast.success('Item removed from cart');
        } else {
          setCartItems(prev => 
            prev.map(item => 
              item.product_id === productId 
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
          toast.success('Cart updated');
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart:updated'));
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    await updateQuantity(productId, 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return <LoadingSpinner text="Loading cart..." />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="btn-primary text-lg px-8 py-3"
            >
              Start Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart Items ({cartItems.length})
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Stock: {item.stock_quantity} available
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-primary-600">
                            {formatPrice(item.discount_price || item.price)}
                          </span>
                          {item.discount_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={updating[item.product_id] || item.quantity <= 1}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-12 text-center font-medium">
                          {updating[item.product_id] ? (
                            <div className="spinner mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={updating[item.product_id] || item.quantity >= item.stock_quantity}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product_id)}
                        disabled={updating[item.product_id]}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                className="w-full btn-primary text-lg py-3 mb-4"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => router.push('/products')}
                className="w-full btn-outline"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
