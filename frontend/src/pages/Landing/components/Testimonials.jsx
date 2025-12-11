import React from 'react';
import { FiStar } from 'react-icons/fi';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Travel Vlogger',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      quote: 'ReelScheduler has completely transformed how I manage my YouTube channel. I can now batch create content and let the app handle the publishing schedule.',
      stars: 5
    },
    {
      name: 'Michael Chen',
      role: 'Tech Reviewer',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      quote: 'As someone who reviews multiple products weekly, having a reliable scheduling tool is essential. ReelScheduler has never let me down.',
      stars: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Fitness Instructor',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'I used to struggle with consistent uploads until I found ReelScheduler. Now my workout videos go live exactly when my audience expects them.',
      stars: 4
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of content creators who have streamlined their YouTube workflow
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`${i < testimonial.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} w-5 h-5`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${testimonial.name.replace(' ', '+')}&background=random`;
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full">
            <span className="text-gray-700 font-medium">Trusted by 5,000+ content creators worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;