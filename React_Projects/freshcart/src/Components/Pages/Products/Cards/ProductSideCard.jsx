import { Link } from "react-router-dom";

export default function ProductSideCard({ product }) {
    return (
        <div>
            <div
                className="alert alert-danger errorMsg"
                style={{ display: "none" }}
            >
                Error: <span className="error-message"></span>
            </div>

            <div className="card card-product" style={{ maxWidth: "650px" }}>
                <div className="row g-0 align-items-center">
                    {/* LEFT COL - IMAGE */}
                    <div className="col-md-4 text-center position-relative">
                        {product.priceAfterDiscount != null &&
                            product.priceAfterDiscount > 0 ? (
                            <span className="badge bg-danger position-absolute top-0 start-0">
                                Sale
                            </span>
                        ) : null}
                        <Link to={`/productdetails/${product._id}`}>
                            <img
                                src={product.imageCover}
                                alt={product.title}
                                className="img-fluid rounded-start"
                            />
                        </Link>
                    </div>

                    {/* RIGHT COL - CONTENT */}
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="text-small mb-1 text-start">
                                <span
                                    to={`branddetails/${product.brand._id}`}
                                    className="text-decoration-none text-muted"
                                >
                                    <small>{product.category?.name}</small>
                                </span>
                            </div>

                            <h2 className="fs-6 text-start">
                                <Link
                                    to={`/productdetails/${product._id}`}
                                    className="text-inherit text-decoration-none nav-icon"
                                >
                                    {product.title.slice(0, product.title.indexOf(" ", 30))}
                                </Link>
                            </h2>

                            <div className="d-flex align-items-center">
                                <div className="text-warning me-2">
                                    {Array.from({ length: 5 }, (_, index) => {
                                        const rating = product.ratingsAverage || 0;
                                        const starValue = index + 1;

                                        if (rating >= starValue) {
                                            // Full star - filled yellow
                                            return <i key={index} className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>;
                                        } else if (rating >= starValue - 0.5) {
                                            // Half star
                                            return <i key={index} className="bi bi-star-half" style={{ color: '#ffc107' }}></i>;
                                        } else {
                                            // Empty star - gray outline only
                                            return <i key={index} className="bi bi-star" style={{ color: '#dee2e6' }}></i>;
                                        }
                                    })}
                                </div>
                                <span className="text-muted small me-2">{product.ratingsAverage || 0}</span>
                                <span className="text-muted small">({product.ratingsQuantity || 0})</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <span className="text-dark">EGP {product.price}</span>
                                    {product.priceAfterDiscount != null &&
                                        product.priceAfterDiscount > 0 ? (
                                        <span className="text-decoration-line-through text-muted ms-1">
                                            EGP {product.priceAfterDiscount}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
