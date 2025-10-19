import React, { useContext } from 'react'
import { ProductsContext } from '../../../Context/Products/ProductsContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
export default function Categories() {

  const { categories, setCategoryFilter } = useContext(ProductsContext);

  return (
    <div className='Categories-Content container'>
      <div className="d-flex justify-content-center align-items-center m-2 p-2">
        <style>
          {`
            .swiper {
              width: 100%;
              max-width: 1400px;
              border-radius: 18px;
              padding: 10px 0;
            }
            .swiper-slide {
              display: flex;
              justify-content: center;
              align-items: center;
              height: auto;
            }
            .category-card {
              cursor: pointer;
              text-align: center;
              padding: 20px;
              border-radius: 16px;
              background-color: white;
              border: 2px solid #e9ecef;
              transition: all 0.3s ease;
              width: 100%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            }
            .category-card:hover {
              transform: scale(1.02);
              border-color: #28a745;
              box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
            }
            .category-card img {
              width: 80%;
              height: 120px;
              border-radius: 8px;
              object-fit: contain;
              margin-bottom: 15px;
              transition: all 0.3s ease;
            }
            .category-name {
              font-weight: 500;
              color: #495057;
              font-size: 0.95rem;
              margin: 0;
              transition: color 0.3s ease;
            }
            .category-card:hover .category-name {
              color: #28a745;
              font-weight: 600;
            }
          `}
        </style>
        {categories.length === 0 ? <h3 className='text-center my-5'>No categories found for this brand.</h3> :
          <Swiper
            modules={[Autoplay]}
            slidesPerView="auto"
            spaceBetween={15}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            grabCursor={true}
          >
            {categories.map(category => (
              <SwiperSlide key={category._id} style={{ maxWidth: "200px" }}>
                <div className="category-card" onClick={() => setCategoryFilter(category._id)}>
                  <img src={category.image} alt={category.name} />
                  <div className="category-name">{category.name}</div>
                </div>
              </SwiperSlide>
            ))} </Swiper>}
      </div>
    </div>
  )
}
