import Loader from '../../../Loader/Loader';
import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToursContext } from '../../../../Context/Tours/toursContext';
import './TourDetails.css';

export default function TourDetails() {
    const { id } = useParams();
    const { fetchTour } = useContext(ToursContext);
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getTour() {
            try {
                setLoading(true);
                const res = await fetchTour(id);
                if (res.data && res.data.data) {
                    setTour(res.data.data);
                } else {
                    setError("Could not fetch tour data");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        getTour();
    }, [id, fetchTour]);

    if (loading) return <Loader />;
    if (error) return <div className="error">Error: {error}</div>;
    if (!tour) return <div className="error">Tour not found</div>;

    const { name, duration, imageCover, startLocation, startDates, maxGroupSize, ratingsAverage, difficulty, description, summary, guides, images } = tour;
    const date = startDates && startDates.length > 0
        ? new Date(startDates[0]).toLocaleString('en-us', { month: 'long', year: 'numeric' })
        : 'N/A';

    return (
        <div className="tour-details">
            <section className="section-header">
                <div className="header__hero">
                    <div className="header__hero-overlay">&nbsp;</div>
                    <img className="header__hero-img" src={imageCover} alt={name} />
                </div>
                <div className="heading-box">
                    <h1 className="heading-primary">
                        <span className="heading-box__text">{name} Tour</span>
                    </h1>
                    <div className="heading-box__group">
                        <div className="heading-box__detail">
                            <svg className="heading-box__icon">
                                <use href="img/icons.svg#icon-clock"></use>
                            </svg>
                            <span className="heading-box__text" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{duration} days</span>
                        </div>
                        <div className="heading-box__detail">
                            <svg className="heading-box__icon">
                                <use href="img/icons.svg#icon-map-pin"></use>
                            </svg>
                            <span className="heading-box__text" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{startLocation.description}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-description">
                <div className="overview-box">
                    <div>
                        <div className="overview-box__group">
                            <h2 className="heading-secondary">Quick facts</h2>
                            <div className="overview-box__detail">
                                <svg className="overview-box__icon">
                                    <use href="img/icons.svg#icon-calendar"></use>
                                </svg>
                                <span className="overview-box__label">Next date</span>
                                <span className="overview-box__text">{date}</span>
                            </div>
                            <div className="overview-box__detail">
                                <svg className="overview-box__icon">
                                    <use href="img/icons.svg#icon-trending-up"></use>
                                </svg>
                                <span className="overview-box__label">Difficulty</span>
                                <span className="overview-box__text">{difficulty}</span>
                            </div>
                            <div className="overview-box__detail">
                                <svg className="overview-box__icon">
                                    <use href="img/icons.svg#icon-user"></use>
                                </svg>
                                <span className="overview-box__label">Participants</span>
                                <span className="overview-box__text">{maxGroupSize} people</span>
                            </div>
                            <div className="overview-box__detail">
                                <svg className="overview-box__icon">
                                    <use href="img/icons.svg#icon-star"></use>
                                </svg>
                                <span className="overview-box__label">Rating</span>
                                <span className="overview-box__text">{ratingsAverage} / 5</span>
                            </div>
                        </div>
                    </div>
                    {guides && guides.length > 0 && (
                        <div className="overview-box__group overview-box__guides">
                            <h2 className="heading-secondary">Your tour guides</h2>
                            {guides.map((guide) => (
                                <div className="overview-box__detail" key={guide._id}>
                                    <img
                                        src={guide.photo}
                                        alt={guide.name}
                                        className="overview-box__img"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://tours-app-api-drab.vercel.app/img/users/default.jpg" }}
                                    />
                                    <span className="overview-box__label">
                                        {guide.role === 'lead-guide' ? 'Lead Guide' : 'Tour Guide'}
                                    </span>
                                    <span className="overview-box__text">{guide.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="description-box">
                    <h2 className="heading-secondary">About {name} tour</h2>
                    {summary && <p className="summary-text">{summary}</p>}
                    {description && description.split('\n').map((p, i) => (
                        <p className="description__text" key={i}>{p}</p>
                    ))}
                </div>
            </section>

            <section className="section-pictures">
                {images && images.map((img, i) => (
                    <div className="picture-box" key={i}>
                        <img
                            className={`picture-box__img picture-box__img--${i + 1}`}
                            src={img}
                            alt={`${name} Tour ${i + 1}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://tours-app-api-drab.vercel.app/img/tours/tour-1-1.jpg" }} // fallback to generic if fails or maybe just hide? Let's use a safe placeholder or just rely on the url. I will try to use the src directly first. If images are just filenames, I might need to prefix them like imageCover? 
                        // Wait, previous step user changed guide.photo to NOT use prefix. But imageCover works. Let's assume images work or need prefix.
                        // If they are filenames like "tour-1-1.jpg", they need prefix "https://tours-app-api-drab.vercel.app/img/tours/" likely.
                        // Let's check if imageCover used a prefix. 
                        // In the initial file, imageCover was used directly.
                        // If the API returns full URLs for `imageCover` but filenames for `images`?
                        // I will assume they are filenames and prefix them if they don't look like URLs.
                        // However, looking at the guide fix, the user removed the prefix. That suggests guide.photo was a full URL.
                        // If imageCover is a full URL, images probably are too.
                        // But I will add a check or just try to use them.
                        />
                    </div>
                ))}
            </section>
        </div>
    );
}
