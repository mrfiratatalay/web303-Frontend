import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Box, Button, Stack, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationMapProps {
  location?: LocationData | null;
  onLocationChange?: (location: LocationData) => void;
  onLocationFetch?: () => void;
  loading?: boolean;
  error?: string;
  editable?: boolean;
  height?: number | string;
  showAccuracyCircle?: boolean;
  geofenceRadius?: number;
}

// Component to recenter map when location changes
function RecenterMap({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16);
  }, [map, position]);
  return null;
}

// Component to handle map clicks for editable mode
function MapClickHandler({ onLocationChange }: { onLocationChange?: (location: LocationData) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationChange) {
        onLocationChange({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          accuracy: 10, // Manual selection has ~10m accuracy
        });
      }
    },
  });
  return null;
}

const LocationMap = ({
  location,
  onLocationChange,
  onLocationFetch,
  loading = false,
  error,
  editable = false,
  height = 250,
  showAccuracyCircle = true,
  geofenceRadius,
}: LocationMapProps) => {
  const [mapReady, setMapReady] = useState(false);

  // Default center (Turkey - Ankara)
  const defaultCenter: LatLngExpression = [39.9334, 32.8597];
  const center: LatLngExpression = location
    ? [location.latitude, location.longitude]
    : defaultCenter;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Map Container */}
      <Box
        sx={{
          height,
          position: 'relative',
          bgcolor: 'grey.100',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            borderRadius: 0,
          },
        }}
      >
        {!mapReady && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              zIndex: 1000,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        <MapContainer
          center={center}
          zoom={location ? 16 : 6}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {location && (
            <>
              <Marker position={[location.latitude, location.longitude]} icon={defaultIcon} />
              <RecenterMap position={[location.latitude, location.longitude]} />

              {/* Accuracy circle */}
              {showAccuracyCircle && location.accuracy && (
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={location.accuracy}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
              )}

              {/* Geofence radius circle */}
              {geofenceRadius && (
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={geofenceRadius}
                  pathOptions={{
                    color: '#22c55e',
                    fillColor: '#22c55e',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 10',
                  }}
                />
              )}
            </>
          )}

          {editable && <MapClickHandler onLocationChange={onLocationChange} />}
        </MapContainer>

        {/* Overlay for loading state */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 1001,
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Konum alınıyor...
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Info Panel */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1.5}>
          {/* Error message */}
          {error && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'error.main' }}>
              <ErrorOutlineIcon fontSize="small" />
              <Typography variant="body2">{error}</Typography>
            </Stack>
          )}

          {/* Location info */}
          {location ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip
                icon={<GpsFixedIcon />}
                label={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {location.accuracy && (
                <Chip
                  label={`±${Math.round(location.accuracy)}m doğruluk`}
                  size="small"
                  color={location.accuracy < 50 ? 'success' : 'warning'}
                  variant="outlined"
                />
              )}
              {geofenceRadius && (
                <Chip
                  label={`${geofenceRadius}m geofence`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {editable ? 'Haritaya tıklayarak veya butonu kullanarak konum seçin' : 'Konum bilgisi yok'}
            </Typography>
          )}

          {/* Action buttons */}
          {onLocationFetch && (
            <Button
              variant={location ? 'outlined' : 'contained'}
              color={location ? 'success' : 'primary'}
              startIcon={<MyLocationIcon />}
              onClick={onLocationFetch}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? 'Konum Alınıyor...' : location ? '📍 Konumu Güncelle' : '📍 Anlık Konumu Al'}
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default LocationMap;


