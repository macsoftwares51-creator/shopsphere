import React, { useState, useEffect } from 'react';

const FeaturedCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Controls the animation state (fading out vs active)
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!products || products.length <= 1) return;

    const interval = setInterval(() => {
      // 1. Start the fade/slide out animation
      setIsTransitioning(true);

      // 2. Wait 300ms for the animation to hide the element, swap the product, then animate back in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        setIsTransitioning(false);
      }, 300); 

    }, 4500); // Cycles every 4.5 seconds

    return () => clearInterval(interval);
  }, [products]);

  // Safeguard if products haven't loaded from your backend yet
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 font-medium">
        Loading Shopsphere favorites...
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <section className="max-w-5xl mx-auto my-12 px-4">
      {/* Outer Container Card */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-sm overflow-hidden">
        
        {/* Decorative Badge */}
        <div className="mb-6 md:mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Trending Now
          </span>
        </div>

        {/* Dynamic Transition Wrapper */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-all duration-300 ease-in-out ${
            isTransitioning 
              ? 'opacity-0 -translate-x-4 scale-95 blur-sm' 
              : 'opacity-100 translate-x-0 scale-100 blur-none'
          }`}
        >
          {/* Product Image Section */}
          <div className="flex justify-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full mx-auto aspect-square items-center group">
            <img 
              src={currentProduct.image || "https://via.placeholder.com/300"} 
              alt={currentProduct.name} 
              className="max-h-64 object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {currentProduct.category || "General"}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight line-clamp-2">
              {currentProduct.name}
            </h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed line-clamp-3">
              {currentProduct.description || "Explore this exclusive item available now on Shopsphere."}
            </p>
            
            <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
              <span className="text-3xl font-black text-indigo-600">
                ${currentProduct.price}
              </span>
            </div>

            <div className="pt-4">
              <button className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-medium rounded-xl shadow-sm transition-colors duration-200">
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentIndex) {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedCarousel;
