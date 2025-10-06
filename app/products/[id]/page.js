'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../../components/Header';
import BackButton from '../../../components/BackButton';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewMedia, setReviewMedia] = useState([]);
  
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(0);
        }
        fetchRelatedProducts(data.product.category_id);
        loadReviews();
      } else {
        toast.error('Product not found');
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await fetch(`/api/products?category=${categoryId}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data.products.filter(p => p.id !== parseInt(params.id)));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (_) {}
  };

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        toast.success('Added to cart successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    await addToCart();
    if (localStorage.getItem('token')) {
      router.push('/checkout');
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Login to use wishlist');
    try {
      await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ product_id: product.id }) });
      toast.success('Added to wishlist');
    } catch (_) { toast.error('Wishlist failed'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Login to review');
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rating: myRating, title: '', body: reviewBody, media_urls: reviewMedia }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to add review');
      setMyRating(0); setReviewBody(''); setReviewMedia([]);
      loadReviews();
      toast.success('Review added');
    } catch (_) { toast.error('Failed to add review'); }
  };

  const uploadReviewFile = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/reviews/upload', { method: 'POST', body: form, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    setReviewMedia((prev) => [...prev, data.url]);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product.discount_price) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return 0;
  };

  if (loading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary mt-4"
          >
            Back to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container py-8">
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
                  onClick={() => router.push('/products')}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Products
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-gray-500 truncate">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-lg">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl border-2 overflow-hidden ${
                      selectedImage === index ? 'border-primary-500' : 'border-neutral-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">(4.0) • 128 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.discount_price || product.price)}
                </span>
                {product.discount_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      {calculateDiscount()}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.stock_quantity > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock_quantity > 0 && (
                <span className="text-sm text-gray-600">
                  {product.stock_quantity} available
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={addingToCart}
                    className="flex-1 btn-primary flex items-center justify-center py-3"
                  >
                    {addingToCart ? (
                      <div className="spinner mr-2" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={buyNow}
                    disabled={addingToCart}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Buy Now
                  </button>
                  <button onClick={toggleWishlist} className="p-3 border rounded-xl"> <Heart className="h-5 w-5" /> </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-500">All over India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-500">7 days return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <button
                    onClick={() => router.push(`/products/${relatedProduct.id}`)}
                    className="w-full"
                  >
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(relatedProduct.discount_price || relatedProduct.price)}
                        </span>
                        {relatedProduct.discount_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <select className="input-field max-w-xs" onChange={(e)=>{
              fetch(`/api/products/${product.id}/reviews?sort=${e.target.value}`).then(r=>r.json()).then(d=>setReviews(d.reviews||[]));
            }}>
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{r.user_name || 'Anonymous'}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {r.title && <div className="mt-1 font-semibold">{r.title}</div>}
                  {r.body && <div className="text-gray-700 mt-1">{r.body}</div>}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div>{new Date(r.created_at).toLocaleString('en-IN')}</div>
                    <button className="text-primary-600" onClick={async()=>{
                      const token = localStorage.getItem('token');
                      if(!token) return toast.error('Login to vote');
                      const res = await fetch(`/api/reviews/${r.id}/helpful`, { method:'POST', headers:{ 'Authorization': `Bearer ${token}` }});
                      if(res.ok){ toast.success('Thanks!'); fetch(`/api/products/${product.id}/reviews?sort=helpful`).then(r=>r.json()).then(d=>setReviews(d.reviews||[])); }
                    }}>Helpful ({r.helpful_count || 0})</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={submitReview} className="mt-6 space-y-3">
            <div>
              <label className="label">Your Rating</label>
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <button type="button" key={i} onClick={() => setMyRating(i)}>
                    <Star className={`h-6 w-6 ${i <= myRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Your Review</label>
              <textarea className="input-field" rows={3} value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="Share your experience" />
            </div>
            <div>
              <label className="label">Add Images/Videos</label>
              <input type="file" accept="image/*,video/mp4" onChange={async(e)=>{ try { await uploadReviewFile(e.target.files[0]); toast.success('Uploaded'); } catch(err){ toast.error(err.message); } }} />
              {reviewMedia.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {reviewMedia.map((m,i)=> (
                    m.endsWith('.mp4') ? (
                      <video key={i} controls className="w-full h-24 object-cover rounded" src={m} />
                    ) : (
                      <img key={i} className="w-full h-24 object-cover rounded" src={m} alt="review media" />
                    )
                  ))}
                </div>
              )}
            </div>
            <button className="btn-primary">Submit Review</button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
