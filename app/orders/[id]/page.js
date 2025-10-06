'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BackButton from '../../../components/BackButton';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, CreditCard, User } from 'lucide-react';

export default function OrderDetail() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);

  const fetchOrder = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        toast.error('Order not found');
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been placed' },
      { key: 'confirmed', label: 'Confirmed', description: 'Order confirmed by seller' },
      { key: 'shipped', label: 'Shipped', description: 'Order is on its way' },
      { key: 'delivered', label: 'Delivered', description: 'Order delivered successfully' }
    ];

    const currentIndex = steps.findIndex(step => step.key === order.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <button
            onClick={() => router.push('/orders')}
            className="btn-primary mt-4"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const orderSteps = getOrderSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-4 items-center justify-between" aria-label="Breadcrumb">
          <BackButton />
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-700 hover:text-primary-600"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-500 mx-2">/</span>
                <button
                  onClick={() => router.push('/orders')}
                  className="text-gray-700 hover:text-primary-600"
                >
                  My Orders
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-gray-500">#{order.order_number}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-gray-600">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(order.total_amount)}
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Tracking</h2>
              
              <div className="space-y-4">
                {orderSteps.map((step, index) => (
                  <div key={step.key} className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-primary-600 text-white' 
                        : step.current 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className={`text-sm font-medium ${
                        step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600">
                  {order.shipping_address && (
                    <>
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p>{order.shipping_address.address}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p>{order.shipping_address.pincode}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Information
                </h3>
                <div className="text-sm text-gray-600">
                  <p>Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p>Status: <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' : 
                    order.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span></p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.total_amount)}</span>
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
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full btn-primary"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full btn-outline"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
