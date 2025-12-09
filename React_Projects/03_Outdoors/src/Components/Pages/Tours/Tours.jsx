import React, { useContext, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from '../../Loader/Loader';
import TourCard from './ToursCard/TourCard';
import { ToursContext } from '../../../Context/Tours/toursContext';
import './Tours.css';

export default function Tours() {
    const { ToursData, fetchTours } = useContext(ToursContext);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Initial State from URL or Defaults
    const initialPage = Number(searchParams.get('page')) || 1;
    // Default 'sort' can be empty (no sortBy param) 
    const initialSort = searchParams.get('sortBy') || '';
    const initialDifficulty = searchParams.get('difficulty') || 'all';
    const priceParam = searchParams.get('price[lte]');
    const initialMaxPrice = priceParam ? Number(priceParam) : 3000;

    const [page, setPage] = useState(initialPage);
    const [sort, setSort] = useState(initialSort);
    const [difficulty, setDifficulty] = useState(initialDifficulty);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

    const limit = 6;
    const timeoutRef = useRef(null);

    // Update URL when state changes
    useEffect(() => {
        const params = {};
        if (page > 1) params.page = page;
        params.limit = limit;

        if (sort) params.sortBy = sort;
        if (difficulty !== 'all') params.difficulty = difficulty;
        if (maxPrice < 3000) params['price[lte]'] = maxPrice;

        setSearchParams(params);
    }, [page, sort, difficulty, maxPrice, setSearchParams]);

    // Fetch Tours when URL params change
    useEffect(() => {
        const getTours = async () => {
            setLoading(true);

            const apiParams = new URLSearchParams();
            apiParams.append('page', page);
            apiParams.append('limit', limit);

            if (sort) apiParams.append('sortBy', sort);
            if (difficulty !== 'all') apiParams.append('difficulty', difficulty);
            if (maxPrice < 3000) apiParams.append('price[lte]', maxPrice);

            // Fix encoding for brackets (API expects [ ] not %5B %5D)
            const queryString = apiParams.toString().replace(/%5B/g, '[').replace(/%5D/g, ']');

            await fetchTours(queryString);
            setLoading(false);
        };

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(getTours, 500);

        return () => clearTimeout(timeoutRef.current);
    }, [page, sort, difficulty, maxPrice, fetchTours]);

    const handleNextPage = () => setPage(prev => prev + 1);
    const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="tours-page-container">
            <aside className="tours-sidebar">
                <div className="filter-group">
                    <h3>Sort By</h3>
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="filter-select">
                        <option value="">Default</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="-price">Price (High to Low)</option>
                        <option value="-ratingsAverage">Top Rated</option>
                        <option value="duration">Duration (Shortest)</option>
                    </select>
                </div>

                <div className="filter-group">
                    <h3>Difficulty</h3>
                    <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} className="filter-select">
                        <option value="all">All</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="difficult">Difficult</option>
                    </select>
                </div>

                <div className="filter-group">
                    <h3>Max Price: ${maxPrice}</h3>
                    <input
                        type="range"
                        min="0"
                        max="3000"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                        className="filter-range"
                    />
                </div>
            </aside>

            <main className="tours-main">
                {loading ? <Loader /> : (
                    <>
                        <div className="tours-grid">
                            {ToursData && ToursData.length > 0 ? (
                                ToursData.map(tour => (
                                    <TourCard key={tour._id} tour={tour} />
                                ))
                            ) : (
                                <h2>No tours found.</h2>
                            )}
                        </div>

                        <div className="pagination">
                            <button className="page-btn" onClick={handlePrevPage} disabled={page === 1}>&lt; Prev</button>
                            <span className="page-number">Page {page}</span>
                            <button className="page-btn" onClick={handleNextPage} disabled={!ToursData || ToursData.length < limit}>Next &gt;</button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
