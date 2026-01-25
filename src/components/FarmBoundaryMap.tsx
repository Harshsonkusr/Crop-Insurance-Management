import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface Coordinate {
    lat: number;
    lng: number;
}

interface FarmBoundaryMapProps {
    coordinates: Coordinate[];
    center?: Coordinate;
    zoom?: number;
    interactive?: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

const FarmBoundaryMap: React.FC<FarmBoundaryMapProps> = ({
    coordinates,
    center: initialCenter,
    zoom = 15,
    interactive = true
}) => {
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        ...(googleMapsApiKey ? {} : { libraries: [] })
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map && coordinates.length > 0 && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            coordinates.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds);
        }
    }, [map, coordinates]);

    const mapCenter = useMemo(() => {
        if (initialCenter) return initialCenter;
        if (coordinates.length > 0) {
            const lats = coordinates.map(c => c.lat);
            const lngs = coordinates.map(c => c.lng);
            return {
                lat: (Math.min(...lats) + Math.max(...lats)) / 2,
                lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
            };
        }
        return { lat: 20.5937, lng: 78.9629 }; // Default center of India
    }, [coordinates, initialCenter]);

    const polygonOptions = {
        fillColor: "#22c55e",
        fillOpacity: 0.35,
        strokeColor: "#16a34a",
        strokeOpacity: 1,
        strokeWeight: 2,
    };

    if (!googleMapsApiKey || !isLoaded) {
        return (
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-muted flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium mb-2 text-lg">Farm Boundary Map</p>
                    {!googleMapsApiKey && (
                        <p className="text-sm text-muted-foreground">
                            Add VITE_GOOGLE_MAPS_API_KEY to .env to enable map
                        </p>
                    )}
                    {googleMapsApiKey && !isLoaded && (
                        <p className="text-sm text-muted-foreground">Loading Map...</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 z-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: !interactive,
                    zoomControl: interactive,
                    scrollwheel: interactive,
                    draggable: interactive,
                    mapTypeId: 'satellite' // Using satellite view as it's better for farm boundaries
                }}
            >
                {coordinates.length > 0 && (
                    <>
                        {coordinates.length >= 3 && (
                            <Polygon
                                paths={coordinates}
                                options={polygonOptions}
                            />
                        )}
                        {coordinates.map((coord, index) => (
                            <Marker
                                key={index}
                                position={coord}
                                label={(index + 1).toString()}
                            />
                        ))}
                    </>
                )}
            </GoogleMap>
        </div>
    );
};

export default FarmBoundaryMap;
