import axios from 'axios';
import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../Auth/AuthContext';

export const ProductsContext = createContext();

export default function ProductsContextProvider(props) {
  const { Token } = useContext(AuthContext);
  const BaseUrl = "https://ecommerce.routemisr.com/api/v1";

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [brandFilter, setBrandFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sortingType, setSortingType] = useState('latest');

  const [brands, setBrands] = useState([]);

  const [categories, setCategories] = useState([]);

  const [wishlist, setWishlist] = useState([]);

  const [cart, setCart] = useState([]);

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: sortingType };
      if (brandFilter) {
        params.brand = brandFilter;
      }
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      const { data } = await axios.get(`${BaseUrl}/products`, { params });
      setProducts(data.data);

    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sortingType, brandFilter, categoryFilter])


  const getProductDetails = useCallback(async (productId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BaseUrl}/products/${productId}`);
      return { data: data.data, error: false, isInWishlist: wishlist.some(item => item._id === productId), isInCart: cart?.data?.products?.some(item => item.product?._id === productId) };
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Error fetching product details. Please try again later.");
      return { data: null, error: true, isInWishlist: false, isInCart: false };
    } finally {
      setLoading(false);
    }
  }, [wishlist, cart]);

  const getBrands = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BaseUrl}/brands`);
      setBrands(data.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Error fetching brands. Please try again later.");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BaseUrl}/categories`);
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories. Please try again later.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const getWishlist = useCallback(async () => {
    if (!Token) {
      setWishlist([]);
      return;
    }
    try {
      const { data } = await axios.get(`${BaseUrl}/wishlist`, {
        headers: {
          token: Token
        }
      });
      setWishlist(data.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Error fetching wishlist. Please try again later.");
      setWishlist([]);
    }
  }, [Token])

  const getCart = useCallback(async () => {
    if (!Token) {
      setCart([]);
      return;
    }
    try {
      const { data } = await axios.get(`${BaseUrl}/cart`, {
        headers: {
          token: Token
        }
      });
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Error fetching cart. Please try again later.");
      setCart([]);
    }
  }, [Token])

  async function changeCartCount(productId, count) {
    setLoading(true);
    if (!Token) {
      toast.error("You need to be logged in to manage your cart.");
      return;
    }
    try {
      const { data } = await axios.put(`${BaseUrl}/cart/${productId}`, {
        "count": count
      }, {
        headers: { "token": Token }
      });
      setCart(data);
      toast.success("Cart updated successfully.");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Error updating cart. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function CartToggle(product_id, isInCart) {
    if (!Token) {
      toast.error("You need to be logged in to manage your cart.");
      return false;
    }
    try {
      if (isInCart) {
        await axios.delete(`${BaseUrl}/cart/${product_id}`, {
          headers: { "token": Token }
        });
        getCart();
        toast.success("Product removed from cart.");
        return false;
      } else {
        await axios.post(`${BaseUrl}/cart`, { productId: product_id }, {
          headers: { "token": Token }
        });
        getCart();
        toast.success("Product added to cart.");
        return true;
      }
    } catch (error) {
      toast.error("Error updating cart. Please try again later.");
      console.error("Error updating cart:", error);
      return isInCart; // fallback: keep previous state
    }
  }

  async function ClearCart() {
    if (!Token) {
      toast.error("You need to be logged in to manage your cart.");
      return false;
    }
    try {
      const { data } = await axios.delete(`${BaseUrl}/cart`, {
        headers: { "token": Token }
      });
      setCart(data);
      toast.success("Cart cleared successfully.");
      return true;
    } catch (error) {
      toast.error("Error clearing cart. Please try again later.");
      console.error("Error clearing cart:", error);
      return false;
    }
  }


  async function WishlistToggle(product_id, isInWishlist) {
    if (!Token) {
      toast.error("You need to be logged in to manage your wishlist.");
      return false;
    }
    try {
      if (isInWishlist) {
        await axios.delete(`${BaseUrl}/wishlist/${product_id}`, {
          headers: { "token": Token }
        });
        await getWishlist();
        return false;
      } else {
        await axios.post(`${BaseUrl}/wishlist`, { productId: product_id }, {
          headers: { "token": Token }
        });
        await getWishlist();
        return true;
      }
    } catch (error) {
      toast.error("Error updating wishlist. Please try again later.");
      console.error("Error updating wishlist:", error);
      return isInWishlist; // fallback: keep previous state
    }
  }

  async function deleteWishlistItems() {
      try{
        wishlist.forEach(async (item) => {
        await axios.delete(`${BaseUrl}/wishlist/${item._id}`, {
          headers: { "token": Token }
        });
      });
      }catch(error){
        console.error("Error deleting wishlist items:", error);
      }
  }
  async function ClearWishlist() {
    if (!Token) {
      toast.error("You need to be logged in to manage your wishlist.");
      return false;
    }
    try {
      deleteWishlistItems().then(() => setWishlist([]));
      toast.success("Wishlist cleared successfully.");
      return true;
    } catch (error) {
      toast.error("Error clearing wishlist. Please try again later.");
      console.error("Error clearing wishlist:", error);
      return false;
    }
  }

  async function submitCreditPayment(shippingDetails, id) {
    setLoading(true);
    if (!Token) {
      toast.error("You need to be logged in to place an order.");
      setLoading(false);
      return false;
    }
    try {
      const { data } = await axios.post(`${BaseUrl}/orders/checkout-session/${id}?url=https://marslinoed.github.io/fullstack-projects/React_Projects/freshcart/build/`, {
        "shippingAddress": shippingDetails
      }, {
        headers: { "token": Token }
      });
      if (data.status === "success") {
        data.session.url && (window.location.href = data.session.url);
      }
    } catch (error) {
      toast.error("Error placing order. Please try again later.");
      console.error("Error placing order:", error);
      return false;
    } finally {
      setLoading(false);
    }

  }

  async function submitCashPayment(shippingDetails, id) {
    setLoading(true);
    if (!Token) {
      toast.error("You need to be logged in to place an order.");
      setLoading(false);
      return false;
    }
    try {
      const { data } = await axios.post(`https://ecommerce.routemisr.com/api/v1/orders/${id}`, {
        "shippingAddress": shippingDetails
      }, {
        headers: { "token": Token }
      });
      if (data.status === "success") {
        toast.success("Order placed successfully.");
        getCart();
        return data;
      }
    } catch (error) {
      toast.error("Error placing order. Please try again later.");
      console.error("Error placing order:", error);
      return false;
    } finally {
      setLoading(false);
    }

  }


  useEffect(() => {
    getProducts();
    getBrands();
    getCategories();
    getWishlist();
    getCart();
  }, [getProducts, getWishlist, getBrands, getCategories, getCart]);

  return (
    <ProductsContext.Provider value={{
      loading,
      products,
      setBrandFilter,
      setSortingType,
      setCategoryFilter,
      brands,
      categories,
      wishlist,
      WishlistToggle,
      getProductDetails,
      cart,
      setCart,
      changeCartCount,
      CartToggle,
      ClearCart,
      ClearWishlist,
      submitCashPayment,
      submitCreditPayment
    }}>
      {props.children}
    </ProductsContext.Provider>
  )
}
