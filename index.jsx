import React from "react";
import ReactDOM from "react-dom/client";
import MapComponent from "./map";
import 'bootstrap/dist/css/bootstrap.min.css';
import "mapbox-gl/dist/mapbox-gl.css";
import './styles.css'

const App = () => {
    return (
        <div>
            <MapComponent />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);