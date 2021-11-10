import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import Routing from "./RoutingMachine";
import Search from "react-leaflet-search";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

const geocoder = L.Control.Geocoder.nominatim();

class MapComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            zoom: 10,
            showPlaceHolder: false,
            isMapInit: false,
            markerData: [],
            locationNane: '',
        };
        this.map = null
        this.updateMarker = this.updateMarker.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.saveMap = this.saveMap.bind(this);
    }

    getLocationname(latLng) {
        geocoder.reverse(
            latLng,
            this.map.leafletElement.getZoom(),
            results => {
                console.log("asdaasdadadaads"+results);
                var r = results[3];
                console.log('address', r)
                this.setState({
                    locationNane: r.name
                }, () => this.props.getName(r.name, latLng,r.state))
            }
        );
        var inp = "Lahore"
        var xmlhttp = new XMLHttpRequest();
        var url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + inp;
        xmlhttp.onreadystatechange = function()
        {    
            var myArr = JSON.parse(this.responseText);
            console.log("location test",myArr)         
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();        
    }

    saveMap(map) {
        this.map = map;
        this.setState({
            isMapInit: true
        });
    };

    handleChange(info) {
        let row = info.raw
        let address_index = 0;
        for(let i = 0; i < row.length; i++){
            if(info.info == info.raw[i].display_name){
                address_index = i;
                break
            }
        }
        console.log("FROM onChange", info);
        console.log("FROM onChange", address_index);
        const coords = info.latLng;
        this.setState({
            locationNane: info.info,
            markerData: [...this.state.markerData, coords]
        }, () => this.props.getName(info.info, info.latLng,JSON.stringify(info.raw[address_index].address)));
    }

    updateMarker = event => {
        const latLng = event.target.getLatLng(); //get updated marker LatLng
        const markerIndex = event.target.options.marker_index; //get marker index
        //update 
        console.log('latlng', latLng)
        this.setState(prevState => {
            const markerData = [...prevState.markerData];
            markerData[markerIndex] = latLng;
            return { markerData: markerData };
        }, () => this.getLocationname(latLng));
    };

    openPopup(marker) {
        if (marker && marker.leafletElement) {
            window.setTimeout(() => {
                marker.leafletElement.openPopup()
            })
        }
    }
    render() {
        const {zoom} = this.state;
        const { search, currentPoint, location_name } = this.props;
        console.log('location',location_name)

        return (
            <Map center={search === true ? currentPoint : this.props.startPoint} zoom={zoom} ref={this.saveMap}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {this.state.markerData.map((element, index) => (
                    <Marker
                        key={index}
                        marker_index={index}
                        position={element}
                        ref={this.openPopup}
                        draggable={true}
                        onDragend={this.updateMarker}
                    >
                        <Popup>
                            <span>
                                {this.state.locationNane}
                            </span>
                        </Popup>
                    </Marker>
                ))}
                {this.state.isMapInit && (search === false) && <Routing map={this.map} startPoint={this.props.startPoint} currentPoint={currentPoint} endPoint={this.props.endPoint} />}
                {(search === true) && (
                    <>
                        <Search                            
                            onChange={(info) => this.handleChange(info)}
                            position="topright"
                            inputPlaceholder={/* (location_name && location_name != '') ? location_name :  */"Address"}
                            search={true}
                            showMarker={false}
                            zoom={7}
                            search={(location_name && location_name !== '') ? location_name : this.state.locationNane}
                            closeResultsOnClick={true}
                            openSearchOnLoad={true}
                            // these searchbounds would limit results to only Turkey.
                            providerOptions={{                            
                                region: ":"
                            }}
                        >
                        </Search>
                        <Marker
                            position={currentPoint}
                            color="green">                            
                        </Marker>
                    </>)}
            </Map>
        );
    }
}

export default MapComponent;
