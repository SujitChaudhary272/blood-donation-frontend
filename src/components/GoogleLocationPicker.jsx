import React from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = (process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '').trim();
const HAS_VALID_GOOGLE_MAPS_KEY =
  GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here';

const GoogleLocationPicker = ({
  title,
  helperText,
  buttonLabel,
  center,
  selectedLocation,
  onMapClick,
  onUseCurrentLocation,
  onCoordinateChange,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: HAS_VALID_GOOGLE_MAPS_KEY ? GOOGLE_MAPS_API_KEY : '',
  });

  const renderCoordinateInputs = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 640 ? '1fr 1fr' : '1fr',
        gap: '12px',
        marginTop: '16px',
      }}
    >
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          Latitude
        </label>
        <input
          type="number"
          step="any"
          value={selectedLocation.lat ?? ''}
          onChange={(event) => onCoordinateChange('lat', event.target.value)}
          placeholder="Enter latitude"
          className="form-input"
        />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          Longitude
        </label>
        <input
          type="number"
          step="any"
          value={selectedLocation.lng ?? ''}
          onChange={(event) => onCoordinateChange('lng', event.target.value)}
          placeholder="Enter longitude"
          className="form-input"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
          justifyContent: 'space-between',
          alignItems: window.innerWidth >= 640 ? 'center' : 'flex-start',
          gap: '16px',
        }}
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {buttonLabel}
        </button>
      </div>

      <p className="text-sm text-gray-600">{helperText}</p>

      {!HAS_VALID_GOOGLE_MAPS_KEY && (
        <div
          style={{
            padding: '14px 16px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            display: 'flex',
            gap: '10px',
            color: '#9a3412',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Google Maps key is not configured.</div>
            <div style={{ fontSize: '14px' }}>
              Add a valid `REACT_APP_GOOGLE_MAPS_API_KEY` in [frontend/.env](/d:/Downloads/blood-donation-portal/frontend/.env) to use map selection.
            </div>
          </div>
        </div>
      )}

      {HAS_VALID_GOOGLE_MAPS_KEY && loadError && (
        <div
          style={{
            padding: '14px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            display: 'flex',
            gap: '10px',
            color: '#b91c1c',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Google Maps failed to load.</div>
            <div style={{ fontSize: '14px' }}>
              Please check your Google Maps API key, billing, and allowed referrers. You can still enter coordinates manually below.
            </div>
          </div>
        </div>
      )}

      {HAS_VALID_GOOGLE_MAPS_KEY && !loadError && (
        <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={13}
              onClick={onMapClick}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {selectedLocation.lat !== null && selectedLocation.lng !== null && (
                <Marker
                  position={{
                    lat: Number(selectedLocation.lat),
                    lng: Number(selectedLocation.lng),
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                color: '#6b7280',
                fontWeight: 600,
              }}
            >
              Loading map...
            </div>
          )}
        </div>
      )}

      {renderCoordinateInputs()}

      {selectedLocation.lat !== null && selectedLocation.lng !== null && selectedLocation.lat !== '' && selectedLocation.lng !== '' ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-sm text-green-700">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            Location Selected: {Number(selectedLocation.lat).toFixed(4)}, {Number(selectedLocation.lng).toFixed(4)}
          </span>
        </div>
      ) : (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center text-sm text-blue-700">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Select on map or enter latitude and longitude manually.</span>
        </div>
      )}
    </div>
  );
};

export default GoogleLocationPicker;
