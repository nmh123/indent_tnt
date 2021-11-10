import { MapLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "lrm-google";
import { withLeaflet } from "react-leaflet";
import logo from './marker-icon.png';
class Routing extends MapLayer {
    createLeafletElement() {
        const { map, startPoint, endPoint,currentPoint } = this.props;
        var greenIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
            iconSize: [35, 51],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var currentIcon = new L.Icon({
            iconUrl:logo,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
            iconSize: [55, 71],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        var redIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
            iconSize: [35, 51],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });


        let leafletElement = L.Routing.control({
            waypoints: [
                L.latLng(startPoint[0], startPoint[1]),
                L.latLng(currentPoint[0], currentPoint[1]),
                L.latLng(endPoint[0], endPoint[1])
            ],
            createMarker: function(i, wp, nWps) {
                if (i === 0) {
                // here change the starting
                return L.marker(wp.latLng, {
                    icon: greenIcon,
                    title:"Pickup Stop",
                });
                } else if(i === 2) {
                // here change all the others
                return L.marker(wp.latLng, {
                    icon: redIcon,
                    title:"Delivery Stop"
                });
                }
                else if(i === 1) {
                    // here change all the others
                    return L.marker(wp.latLng, {
                    icon: currentIcon
                    });
                }
            },
            // router: new L.Routing.Google(),
            lineOptions: {
                styles: [
                    {
                        color: "blue",
                        opacity: 0.6,
                        weight: 4
                    }
                ]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
        }).addTo(map.leafletElement);
        return leafletElement.getPlan();
    }
}
export default withLeaflet(Routing);
