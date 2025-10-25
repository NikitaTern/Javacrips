const reqUrl = `https://routing.api.2gis.com/routing/7.0.0/global?key=ef9ec1aa-bf4f-4599-b844-719e00ea7943`;

const map = new mapgl.Map('container', {
    center: [37.615655, 55.768005],
    zoom: 13,
    key: 'ef9ec1aa-bf4f-4599-b844-719e00ea7943',
});

const markers = [];
let firstPoint = null;
let secondPoint = null;
let routeLine = null;
let selecting = 'a';
const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', () => {
    selecting = 'a';
    firstPoint = null;
    secondPoint = null;
    if (routeLine) routeLine.destroy();
    markers.forEach((marker) => marker.destroy());
    markers.length = 0;
    resetButton.disabled = true;
    resetButton.textContent = 'Выберите две точки на карте';
});

map.on('click', (event) => {
    if (!event || !event.lngLat || !Array.isArray(event.lngLat) || event.lngLat.length !== 2) {
        console.error("Invalid click event: lngLat is undefined or invalid");
        return;
    }

    const [lng, lat] = event.lngLat;

    console.log(`Clicked coordinates: ${lng}, ${lat}`);

    if (selecting !== 'end') {
        const marker = new mapgl.Marker(map, {
            coordinates: [lng, lat],
            icon: 'https://docs.2gis.com/img/dotMarker.svg',
        });
        markers.push(marker);
    }

    if (selecting === 'a') {
        firstPoint = { lon: lng, lat: lat };
        selecting = 'b';
    } else if (selecting === 'b') {
        secondPoint = { lon: lng, lat: lat };
        selecting = 'end';
    }

    if (firstPoint && secondPoint) {
        fetchRoute([firstPoint, secondPoint]);

        resetButton.disabled = false;
        resetButton.textContent = 'Сбросить точки';
    }
});
function fetchRoute(points) {
    fetch(reqUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            points,
            locale: "ru",
            transport: "driving",
            filters: ["dirt_road", "toll_road", "ferry"],
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
            if (parsed.result && parsed.result.length > 0) {
                const coordinates = parsed.result[0].maneuvers
                    .flatMap((maneuver) => {
                        if (
                            maneuver.outcoming_path &&
                            maneuver.outcoming_path.geometry &&
                            maneuver.outcoming_path.geometry.length > 0
                        ) {
                            return maneuver.outcoming_path.geometry
                                .flatMap((geometry) => {
                                    const selection = geometry.selection;
                                    return selection
                                        .replace("LINESTRING(", "")
                                        .replace(")", "")
                                        .split(",")
                                        .map((point) => point.trim().split(" ").map(Number));
                                });
                        }
                        return [];
                    });

                if (coordinates.length > 0) {
                    renderRoute(coordinates);
                } else {
                    console.error("No coordinates found in response");
                }
            } else {
                console.error("No route found in response");
            }
        })
        .catch((err) => console.error("Error fetching route data:", err.message || err));
}

function renderRoute(coordinates) {
    if (routeLine) {
        routeLine.destroy();
    }
    routeLine = new mapgl.Polyline(map, {
        coordinates,
        width: 6,
        color: "#0078FF",
    });
}

fetchRoute();
alert('ПРивит')