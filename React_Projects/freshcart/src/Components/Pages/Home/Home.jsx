import React from 'react'
import Products from '../Products/Products';
import Homeslider from './Homeslider/Homeslider';
import Categories from '../Categories/Categories';

export default function Home() {

  return (
    <div className='Home-Content mb-4 mt-4 '>
      <Homeslider />
      <Categories />
      <Products />
    </div>
  )
}
