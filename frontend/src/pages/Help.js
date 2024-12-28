import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Toaster, toast } from 'react-hot-toast';

const Help = () => {
  const [myLocation, setMyLocation] = useState({ lat: 0, lng: 0 });
  const [petrolStations, setPetrolStations] = useState([]);
  const [nearestStation, setNearestStation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    fuelType: '',
    quantity: '',
    deliveryTime: 'asap'
  });
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;


  const FUEL_PRICES = {
    petrol: 102.50,
    diesel: 89.75
  };

  const DELIVERY_TIMES = [
    { value: 'asap', label: 'As Soon As Possible (30-45 mins)' },
    { value: '2hours', label: 'Within 2 Hours' },
    { value: '4hours', label: 'Within 4 Hours' },
    { value: 'scheduled', label: 'Schedule for Later' }
  ];

  const calculateBill = () => {
    const baseAmount = orderDetails.quantity * FUEL_PRICES[orderDetails.fuelType];
    const deliveryCharge = 50;
    const subtotal = baseAmount + deliveryCharge;
    const gst = subtotal * 0.18;
    return {
      baseAmount,
      deliveryCharge,
      gst,
      total: subtotal + gst
    };
  };

  const calculateDistance = (loc1, loc2) => {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const findNearbyPetrolStations = (map, location) => {
    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: location,
      radius: 5000,
      type: ['gas_station']
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const stations = results.map(place => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }));
        setPetrolStations(stations);

        if (stations.length > 0) {
          const closest = stations.reduce((prev, curr) => {
            const prevDistance = calculateDistance(location, { lat: prev.lat, lng: prev.lng });
            const currDistance = calculateDistance(location, { lat: curr.lat, lng: curr.lng });
            return parseFloat(currDistance) < parseFloat(prevDistance) ? curr : prev;
          });
          setNearestStation(closest);
        }
      }
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        setMyLocation({ lat: 12.9716, lng: 77.5946 });
        toast.error('Location access denied. Using default location.');
      }
    );
  }, []);

  const downloadBill = () => {
    const bill = calculateBill();
    const billContent = `
      Refuel Rescue - Fuel Delivery Bill
      ----------------------------------
      Station: ${selectedStation ? selectedStation.name : 'Nearest Available Station'}
      Delivery To: Your Location
      Fuel Type: ${orderDetails.fuelType.toUpperCase()}
      Quantity: ${orderDetails.quantity} L
      Rate: ₹${FUEL_PRICES[orderDetails.fuelType]}/L
      Delivery Time: ${DELIVERY_TIMES.find(t => t.value === orderDetails.deliveryTime).label}
      
      Base Amount: ₹${bill.baseAmount.toFixed(2)}
      Delivery Charge: ₹${bill.deliveryCharge.toFixed(2)}
      GST (18%): ₹${bill.gst.toFixed(2)}
      ----------------------------------
      Total Amount: ₹${bill.total.toFixed(2)}
    `;

    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuel-bill.txt';
    a.click();
    
    toast.success('Order placed successfully! Delivery details sent to your phone.');
    setIsOrderModalOpen(false);
    setOrderDetails({ fuelType: '', quantity: '', deliveryTime: 'asap' });
  };

  const handleOrderClick = () => {
    if (!myLocation.lat || !myLocation.lng) {
      toast.error('Unable to detect your location. Please enable location services.');
      return;
    }
    setSelectedStation(null);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-blue-600 px-40">⛽ Refuel Rescue</span>
              <div className='px-40'>
              <button 
                onClick={handleOrderClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Order Fuel
              </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '70vh' }}
                  center={myLocation}
                  zoom={14}
                  onLoad={map => findNearbyPetrolStations(map, myLocation)}
                >
                  <Marker
                    position={myLocation}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                  />
                  {petrolStations.map(station => (
                    <Marker
                      key={station.id}
                      position={{ lat: station.lat, lng: station.lng }}
                      title={station.name}
                      onClick={() => setSelectedStation(station)}
                      icon={{
                        url: station.id === nearestStation?.id 
                          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      }}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Nearby Stations ({petrolStations.length})</h2>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {petrolStations
                  .sort((a, b) => {
                    const distA = calculateDistance(myLocation, { lat: a.lat, lng: a.lng });
                    const distB = calculateDistance(myLocation, { lat: b.lat, lng: b.lng });
                    return distA - distB;
                  })
                  .map(station => (
                    <div
                      key={station.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedStation?.id === station.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedStation(station)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{station.name}</h3>
                          <p className="text-sm text-gray-500">
                            {calculateDistance(myLocation, { lat: station.lat, lng: station.lng })} km away
                          </p>
                        </div>
                        {station.id === nearestStation?.id && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Nearest
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Fuel</h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fuel Type</label>
                <select
                  className="w-full border rounded-lg p-2"
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, fuelType: e.target.value }))}
                  value={orderDetails.fuelType}
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol (₹{FUEL_PRICES.petrol}/L)</option>
                  <option value="diesel">Diesel (₹{FUEL_PRICES.diesel}/L)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Quantity (L)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded-lg p-2"
                  value={orderDetails.quantity}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Time</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={orderDetails.deliveryTime}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryTime: e.target.value }))}
                >
                  {DELIVERY_TIMES.map(time => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>

              {orderDetails.fuelType && orderDetails.quantity && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Delivery Location:</span>
                    <span className="text-green-600">Your Current Location</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>₹{(orderDetails.quantity * FUEL_PRICES[orderDetails.fuelType]).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>₹50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{(((orderDetails.quantity * FUEL_PRICES[orderDetails.fuelType]) + 50) * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{calculateBill().total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className={`px-4 py-2 rounded-lg ${
                  !orderDetails.fuelType || !orderDetails.quantity
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={!orderDetails.fuelType || !orderDetails.quantity}
                onClick={downloadBill}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;