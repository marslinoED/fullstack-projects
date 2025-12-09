import React from 'react';
import { Link } from 'react-router-dom';
import './TourCard.css';

export default function TourCard({ tour }) {
    const { name, price, summary, difficulty, ratingsAverage, ratingsQuantity, imageCover, _id, startLocation, startDates, duration } = tour;

    const date = startDates && startDates.length > 0
        ? new Date(startDates[0]).toLocaleString('en-us', { month: 'long', year: 'numeric' })
        : 'N/A';

    return (
        <div className="tour-card">
            <div className="tour-card__hero">
                <div className="tour-card__hero-overlay"></div>
                <img src={imageCover} alt={name} />
                <div className="tour-card__hero-pill">{difficulty}</div>
                <h3 className="tour-card__title">{name}</h3>
            </div>
            <div className="tour-card__body">
                <h4 className="tour-card__subtitle">{difficulty} {duration}-day tour</h4>
                <p className="tour-card__summary">{summary}</p>

                <ul className="tour-card__meta">
                    <li>
                        <div className="tour-card__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <div>
                            <span className="tour-card__meta-label">Location</span>
                            <p className="tour-card__meta-text">{startLocation?.description || 'Unknown'}</p>
                        </div>
                    </li>
                    <li>
                        <div className="tour-card__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
                        </div>
                        <div>
                            <span className="tour-card__meta-label">Date</span>
                            <p className="tour-card__meta-text">{date}</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="tour-card__footer">
                <p className="tour-card__price">
                    ${price} <span>per person</span>
                </p>
                <p className="tour-card__rating">
                    <span>{ratingsAverage}</span> rating ({ratingsQuantity})
                </p>
                <Link to={`/tours/${_id}`} className="tour-card__cta">Details</Link>
            </div>
        </div>
    );
}
