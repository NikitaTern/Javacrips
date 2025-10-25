import React, { useEffect, useRef, useState } from 'react';

const TwoGISRouting = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [firstPoint, setFirstPoint] = useState(null);
  const [secondPoint, setSecondPoint] = useState(null);
  const [routeLine, setRouteLine] = useState(null);
  const [selecting, setSelecting] = useState('a');
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [resetButtonText, setResetButtonText] = useState('Выберите точку A на карте');

  const API_KEY = 'ef9ec1aa-bf4f-4599-b844-719e00ea7943';
  const reqUrl = `https://routing.api.2gis.com/routing/7.0.0/global?key=${API_KEY}`;

  // Создаем кастомные иконки для точек A и B
  const markerIconA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="%230078FF" stroke="white" stroke-width="2"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">A</text>
  </svg>`;

  const markerIconB = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="%23FF4444" stroke="white" stroke-width="2"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">B</text>
  </svg>`;

  // Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const loadMapGL = () => {
      return new Promise((resolve, reject) => {
        if (window.mapgl) {
          resolve(window.mapgl);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://mapgl.2gis.com/api/js/v1';
        script.async = true;

        script.onload = () => {
          console.log('2GIS script loaded');
          resolve(window.mapgl);
        };
        script.onerror = reject;

        document.head.appendChild(script);
      });
    };

    loadMapGL()
      .then((mapgl) => {
        mapRef.current = new mapgl.Map(mapContainerRef.current, {
          center: [37.615655, 55.768005],
          zoom: 13,
          key: API_KEY,
        });

        mapRef.current.on('click', handleMapClick);
        console.log('2GIS map initialized');
      })
      .catch((error) => {
        console.error('Failed to load 2GIS map:', error);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
      }
      markers.forEach(marker => {
        if (marker && marker.destroy) marker.destroy();
      });
      if (routeLine && routeLine.destroy) routeLine.destroy();
    };
  }, []);

  // Обработчик клика по карте - ПРОСТАЯ И РАБОЧАЯ ЛОГИКА
  const handleMapClick = (event) => {
    if (!event || !event.lngLat || !Array.isArray(event.lngLat) || event.lngLat.length !== 2) {
      console.error("Invalid click event");
      return;
    }

    const [lng, lat] = event.lngLat;
    console.log(`Clicked coordinates: ${lng}, ${lat}, current selecting: ${selecting}`);

    // Используем функциональное обновление для получения актуального состояния
    setSelecting(currentSelecting => {
      console.log(`Updating from ${currentSelecting}`);

      if (currentSelecting === 'a') {
        // Создаем маркер точки A
        const markerA = new mapgl.Marker(mapRef.current, {
          coordinates: [lng, lat],
          icon: markerIconA,
        });

        setFirstPoint({ lon: lng, lat: lat });
        setMarkers(prev => [...prev, markerA]);
        setResetButtonText('Выберите точку B на карте');
        console.log('✅ Point A created');
        return 'b'; // Переключаем на выбор точки B

      } else if (currentSelecting === 'b') {
        // Создаем маркер точки B
        const markerB = new mapgl.Marker(mapRef.current, {
          coordinates: [lng, lat],
          icon: markerIconB,
        });

        setSecondPoint({ lon: lng, lat: lat });
        setMarkers(prev => [...prev, markerB]);
        setResetButtonText('Сбросить точки');
        setIsResetDisabled(false);

        console.log('✅ Point B created');

        // Строим маршрут используя актуальные точки
        setFirstPoint(prevFirstPoint => {
          if (prevFirstPoint) {
            console.log('🔄 Building route between points');
            fetchRoute([prevFirstPoint, { lon: lng, lat: lat }]);
          }
          return prevFirstPoint;
        });

        return 'end'; // Завершаем выбор точек
      }

      return currentSelecting; // Если уже 'end', ничего не меняем
    });
  };

  // Запрос маршрута
  const fetchRoute = (points) => {
    console.log('🛣️ Building route between:', points);

    fetch(reqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        points,
        locale: "ru",
        transport: "car",
        output: "detailed"
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((parsed) => {
        console.log('✅ Route response received');

        if (parsed.result && parsed.result.length > 0) {
          const route = parsed.result[0];
          const coordinates = extractCoordinatesFromRoute(route);

          if (coordinates.length > 0) {
            console.log(`🎯 Rendering route with ${coordinates.length} points`);
            renderRoute(coordinates);
            showRouteInfo(route);
          } else {
            console.error("❌ No coordinates found in route geometry");
            alert('Не удалось построить маршрут между выбранными точками.');
          }
        } else {
          console.error("❌ No route found in response");
          alert('Маршрут не найден. Убедитесь, что точки находятся в одном городе.');
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching route data:", err);
        alert('Ошибка при построении маршрута. Проверьте подключение к интернету.');
      });
  };

  // Извлечение координат из маршрута
  const extractCoordinatesFromRoute = (route) => {
    const coordinates = [];

    try {
      // Пробуем разные способы извлечения координат
      if (route.geometry) {
        console.log('📐 Extracting from route.geometry');
        const geometryCoords = parseGeometry(route.geometry);
        coordinates.push(...geometryCoords);
      }

      if (coordinates.length === 0 && route.sections) {
        console.log('📐 Extracting from route.sections');
        route.sections.forEach(section => {
          if (section.geometry) {
            const geometryCoords = parseGeometry(section.geometry);
            coordinates.push(...geometryCoords);
          }
        });
      }

      if (coordinates.length === 0 && route.maneuvers) {
        console.log('📐 Extracting from route.maneuvers');
        route.maneuvers.forEach(maneuver => {
          if (maneuver.outcoming_path && maneuver.outcoming_path.geometry) {
            maneuver.outcoming_path.geometry.forEach(geometry => {
              if (geometry.selection) {
                const geometryCoords = parseGeometry(geometry.selection);
                coordinates.push(...geometryCoords);
              }
            });
          }
        });
      }

    } catch (error) {
      console.error('❌ Error extracting coordinates:', error);
    }

    console.log(`📊 Extracted ${coordinates.length} coordinates`);
    return coordinates;
  };

  // Парсинг геометрии
  const parseGeometry = (geometryString) => {
    try {
      return geometryString
        .replace('LINESTRING(', '')
        .replace(')', '')
        .split(',')
        .map(coord => {
          const [lng, lat] = coord.trim().split(' ').map(Number);
          return [lng, lat];
        })
        .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
    } catch (error) {
      console.error('❌ Error parsing geometry:', error);
      return [];
    }
  };

  // Отрисовка маршрута
  const renderRoute = (coordinates) => {
    // Удаляем предыдущий маршрут
    if (routeLine && routeLine.destroy) {
      routeLine.destroy();
      setRouteLine(null);
    }

    // Создаем новую линию маршрута
    if (coordinates.length > 0) {
      const newRouteLine = new mapgl.Polyline(mapRef.current, {
        coordinates,
        width: 6,
        color: "#0078FF",
        opacity: 0.8,
      });
      setRouteLine(newRouteLine);

      // Подгоняем карту под маршрут
      fitMapToRoute(coordinates);
    }
  };

  // Подгон карты под маршрут
  const fitMapToRoute = (coordinates) => {
    if (!mapRef.current || coordinates.length === 0) return;

    try {
      // Находим границы маршрута
      const lngs = coordinates.map(coord => coord[0]);
      const lats = coordinates.map(coord => coord[1]);

      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

      // Устанавливаем центр карты
      mapRef.current.setCenter([centerLng, centerLat]);

      // Автоматически подбираем zoom
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const maxDiff = Math.max(lngDiff, latDiff);

      let zoom = 13;
      if (maxDiff < 0.01) zoom = 15;
      if (maxDiff < 0.005) zoom = 16;
      if (maxDiff < 0.002) zoom = 17;
      if (maxDiff > 0.05) zoom = 12;
      if (maxDiff > 0.1) zoom = 11;
      if (maxDiff > 0.2) zoom = 10;

      mapRef.current.setZoom(zoom);
    } catch (error) {
      console.error('❌ Error fitting map:', error);
    }
  };

  // Показ информации о маршруте
  const showRouteInfo = (route) => {
    const distance = route.total_distance ? (route.total_distance / 1000).toFixed(1) : 'N/A';
    const duration = route.total_duration ? Math.round(route.total_duration / 60) : 'N/A';

    console.log(`✅ Маршрут построен: ${distance} км, ${duration} мин`);
  };

  // Сброс точек и маршрута
  const handleReset = () => {
    console.log('🔄 Resetting map...');

    // Удаляем маркеры
    markers.forEach((marker) => {
      if (marker && marker.destroy) {
        marker.destroy();
      }
    });
    setMarkers([]);

    // Удаляем маршрут
    if (routeLine && routeLine.destroy) {
      routeLine.destroy();
      setRouteLine(null);
    }

    // Сбрасываем состояния
    setFirstPoint(null);
    setSecondPoint(null);
    setSelecting('a');
    setIsResetDisabled(true);
    setResetButtonText('Выберите точку A на карте');

    // Возвращаем карту к начальному виду
    if (mapRef.current) {
      mapRef.current.setCenter([37.615655, 55.768005]);
      mapRef.current.setZoom(13);
    }

    console.log('✅ Map reset complete');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Панель управления */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          minWidth: '280px'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
          🗺️ Построение маршрута
        </h3>

        <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
          {selecting === 'a' && '🟦 Кликните на карте чтобы выбрать точку A'}
          {selecting === 'b' && '🟥 Кликните на карте чтобы выбрать точку B'}
          {selecting === 'end' && '✅ Маршрут построен! Нажмите "Сбросить" для нового маршрута'}
        </div>

        {/* Информация о точках */}
        <div style={{
          marginBottom: '10px',
          padding: '10px',
          background: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#0078FF',
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>A</div>
            <span>Точка A: {firstPoint ? '✅ установлена' : '❌ не выбрана'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#FF4444',
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>B</div>
            <span>Точка B: {secondPoint ? '✅ установлена' : '❌ не выбрана'}</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetDisabled}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: isResetDisabled ? '#f2f2f2' : '#0078FF',
            color: isResetDisabled ? '#6e6d6d' : 'white',
            cursor: isResetDisabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          {resetButtonText}
        </button>
      </div>
    </div>
  );
};

export default TwoGISRouting;