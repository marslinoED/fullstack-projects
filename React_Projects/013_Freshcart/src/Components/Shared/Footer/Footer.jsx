import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="pt-5" style={{ backgroundColor: "#eee" }}>
      <div className="container">
        <div className="row">

          {/* Categories */}
          <div className="col-6 col-md-3 mb-3">
            <h6 className="fw-bold">Categories</h6>
            <ul className="list-unstyled">
              <li><Link className="link-style" to="#">Vegetables & Fruits</Link></li>
              <li><Link className="link-style" to="#">Breakfast & instant food</Link></li>
              <li><Link className="link-style" to="#">Bakery & Biscuits</Link></li>
              <li><Link className="link-style" to="#">Atta, rice & dal</Link></li>
              <li><Link className="link-style" to="#">Sauces & spreads</Link></li>
              <li><Link className="link-style" to="#">Organic & gourmet</Link></li>
              <li><Link className="link-style" to="#">Cleaning essentials</Link></li>
              <li><Link className="link-style" to="#">Baby care</Link></li>
              <li><Link className="link-style" to="#">Personal care</Link></li>
            </ul>
          </div>

          {/* Get to know us */}
          <div className="col-6 col-md-2 mb-3">
            <h6 className="fw-bold">Get to know us</h6>
            <ul className="list-unstyled">
              <li><Link className="link-style" to="#">Company</Link></li>
              <li><Link className="link-style" to="#">About</Link></li>
              <li><Link className="link-style" to="#">Blog</Link></li>
              <li><Link className="link-style" to="#">Help Center</Link></li>
              <li><Link className="link-style" to="#">Our Value</Link></li>
            </ul>
          </div>

          {/* For Consumers */}
          <div className="col-6 col-md-2 mb-3">
            <h6 className="fw-bold">For Consumers</h6>
            <ul className="list-unstyled">
              <li><Link className="link-style" to="#">Payments</Link></li>
              <li><Link className="link-style" to="#">Shipping</Link></li>
              <li><Link className="link-style" to="#">Product Returns</Link></li>
              <li><Link className="link-style" to="#">FAQ</Link></li>
              <li><Link className="link-style" to="#">Shop Checkout</Link></li>
            </ul>
          </div>

          {/* Become a Shopper */}
          <div className="col-6 col-md-2 mb-3">
            <h6 className="fw-bold">Become a Shopper</h6>
            <ul className="list-unstyled">
              <li><Link className="link-style" to="#">Shopper Opportunities</Link></li>
              <li><Link className="link-style" to="#">Become a Shopper</Link></li>
              <li><Link className="link-style" to="#">Earnings</Link></li>
              <li><Link className="link-style" to="#">Ideas & Guides</Link></li>
              <li><Link className="link-style" to="#">New Retailers</Link></li>
            </ul>
          </div>

          {/* Freshcart Programs */}
          <div className="col-6 col-md-3 mb-3">
            <h6 className="fw-bold">Freshcart programs</h6>
            <ul className="list-unstyled">
              <li><Link className="link-style" to="#">Freshcart programs</Link></li>
              <li><Link className="link-style" to="#">Gift Cards</Link></li>
              <li><Link className="link-style" to="#">Promos & Coupons</Link></li>
              <li><Link className="link-style" to="#">Freshcart Ads</Link></li>
              <li><Link className="link-style" to="#">Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr />

        {/* Bottom Row */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pb-3">
          {/* Payment partners */}
          <div>
            <span className="me-3 fw-bold">Payment Partners</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="visa" width="40" className="me-2" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="paypal" width="60" className="me-2" />
          </div>

          {/* App buttons */}
          <div className="my-3 my-md-0">
            <span className="me-2">Get deliveries with FreshCart</span>
            {/* Apple Store button */}
            <div
              className="d-inline-flex align-items-center bg-black text-white rounded px-3 py-2 me-3"
              style={{ maxWidth: '220px' }}
            >
              {/* Left Column (Apple Icon) */}
              <div className="me-3">
                <i className="fa-brands fa-apple fa-2x"></i>
              </div>

              {/* Right Column (Two rows of text) */}
              <div className="d-flex flex-column">
                <small className="text-white-50" style={{ lineHeight: '1' }}>
                  Available on the
                </small>
                <span style={{ fontSize: '1rem', fontWeight: '500', lineHeight: '1.2' }}>
                  App Store
                </span>
              </div>
            </div>

            {/* Google Play button */}
            <div
              className="d-inline-flex align-items-center bg-black text-white rounded px-3 py-2 me-3 mt-2 "
              style={{ maxWidth: '220px' }}
            >

              <div className="me-3">
                <i className="fa-brands fa-google-play fa-2x"></i>
              </div>

              {/* Right Column (Two rows of text) */}
              <div className="d-flex flex-column">
                <small className="text-white-50" style={{ lineHeight: '1' }}>
                  Get it on
                </small>
                <span style={{ fontSize: '1rem', fontWeight: '500', lineHeight: '1.2' }}>
                  Google Play
                </span>
              </div>
            </div></div>
        </div>

        {/* Divider */}
        <hr />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pb-3">
          {/* Copyright */}
          <div className="text-center small text-muted pb-2">
            © 2022 - 2025 FreshCart eCommerce HTML Template. All rights reserved.
          </div>
          {/* Social icons */}
          <div>
            <span className="me-2">Follow us on</span>
            <style>
              {`
          .facebook { color: #1877F2; }
          .twitter { color: #1DA1F2; }
          .instagram { color: #C13584; }

          .instagram:hover, .facebook:hover, .twitter:hover { color: var(--bs-primary); }
        `}
            </style>
            <i className="fab fa-facebook me-2 facebook"></i>
            <i className="fab fa-twitter me-2 twitter"></i>
            <i className="fab fa-instagram me-2 instagram"></i>
          </div>
        </div>

      </div>
    </footer>
  );
}
