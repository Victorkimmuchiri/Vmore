import React, { createContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTION_PRODUCTS } from '../data/collection_data';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(COLLECTION_PRODUCTS);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('vmore_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('vmore_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('vmore_reviews');
    return savedReviews ? (Array.isArray(JSON.parse(savedReviews)) ? JSON.parse(savedReviews) : []) : [];
  });
  const [siteContent, setSiteContent] = useState({
    heroTitle: 'Heritage in Every Thread',
    heroSubtitle: 'Discover handcrafted African artifacts, textiles, and jewelry that tell a story of rhythm, culture, and timeless artistry.',
    ourStoryTitle: 'The Rhythm of Creation',
    ourStoryBody: 'Every piece in our collection carries the heartbeat of the artisans who crafted it. From the delicate tines of the Mbira to the resounding boom of the Djembe, African musical instruments have long been vessels of storytelling, spiritual connection, and community joy.\n\nWe founded VMORE to translate this rich sonic heritage into wearable art and tangible artifacts. Our artisans across the continent employ centuries-old techniques—brass casting, beadwork, and loom weaving—to create pieces that don\'t just look beautiful, but resonate with meaning.'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const fetched = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(fetched);
        }
      } catch (err) {
        console.log("Firebase not configured or empty for products, using local pinterest_data.");
      }
    };

    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'site'));
        if (docSnap.exists()) {
          setSiteContent(docSnap.data());
        }
      } catch (err) {
        console.log("Firebase not configured or empty for settings, using local defaults.");
      }
    };

    const fetchReviews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        if (!querySnapshot.empty) {
          const fetched = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setReviews(fetched);
        }
      } catch (err) {
        console.log("Firebase not configured or empty for reviews, using local defaults.");
      }
    };

    fetchProducts();
    fetchSettings();
    fetchReviews();
  }, []);

  useEffect(() => {
    localStorage.setItem('vmore_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vmore_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('vmore_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen(v => !v), []);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  const getProductReviews = useCallback((productId) => {
    return reviews.filter(r => String(r.productId) === String(productId) && r.approved === true);
  }, [reviews]);

  const getProductRating = useCallback((productId) => {
    const productReviews = reviews.filter(r => String(r.productId) === String(productId) && r.approved === true);
    if (productReviews.length === 0) return null;
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    return { rating: Math.round(avgRating * 10) / 10, reviewCount: productReviews.length };
  }, [reviews]);

  const addReview = useCallback(async (review) => {
    const newReview = { ...review, approved: false };
    try {
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews(prev => [...prev, { id: docRef.id, ...newReview }]);
      alert("Thank you! Your review has been submitted and is pending moderation.");
    } catch (err) {
      console.error("Error adding review:", err);
      setReviews(prev => [...prev, { id: Date.now().toString(), ...newReview }]);
      alert("Thank you! Your review has been submitted (Offline Mode).");
    }
  }, []);

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <StoreContext.Provider value={{
      products, cart, cartCount, cartTotal, setCart, clearCart,
      addToCart, removeFromCart, updateQuantity,
      isCartOpen, toggleCart,
      wishlist, toggleWishlist, isWishlisted,
      reviews, getProductReviews, addReview, getProductRating,
      siteContent
    }}>
      {children}
    </StoreContext.Provider>
  );
};
