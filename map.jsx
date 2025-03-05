import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from '@turf/turf';
import {
    createAboutSpotElement,
    createImgSpotElement,
    createLinksSpotElement, createRouteElement,
    createTitleSpotElement,
    piecewiseLinear
} from "./details";


const urlParams = new URLSearchParams(window.location.search);
const config = {
    token: 'pk.eyJ1IjoiYW5kcmV3bGV2aW4iLCJhIjoiY2t5ZXM5c3cyMWJxYjJvcGJycmw0dGlyeSJ9.9QfCmimkyYicpprraBc-XQ',
    style: 'mapbox://styles/andrewlevin/clurjvodg013d01pe0fqncusu',
    zoom: 6.3,
    center: [38.095566, 56.904779],
    imageRoot: 'https://volgagrandtour.github.io/images/segments/',
    spotsUrl: 'https://volgagrandtour.github.io/map/spots.json',
    tracksUrl: 'https://volgagrandtour.github.io/map/routes.json',
    trackLineWidth: 3,
    trackLineWidthHover: 6,
    trackLinePaddingWidth: 30,
    spotMarkerRadius: {
        all: {
            zoomMin: 6,
            zoomMinRadius: 15,
            zoomMax: 10,
            zoomMaxRadius: 50
        },
        town: {
            zoomMin: 6,
            zoomMinRadius: 20,
            zoomMax: 11,
            zoomMaxRadius: 60
        },
        landmark: {
            zoomMin: 7,
            zoomMinRadius: 4,
            zoomMax: 13,
            zoomMaxRadius: 25
        }
    }
};


mapboxgl.accessToken = config.token;

const MapComponent = () => {
    const [map, setMap] = useState(null);

    useEffect(() => {
        console.log("Initializing map...");
        const map = new mapboxgl.Map({
            container: "map",
            style: config.style,
            center: config.center,
            zoom: config.zoom,
        });
        setMap(map);

        // TRACKS 🛼🛼🛼
        fetch(config.tracksUrl)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((routes) => {
                routes.forEach((track) => {
                    const coordinatesTrack = track.points.map(([lat, lon]) => [lon, lat])
                    const lineStringTrack = turf.lineString(coordinatesTrack);
                    const distance = Math.trunc(turf.length(lineStringTrack, { units: 'kilometers' }));
                    const trackSourceID = 'source-' + track.path;
                    const trackLayerID = 'track-' + track.path;
                    const paddingTrackLayerID = 'padding-' + trackLayerID;

                    const popupElem  = createRouteElement(track?.title ?? '', distance)

                    map.addSource(trackSourceID, {
                        type: "geojson",
                        data: {type: "Feature", geometry: {type: "LineString", coordinates: coordinatesTrack}}
                    });

                    map.addLayer({
                        id: trackLayerID,
                        type: "line",
                        source: trackSourceID,
                        layout: {},
                        paint: {"line-color": track.color, "line-width": config.trackLineWidth},
                    });

                    map.addLayer({
                        id: paddingTrackLayerID,
                        type: 'line',
                        source: trackSourceID,
                        paint: {'line-color': 'rgba(0, 0, 0, 0)', 'line-width': config.trackLinePaddingWidth},
                        layout: {'line-cap': 'round', 'line-join': 'round'}
                    });

                    map.on("mousemove", paddingTrackLayerID, () => {
                        map.setPaintProperty(trackLayerID, "line-width", config.trackLineWidthHover);
                    });

                    map.on("mouseleave", paddingTrackLayerID, () => {
                        map.setPaintProperty(trackLayerID, "line-width", config.trackLineWidth);
                    });

                    map.on("click", paddingTrackLayerID, function (e) {
                        if (e.originalEvent.target.closest('.mapboxgl-marker'))
                            return;

                        new mapboxgl.Popup({className: 'cozy-popup cozy-track-popup',})
                            .setLngLat(e.lngLat)
                            .setHTML(popupElem.outerHTML)
                            .addTo(map);
                    });
                });
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });


        fetch("https://volgagrandtour.github.io/map/spots.json")
            .then((res) => res.json())
            .then((spots) => {

                const spotsGroups = {};

                for (const spot of spots) {
                    let kind = spot?.kind || 'all';

                    if (!spotsGroups[kind])
                        spotsGroups[kind] = [];

                    spotsGroups[kind].push(spot);
                }

                console.log(spotsGroups);

                spots.forEach((spot) => {
                    const [lat, lon] = spot.coords.split(", ").map(Number);
                    const kind = spot?.kind || 'all';
                    const rKind = config.spotMarkerRadius?.[kind] || config.spotMarkerRadius.all
                    const radiusMarker = Math.trunc(piecewiseLinear(config.zoom, rKind.zoomMin, rKind.zoomMinRadius, rKind.zoomMax, rKind.zoomMaxRadius));
                    const markerKindClass = `cozy-spot-marker-kind-${kind}`;

                    const markerSpotElem = Object.assign(document.createElement('div'), {
                        className: 'cozy-spot-marker ' + markerKindClass,
                        style: `width: ${radiusMarker}px; height: ${radiusMarker}px;`});

                    const popupSpotElem = Object.assign(document.createElement('div'), {
                        className: 'popup'});

                    if (spot?.title)
                        popupSpotElem.appendChild(createTitleSpotElement(spot.title));

                    // Todo Refactor img sizes

                    if (spot?.img) {
                        const markerImgPath = `${config.imageRoot}${spot.img.replace(".jpg", "-120px.jpg")}`;
                        const popupImgPath = `${config.imageRoot}${spot.img.replace(".jpg", "-420px.jpg")}`;

                        console.log('popupImgPath: ', popupImgPath);

                        markerSpotElem.style.backgroundImage = `url('${markerImgPath}\')`;

                        popupSpotElem.appendChild(createImgSpotElement(popupImgPath));
                    }

                    if (spot?.about)
                        popupSpotElem.appendChild(createAboutSpotElement(spot.about));

                    if (spot?.links) {
                        const linkElement = createLinksSpotElement(popupSpotElem, spot.links);
                        if (linkElement) {
                            popupSpotElem.appendChild(linkElement);
                        }
                    }

                    if (spot?.icon){
                        const markerSpotElem = document.createElement('div');
                        markerElement.style.backgroundImage = `url(assets/icons/${spot.icon})`;
                        markerElement.style.width = spot?.iconwidth || '40px';
                        markerElement.style.height = spot?.iconwidth || '40px';
                        markerElement.style.backgroundSize = 'cover';
                    }

                    new mapboxgl.Marker(markerSpotElem)
                        .setLngLat([lon, lat])
                        .setPopup(new mapboxgl.Popup({offset: 50, className: 'cozy-popup cozy-spot-popup'})
                            .setHTML(popupSpotElem.outerHTML))
                        .addTo(map);
                });

                map.on('zoom', function () {
                    const zoom = map.getZoom();

                    Object.keys(spotsGroups).forEach(kind => {
                        const rKind = config.spotMarkerRadius?.[kind] || config.spotMarkerRadius.all
                        const radiusMarker = Math.trunc(piecewiseLinear(zoom, rKind.zoomMin, rKind.zoomMinRadius, rKind.zoomMax, rKind.zoomMaxRadius));

                        console.log('zoom: ', zoom, 'kind: ', kind, 'radius: ', radiusMarker, 'scheme: ', rKind);

                        document.querySelectorAll(`.cozy-spot-marker-kind-${kind}`).forEach(marker => {
                            marker.style.width = `${radiusMarker}px`;
                            marker.style.height = `${radiusMarker}px`;
                        });
                    });
                });
            });

        map.on("load", () => {
            console.log("Map is loaded!");
            const lonDelta = 0.02;
            const latDelta = 0.02;

            if ([...urlParams].length > 0) {
                const minlat = urlParams.get("minlat");
                const maxlat = urlParams.get("maxlat");
                const minlon = urlParams.get("minlon");
                const maxlon = urlParams.get("maxlon");
                if (!isNaN(minlat) && !isNaN(minlon) && !isNaN(maxlat) && !isNaN(maxlon)) {
                    setTimeout(() => {
                        map.fitBounds(
                            [
                                [parseFloat(minlon) - lonDelta, parseFloat(minlat) - latDelta],
                                [parseFloat(maxlon) + lonDelta, parseFloat(maxlat) + latDelta]
                            ],
                            {padding: 20, duration: 2000, maxZoom: 15}
                        );
                    }, 1000);
                }
            }


        });

    }, []);


    return <div id="map" style={{ width: "100%", height: "100vh" }} />;
};

export default MapComponent;
