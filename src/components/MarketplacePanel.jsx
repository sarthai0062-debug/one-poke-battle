import React from 'react'

export const MarketplacePanel = ({ 
  isOpen, 
  items, 
  isLoading, 
  error, 
  note,
  playerPoints = 0,
  onClose, 
  onRefresh,
  onPurchase
}) => {
  if (!isOpen) return null

  return (
    <div
      id="marketplacePanel"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 25,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target.id === 'marketplacePanel') {
          onClose()
        }
      }}
    >
      <div
        style={{
          width: '420px',
          maxHeight: '420px',
          background: '#fff',
          border: '4px solid #000',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '16px', margin: 0 }}>Stellar Bazaar</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⭐</span>
              <span>{playerPoints.toLocaleString()} Stardust</span>
            </div>
          <button onClick={onClose} style={{ fontSize: '12px', padding: '6px 10px' }}>
            Close (Esc)
          </button>
          </div>
        </div>
        
        {(isLoading || error || note) && (
          <div id="marketplaceStatus" style={{ fontSize: '12px' }}>
            {isLoading ? 'Loading listings...' : error || note}
          </div>
        )}

        <div
          className="marketplace-list"
          id="marketplaceList"
          style={{
            overflowY: 'auto',
            border: '2px solid #000',
            padding: '12px',
            minHeight: '160px',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'linear-gradient(to bottom, #f5f5f5, #e8e8e8)',
          }}
        >
          {items.length === 0 && !isLoading ? (
            <span>No listings yet. Try refreshing.</span>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '3px solid #333',
                  borderRadius: '4px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundColor: '#f8f8f8',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)'
                }}
              >
                {item.image_url && (
                  <div
                    style={{
                      width: '100%',
                      height: '140px',
                      border: '2px solid #222',
                      borderRadius: '2px',
                      backgroundColor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name || 'NFT art'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML += '<div style="font-size: 48px; opacity: 0.3;">📦</div>'
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: item.image_url ? '4px' : '0',
                  }}
                >
                  <strong
                    style={{
                      fontSize: '14px',
                      color: '#111',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.name || 'Untitled NFT'}
                  </strong>
                  <div
                    style={{
                      backgroundColor: '#ffd700',
                      border: '2px solid #333',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#000',
                    }}
                  >
                    {item.price ? `${item.price} $GEM` : 'TBD'}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#444',
                    lineHeight: '1.4',
                    marginTop: '2px',
                    padding: '6px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '2px',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {item.description || 'No lore provided.'}
                </div>
                {onPurchase && (
                  <button
                    onClick={() => onPurchase(item)}
                    disabled={playerPoints < item.price}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      backgroundColor: playerPoints >= item.price ? '#4CAF50' : '#ccc',
                      color: playerPoints >= item.price ? '#fff' : '#666',
                      border: '2px solid #000',
                      borderRadius: '2px',
                      cursor: playerPoints >= item.price ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (playerPoints >= item.price) {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {playerPoints >= item.price ? 'Purchase' : 'Insufficient Stardust'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <button onClick={onRefresh} style={{ fontSize: '12px', padding: '8px' }}>
          Refresh Listings
        </button>
        <p style={{ fontSize: '11px', margin: 0 }}>
          Data served from Supabase table <code>nft_marketplace</code>.
        </p>
      </div>
    </div>
  )
}

