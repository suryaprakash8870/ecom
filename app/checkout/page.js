'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CreditCard, Smartphone, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    payment_method: 'cod'
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchCartItems();
  }, [router]);

  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
        
        if (data.cart.length === 0) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
      } else {
        toast.error('Failed to load cart items');
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('shipping_')) {
      const field = name.replace('shipping_', '');
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Order placed successfully!');
        router.push(`/orders/${data.order.id}`);
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return <LoadingSpinner text="Loading checkout..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    value={formData.shipping_address.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={formData.shipping_address.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="label">Address *</label>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-field"
                    placeholder="Enter your complete address"
                  />
                </div>
                
                <div>
                  <label className="label">City *</label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={formData.shipping_address.city}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your city"
                  />
                </div>
                
                <div>
                  <label className="label">State *</label>
                  <input
                    type="text"
                    name="shipping_state"
                    value={formData.shipping_address.state}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your state"
                  />
                </div>
                
                <div>
                  <label className="label">Pincode *</label>
                  <input
                    type="text"
                    name="shipping_pincode"
                    value={formData.shipping_address.pincode}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your pincode"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when your order arrives</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Online Payment</div>
                      <div className="text-sm text-gray-500">Pay securely with card or UPI</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice((item.discount_price || item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
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
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  submitting
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" />
                    Placing Order...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
