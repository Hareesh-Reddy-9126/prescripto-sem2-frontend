import React from 'react'

// Simple Avatar component that always crops the image to a circle.
// Props:
// - src: image URL
// - sizeClass: Tailwind size classes for the wrapper (default: 'w-8 h-8')
// - className: additional classes for the inner img or wrapper
const Avatar = ({ src, alt = 'avatar', sizeClass = 'w-8 h-8', className = '' }) => {
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  )
}

export default Avatar
