import React from 'react'

export const PaperTexture: React.FC = () => {
  return (
    <div className="paper-texture-overlay" aria-hidden="true">
      {/* Multiple layers for depth */}
      <div className="paper-texture-layer paper-texture-layer-1"></div>
      <div className="paper-texture-layer paper-texture-layer-2"></div>
      <div className="paper-texture-layer paper-texture-layer-3"></div>
    </div>
  )
}

export default PaperTexture
