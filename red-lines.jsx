import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "pk.eyJ1IjoiYW5kcmV3bGV2aW4iLCJhIjoiY2t5ZXM5c3cyMWJxYjJvcGJycmw0dGlyeSJ9.9QfCmimkyYicpprraBc-XQ";

const MapComponent = ({ containerId, coordinates, lineColor }) => {
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: containerId,
            style: "mapbox://styles/andrewlevin/clurjvodg013d01pe0fqncusu",
            center: [(coordinates[0][0] + coordinates[1][0]) / 2, (coordinates[0][1] + coordinates[1][1]) / 2],
            zoom: 10,
        });

        map.on("load", () => {
            map.addSource(containerId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: coordinates,
                    },
                },
            });

            map.addLayer({
                id: containerId,
                type: "line",
                source: containerId,
                layout: { "line-cap": "round", "line-join": "round" },
                paint: { "line-color": lineColor, "line-width": 4 },
            });
        });

        return () => map.remove();
    }, [containerId, coordinates, lineColor]);

    return <div id={containerId} className="map" style={{ width: "100%", height: "300px", borderRadius: "10px" }}></div>;
};

const App = () => {
    return (
        <div className="container" style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
            <div className="map-container" style={{ marginBottom: "30px" }}>
                <div className="map-title" style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>Карта 1: Красная линия</div>
                <div className="map-description" style={{ fontSize: "14px", marginBottom: "10px", color: "#555" }}>Линия между точками (56.700907, 35.909769) и (56.867433, 36.712732).</div>
                <MapComponent containerId="map1" coordinates={[[35.909769, 56.700907], [36.712732, 56.867433]]} lineColor="#FF0000" />
                <h3>Header</h3>
            </div>
        </div>
    );
};

export default App;
