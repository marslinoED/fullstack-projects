import React, { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom';
import Notfound from '../../../Shared/Notfound/Notfound';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import axios from 'axios';
import Loading from '../../../Shared/Loading/Loading';
import ProductSideCard from '../../Products/Cards/ProductSideCard';
import toast from 'react-hot-toast';

export default function Branddetails() {
  const { brand } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);


  const fetchBrandProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://ecommerce.routemisr.com/api/v1/products', {
        params: { brand: brand._id }
      });
      // console.log(data);
      setProducts(data.data);
    } catch (error) {
      toast.error(`Failed to fetch products for brand ${brand.name}`);
    } finally {
      setLoading(false);
    }
  }, [brand])

  useEffect(() => {
    if (brand) {
      fetchBrandProducts();
    }
  }, [brand, fetchBrandProducts]);


  return (
    loading ? <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loading /></div> :
      brand ?
        <div className='Branddetails-Content container'>
          {/* Brand Header Section */}
          <div className="d-flex justify-content-center align-items-center m-4 p-4">
            <div className="text-center">
              <img src={brand.image} alt={brand.name} style={{ maxWidth: '200px', height: 'auto', marginBottom: '20px' }} />
            </div>
          </div>

          {/* Products Swiper Section */}
          <div className="d-flex justify-content-center align-items-center m-4 p-4">
            {products.length === 0 ? <h3 className='text-center my-5'>No products found for this brand.</h3> :
              <Swiper
                modules={[Autoplay]}
                slidesPerView="auto"
                spaceBetween={20}
                loop={true}
                autoplay={{
                  delay: 1500,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
              >
                {products.map(product => (
                  <SwiperSlide key={product._id} style={{ maxWidth: "500px" }}>
                    <ProductSideCard product={product} inWishlist={false} />
                  </SwiperSlide>
                ))} </Swiper>}
          </div>

        </div> :
        <div className='Branddetails-NotFound' style={{ maxHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Notfound /></div>
  )


}
