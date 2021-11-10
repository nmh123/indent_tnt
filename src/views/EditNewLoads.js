import React, {Component } from "react";
import {
BrowserRouter as Router,
Redirect,
withRouter,
} from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import Modal from "react-bootstrap/Modal";
import "bootstrap-daterangepicker/daterangepicker.css";
import "./createnewloads.css";
import {
Card,
CardHeader,
Container,
Row,
CardBody,
} from "reactstrap";
import config from "../app_config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {Button } from "react-bootstrap";
import MapComponent from "../components/map/MapComponent";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ReactTelInput from "react-telephone-input/lib/withStyles";
import 'react-telephone-input/css/default.css';
import LoaderComponent from './LoaderComponent';
const moment = require('moment-timezone');
const time = moment(new Date()).format("YYYYMMDDHHmmss");

let unique_id = 1;
class EditNewLoads extends Component {
    constructor(props) {
        super(props);
        this.state = {
        submit_loading:false,
        screen_loading:true,
        isLogin: true,
        user: null,
        carrier: [],
        customer: [],
        address: "",
        LocationName: "",
        currentPoint: this.props.currentPoint,
        lgShow: false,
        note1Show: false,
        Options: "",
        success: "",
        d_phone: "",
        d_email: "",
        d_name: "",
        isMapLoad: false,
        LocationUpdate_LAT: 40.7128,
        LocationUpdate_LNG: -74.006,
        mapLATLNG: [40.7128, -74.006],
        formShipper: "",
        formController: "",
        formStatus: "",
        formTrackingmode: "MANUAL",
        formPriority: "NORMAL",
        formDescription: "",
        edit_head: false,
        formSchedule: "",
        phn_exist: "",
        d_phone_value: "",
        label_class: "",
        load_num: time,
        LocationUpdate_city: "",
        LocationUpdate_country: "",
        LocationUpdate_country_code: "",
        LocationUpdate_state: "",
        LocationUpdate_county: "",
        stops: [],
        stop_index: "",
        interIndex: 0,
        editInter: false,
        load_id_response: "",
        countryCode: "",
        formSchedule_time: "",
        formSchedule_date: "",
        foreign_load_id:"",
        formLoadNumber:'',
        fetchedLoad:[],
        formShipperValue:'',
        formControllerValue:'',
        TimeZoneModal:'',
        TimeZoneReturn:'',
        NoInternet:"false",
        PhoneApiError:false,
        ApiError:false,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getLocationName = this.getLocationName.bind(this);
        this.innerSubmit = this.innerSubmit.bind(this);
        this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
        this.handleNumberChange = this.handleNumberChange.bind(this);   
    }

    check_driver_phone_API(e) {
        /* console.log("drivers phone number",e); */  
        let url = "https://t1-backend-dev.herokuapp.com/check/driver/phone";
        let self = this;
        fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            phone_number: e,
        }),
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.error) {
            this.setState({ success: response.error, label_class: "blue" });
            if (
                response.driver_data &&
                response.driver_data.name != null
            ) {
                this.setState({ d_name: response.driver_data.name });
            }
            if (
                response.driver_data &&
                response.driver_data.email != null
            ) {
                this.setState({ d_email: response.driver_data.email });
            }
            /* console.log(response.driver_data) */;
            } else {
            /* console.log(response.success); */
            this.setState(
                { success: response.success, label_class: "red" },           
            );
            }
        }).catch(err=>{  
            this.setState({PhoneApiError:true}) 
            return
        });
    }

    getLocationName = (name, lati_long, state) => {
        let p = JSON.parse(state);
        console.log("address testing",p.city)
        this.setState(
        {
            LocationName: name,
            LocationUpdate_LAT: lati_long.lat.toString(),
            LocationUpdate_LNG: lati_long.lng.toString(),
            LocationUpdate_city: p.city,
            LocationUpdate_country: p.country,
            LocationUpdate_state: p.state,
            LocationUpdate_country_code: p.country_code,
            LocationUpdate_county: p.county,
        },
        () => this.fetchTimeZone(this.state.LocationUpdate_LAT,this.state.LocationUpdate_LNG)
        );
    };

    fetchTimeZone(lat,lng)
    {
        this.setState({timezone_loading:true})
        let url = "https://t1-backend-dev.herokuapp.com/get_time_zone_from_lat_long"
        fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            lat:lat,
            long:lng
        }),
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.status == "success") {               
            this.setState({
                TimeZoneModal:response.TimeZoneAbbr,
                TimeZoneReturn: response.TimeZone,
                timezone_loading: false,
            })
            return;
            } else {
            alert("No timezone available.");
            this.setState({
                timezone_loading: false,
            });
            }
        }).catch(err=>{console.log(err)
                return
        });
    }

    optionController(option) {
        this.setState({
        Options: option,
        });
    }

    async fetchLoadDetails()
        {
            let id = this.props.match.params.id;
            let url = config.APP_URL + "/list/detail?id=" + id;  
            let var_stops = [];
            // api
            this.setState({
            screen_loading: true,
            });
            fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            })
            .then((res) => res.json())
            .then((response) => {            
                if (response.error) {
                    alert(response.error);
                    this.setState({              
                    screen_loading: false,
                    });
                    return;
                }
                this.setState({
                    screen_loading: false,
                });
                if(response.phone_number !== null){
                this.check_driver_phone_API(response.phone_number)
                }
                if(response.edit_stops.length>0){
                response.edit_stops.map((item,i)=>{              
                let time_fetched =  item.schedule.split('T')
                    var_stops.push({
                    id: unique_id++,
                    stop_type: item.load_stop_type,
                    location_name: item.location,
                    location_lat: item.lat,
                    location_lng: item.long,
                    schedule:item.schedule,                  
                    city:item.city ,
                    state: item.state,
                    county: item.county,
                    country: item.country,  
                    schedule_date: moment(time_fetched[0]).format("MM-DD-YYYY"),
                    schedule_time: moment(item.schedule).format("HH:mm"),
                    load_stop_id:item.id,
                    timezone:item.timezone,
                    timezone_abbr:item.timezone_abbr              
                })
                })}
                this.setState({             
                formLoadNumber: response.order_number,
                formStatus: response.status,
                formPriority: response.priority,
                formDescription: response.description,
                formShipperValue: response.shipper,
                formShipper: response.shipper_id,
                formControllerValue:response.carrier,
                formController: response.carrier_id,
                d_phone: response.phone_number,
                load_id_response: response.order_number,
                stops:var_stops
                });         
            }).catch(err=>{alert("Something went wrong.")
            this.setState({screen_loading:false,ApiError:true})
                    return
            })
        }

    async handleSubmit(event) {
        event.preventDefault();
        let data ={};
        let test_arr = [];
        let test_arr1 = [];
        let arr = this.state.stops;
        for (let i = 0; i < arr.length; i++) {
        if (arr[i].stop_type == "PICKUP") {
            test_arr.push(0);
        }
        if (arr[i].stop_type == "DELIVERY") {
            test_arr1.push(0);
        }
        }
        if (test_arr.length == 0) {
        alert("Pickup stop is missing..");
        return;
        } else if (test_arr1.length == 0) {
        alert("Delivery stop is missing..");
        return;
        }
        if (
        arr[0].stop_type != "PICKUP"       
        ) {
        alert("Your first stop must be Pickup.");
        return;
        } 
        if (
        arr[arr.length-1].stop_type != "DELIVERY"     
        ) {
        alert("Your last stop must be Delivery.");
        return;
        } 
        else {
        for (let i = 0; i < arr.length; i++)
        {
            arr[i].sequence = i + 1;
        }
            for(let i=1 ;i<arr.length; i++)
            {
            let a = moment.tz(arr[i-1].schedule_date,arr[i-1].timezone).utc().format()
            let b = moment.tz(arr[i].schedule_date,arr[i].timezone).utc().format()
            if(a > b)
            {
                alert("Date for stop "+arr[i-1].sequence+" cannot be ahead of date for stop "+arr[i].sequence)
                return
            }
            }
        if(this.state.d_phone == ''){
            this.setState({countryCode:''},()=>{data = {
            load_num: this.state.formLoadNumber,
            shipper_id: this.state.formShipper,
            carrier_id: this.state.formController,
            status: this.state.formStatus,
            priority: this.state.formPriority,
            tracking_mode: this.state.formTrackingmode,
            description: this.state.formDescription,
            location_points: arr,
            driver_phone:this.state.countryCode + this.state.d_phone,
            driver_email: this.state.d_email,
            driver_name: this.state.d_name,
            load_id:this.props.match.params.id
            }})
        }
        else{
            data = {
            load_num: this.state.formLoadNumber,
            shipper_id: this.state.formShipper,
            carrier_id: this.state.formController,
            status: this.state.formStatus,
            priority: this.state.formPriority,
            tracking_mode: this.state.formTrackingmode,
            description: this.state.formDescription,
            location_points: arr,
            driver_phone:this.state.countryCode + this.state.d_phone,
            driver_email: this.state.d_email,
            driver_name: this.state.d_name,
            load_id:this.props.match.params.id
            }
        }  
        let token = await localStorage.getItem("authLogin");
        let url =
            "https://t1-backend-dev.herokuapp.com/update_load_load_stop_driver";
        let self = this;
        self.setState({
            submit_loading:true,
        });
        fetch(url, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((response) => {
            if (response.status == 'success') {
                this.setState({submit_loading:false})               
                alert("Load edited successfully!!");
                console.log(response) /* print response after form submission */
                this.setState({ load_id_response:response.load_id},()=>{this.props.history.push(
                "/loads-details/" + this.props.match.params.id
                )})
                return;
            } else {
                alert("No response");
            }
            }).catch(err=>{
                this.setState({submit_loading:false},()=>{
                    alert("Something went wrong.")
                    return;
                })
            });   
        }
        this.setState({
        edit_head: false,
        formSchedule: "",
        startName: "",
        endName: "",
        interMediaryName: "",
        formPriority: "",
        formShipper: "",
        formController: "",
        formDescription: "",
        formDescription: "",
        d_name: "",
        d_email: "",
        d_phone: "",
        phn_exist: "",
        d_phone_value: "",
        Options: "",
        stops: [],
        load_id_response:'',
        });
        unique_id = 1;
    }
    //api function for lat lang
    customer() {
        let url = "https://t1-backend-dev.herokuapp.com/customer";
        fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.error) {
            alert(response.error);
            return;
            } else {
            let obj = [];
            for (let i = 0; i < response.length; i++) {
                obj.push(response[i]);
            }
            this.setState({ customer: obj });
            }
        }).catch(err=>{console.log(err)
                return
        })
    }

    carrier() {
        let url = "https://t1-backend-dev.herokuapp.com/carrier";
        fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.error) {
            alert(response.error);
            return;
            } else {
            let obj = [];
            for (let i = 0; i < response.length; i++) {
                obj.push(response[i]);
            }
            this.setState({ carrier: obj });
            }
        }).catch(err=>{console.log(err)
            return
        })
    }

    componentDidMount() {
        let self = this;
        self.fetchLoadDetails()
        this.customer();
        this.carrier();
        self.setState({ foreign_load_id: this.props.match.params.id })
    }
    componentWillUnmount() {}

    ModalControl() {
        this.setState(
        {
            lgShow: false,
            edit_head: false,    
            maplatlng: [40.7128, -74.006],
            LocationName: "",
            formSchedule_date: "",
            formSchedule_time: "",
            TimeZoneModal:"",
            TimeZoneReturn:'',
        },
        () => {
            this.setState({ Options: "" });
        }
        );
    
    }
    shouldComponentUpdate() {
        return true;
    }

    innerSubmit(event) {
        let arr = this.state.stops;
        event.preventDefault();
        if (this.state.LocationName == "") {
        document.getElementById("modal").style.display = "block";
        document.getElementById("modal").innerHTML =
            '<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>Address field</strong> cannot be empty.</div>';
        setTimeout(() => {
            const timeout = document.getElementById("modal");
            timeout.style.display = "none";
        }, 2000);
        return;
        }
        if (this.state.edit_head == false) {
        arr.push({
            id: unique_id++,
            stop_type: this.state.Options,
            location_name: this.state.LocationName,
            location_lat: this.state.LocationUpdate_LAT,
            location_lng: this.state.LocationUpdate_LNG,
            schedule:this.state.formSchedule_date + "T" + this.state.formSchedule_time,
            city: this.state.LocationUpdate_city,
            state: this.state.LocationUpdate_state,
            county: this.state.LocationUpdate_county,
            country: this.state.LocationUpdate_country,
            country_code: this.state.LocationUpdate_country_code,
            schedule_date: this.state.formSchedule_date,
            schedule_time: this.state.formSchedule_time,
            timezone:this.state.TimeZoneReturn,
            timezone_abbr:this.state.TimeZoneModal,
        });
        this.setState({ stops: arr }, () => this.ModalControl());
        }
        if (this.state.edit_head == true) {
        arr[this.state.stop_index].schedule_date = this.state.formSchedule_date;
        arr[this.state.stop_index].schedule_time = this.state.formSchedule_time;
        arr[this.state.stop_index].stop_type = this.state.Options;
        arr[this.state.stop_index].location_name = this.state.LocationName;
        arr[this.state.stop_index].city = this.state.LocationUpdate_city;
        arr[this.state.stop_index].state = this.state.LocationUpdate_state;
        arr[this.state.stop_index].schedule =this.state.formSchedule_date + "T" + this.state.formSchedule_time;
        arr[this.state.stop_index].location_lat = this.state.LocationUpdate_LAT;
        arr[this.state.stop_index].location_lng = this.state.LocationUpdate_LNG;
        arr[this.state.stop_index].timezone = this.state.TimeZoneReturn;
        arr[this.state.stop_index].timezone_abbr = this.state.TimeZoneModal;
        this.setState({ stops: arr });
        this.setState({ stops: arr }, () => this.ModalControl());
        }
    }
    
    Delete(e, ind) {
        if (ind !== -1) {
        let arr = this.state.stops;
        arr.splice(ind, 1);
        this.setState({ stops: arr });
        }
    }

    submit() {
        this.setState({ isMapLoad: true, lgShow: true }, () =>
        setTimeout(() => {
            this.setState({
            isMapLoad: false,
            });
            if(document.getElementsByName("SearchInput")[0]){
            document.getElementsByName("SearchInput")[0].setAttribute("id", "map_search");
            if (document.getElementsByClassName("search-control-close-button")[0]) {
                document.getElementsByClassName("search-control-close-button")[0].setAttribute('type', 'button')
            }
            }
        
        }, 1000));  
    }

    editState(index) {
        let date_time =  this.state.stops[index].schedule.split('T')
        let arr = this.state.stops;
        let maplatlng = [arr[index].location_lat, arr[index].location_lng];
        let editname = arr[index].location_name;
        this.setState(
        {
            LocationUpdate_LAT:arr[index].location_lat,
            LocationUpdate_LNG:arr[index].location_lng,
            editname :arr[index].location_name,
            edit_head: true,
            Options: arr[index].stop_type,
            isMapLoad: true,
            mapLATLNG: maplatlng,
            LocationName: editname,
            formSchedule_date: moment(date_time[0]).format("MM-DD-YYYY"),
            formSchedule_time: arr[index].schedule_time,
            stop_index: index,
            TimeZoneReturn:arr[index].timezone,
            TimeZoneModal:arr[index].timezone_abbr,
            LocationUpdate_city:arr[index].city,
            LocationUpdate_state:arr[index].state,
        },
        () => {
            this.setState({
            lgShow: true,
            });
            this.loadMap(index);
        }
        );
    }

        loadMap(index) {
        let arr = this.state.stops;
        setTimeout(() => {
        this.setState({
            isMapLoad: false,
        });                                                      
        document
            .getElementsByName("SearchInput")[0]
            .setAttribute("id", "map_search");
        document.getElementById("map_search").value = arr[index].location_name;
        if (document.getElementById("map_search").value !== '') {
            if (document.getElementsByClassName("search-control-close-button")[0]) {
                document.getElementsByClassName("search-control-close-button")[0].setAttribute('type', 'button')
            }
        }
        }, 1000);
    }
    // phone nuber length validation
    phoneNumber_length(e) {
        let num = e;
        let number =  num.replace(/\s/g,"")
        number =  number.replace(/[()-]/g,"")
        let num_length = number.length;
        this.setState({d_phone:number})
        if (num_length < 12) {
        this.setState({ success: "" });
        }
        if (num_length == 12 || num_length > 12) {
        this.check_driver_phone_API(number);
        } else {
        return;
        }
    }

    dateFormatter(e) {
        console.log(a); /* entered date */
        this.setState({ time });
        let a = moment(e).format("MM-DD-YYYY");
        this.setState({ formSchedule_date: a });
    }

    handleOnDragEnd(result) {
        if (!result.destination) return;
        let stops = Array.from(this.state.stops);
        const [reorderedItem] = stops.splice(result.source.index, 1);
        stops.splice(result.destination.index, 0, reorderedItem);
        this.setState({ stops });
    }

    handleNumberChange(telNumber, selectedCountry) {
        console.log('input changed. number: ', telNumber, 'selected country: ', selectedCountry);
        this.phoneNumber_length(telNumber)
    }

    render() {
        let {
        lgShow,
        mapLATLNG,
        edit_head,
        d_phone,
        label_class,
        LocationName,
        formSchedule,
        stops,
        } = this.state;
        let stop_list =                               
        <DragDropContext onDragEnd={this.handleOnDragEnd}>
        <Droppable droppableId="stops">
        {(provided) => (
            <div
            className="stops"
            {...provided.droppableProps}
            ref={provided.innerRef}
            >
            {stops.map((element, index) => {
                return (
                <Draggable
                    key={element.id}
                    draggableId={element.id.toString()}
                    index={index}               
                >
                    {(provided) => (
                    <div                                 
                        key={index}
                        className="row ml-2 mt-2 box loads_div"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <div className="col-md-1 m-auto">
                        <p className="sequance">
                            {index + 1}
                        </p>
                        </div>
                        <div className="col-md-3">
                        <p className="table_th p-2 font-weight-bold text-capitalize text-center"
                        style={{fontSize:"small"}}
                        >
                            {element.stop_type.toLowerCase()}
                        </p>
                        </div>
                        <div className="col-md-7">
                        <div className="row">
                            <div className="col-md-7 m-auto">
                            <p className="locationName" style={{fontSize:"small",margin:"auto",textAlign:"center"}}>
                                {element.location_name}
                            </p>
                            </div>
                            <div className="col-md-5">
                            <p style={{fontSize:"small",margin:"auto",textAlign:"center"}}>
                            {element.schedule_date +" "+ moment(element.schedule).format("hh:mm A") +" "+ element.timezone_abbr}
                            </p>
                            </div>
                        </div>
                        </div>
                        <div
                        className="col-md-1 p-0"
                        style={{ cursor: "pointer" }}
                        >
                        <p style={{textAlign:"center"}}>
                            <i
                            className="fa fa-trash m-1"
                            aria-hidden="true"
                            onClick={() =>
                                this.Delete(
                                element,
                                index
                                )                           
                            }
                            style={{color:"indianred"}}
                            ></i>
                            <i
                            className="fa fa-edit m-1"
                            aria-hidden="true"
                            onClick={() =>
                                this.setState(
                                { interIndex: index },
                                this.editState(index)
                                )
                            }
                            style={{color:"blue"}}
                            ></i>
                        </p>
                        </div>
                    </div>
                    )}
                </Draggable>
                );
            })}
            {provided.placeholder}
            </div>
        )}
        </Droppable>
        </DragDropContext>
        if (!this.state.isLogin) {
        return <Redirect to={{ pathname: "/" }} />;
        }
        else
        return (
        <>    
            <div className="main-content">
            <Header />
            <Container className="mt--7" fluid style={{ padding: "" }}>
                <Row>
                <div className="col-lg-12 container">
                    <Card className="shadow">
                    <CardHeader>
                        <div className="row">
                        <div className="col-md-9">
                            <h2 className="mb-0">
                            <b> Edit Load</b>{" "}
                            <i className="fas fa-file text-blue"></i>
                            </h2>
                            {this.state.ApiError === true ? <div class="col-md-6 alert alert-danger" style={{marginTop:"10px"}} role="alert">
                                Something went wrong !
                                </div>:''}
                        </div>
                        <div className="col-md-3">
                            <label>
                            <b>External Load Number</b>
                            </label>
                            <input
                            required
                            className="form-control form_creat_interface form_creat_interface"
                            value={this.state.load_id_response}
                            disabled
                            />
                        </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                    {                       
                    this.state.screen_loading === true ? <div class="text-center"> 
                    < div className = "spinner-grow text-primary m-2" role = "status" > <span class="sr-only"> Loading ...</span> </div>
                    < div className = "spinner-grow text-primary m-2" role = "status" > <span class="sr-only"> Loading ...</span> </div>
                    < div className = "spinner-grow text-primary m-2" role = "status" > <span class="sr-only"> Loading ...</span> </div>
                    </div >:
                    this.state.submit_loading === true ? <LoaderComponent show={true}></LoaderComponent> :                   
                        <form onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-2">
                            <div className="card">
                                <div className="card-header add_info p-2 ">
                                <h2
                                    className="text-white mt-2"
                                    style={{ fontSize: "14px" }}
                                >
                                    Load Details
                                </h2>
                                </div>
                                {/* left cols */}
                                <div className="row p-2">
                                <div className="form-group col-md-6">                                
                                    <label htmlFor="carrierid font-weight-bold">
                                    <b>Carrier</b>
                                    </label>
                                    <select
                                    required
                                    className="form-control form_creat_interface form_creat_interface"
                                    onChange={(event) =>
                                        this.setState({
                                        formController: event.target.value,
                                        })
                                    }
                                    >
                                    <option value={this.state.formController}>
                                        {this.state.formControllerValue}
                                    </option>
                                    {this.state.carrier
                                        .filter(
                                        (item) =>
                                            item.name !==
                                            this.state.formControllerValue
                                        )
                                        .map((element, index) => (
                                        <option value={element.id} key={index}>
                                            {element.name}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group col-md-6">
                                    <label htmlFor="fromlocation font-weight-bold">
                                    <b>Shipper</b>
                                    </label>
                                    <select
                                    required
                                    className="form-control form_creat_interface form_creat_interface"
                                    onChange={(event) =>
                                        this.setState(
                                        {
                                            formShipper: event.target.value,
                                        })
                                    }
                                    >
                                    <option value={this.state.formShipper}>
                                        {this.state.formShipperValue}
                                    </option>
                                    {this.state.customer
                                        .filter(
                                        (item) =>
                                            item.name !==
                                            this.state.formShipperValue
                                        )
                                        .map((element, index) => (
                                        <option value={element.id} key={index}>
                                            {element.name}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                                </div>
                                <div className="row p-2">
                                <div className="form-group col-md-6">
                                    <label htmlFor="tolocation font-weight-bold">
                                    <b>Priority</b>
                                    </label>
                                    <select
                                    required
                                    type="text"
                                    className="form-control form_creat_interface form_creat_interface"
                                    id="tolocation"
                                    onChange={(event) =>
                                        this.setState({
                                        formPriority: event.target.value,
                                        })
                                    }
                                    value={
                                        this.state.formPriority == "null"
                                        ? ""
                                        : this.state.formPriority
                                    }
                                    placeholder="Priority"
                                    >
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="HOT">Hot</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-6">
                                    <label htmlFor="inputEmail4 font-weight-bold">
                                    <b> Status </b>
                                    </label>
                                    <input
                                    required
                                    type="text"
                                    className="form-control form_creat_interface form_creat_interface text-capitalize"
                                    id="status"
                                    placeholder="Status"
                                    onChange={(e)=>{this.setState({formStatus:e.target.value})}}
                                    value={this.state.formStatus.replace(/_/g,' ').toLowerCase()}
                                    disabled
                                    />
                                </div>
                                </div>
                                <div className="row p-2">
                                <div className="form-group col-md-12">
                                    <label>
                                    <b>Tracking Mode</b>
                                    </label>
                                    <br />
                                    <select
                                    required
                                    className="form-control form_creat_interface form_creat_interface"
                                    onChange={(event) => {
                                        this.setState({
                                        formTrackingmode: event.target.value,
                                        });
                                    }}
                                    value={this.state.formTrackingmode}
                                    disabled
                                    >
                                    <option value="MANUAL">Manual</option>
                                    <option value="AUTOMATIC">Automatic</option>
                                    <option value="ESTIMATED">Estimated</option>
                                    <option value="ESTIMATED STAY IN PLACE">
                                        Estimated Stay In Place
                                    </option>
                                    </select>
                                </div>
                                {/* description */}
                                </div>
                                <div className="row p-2">
                                <div className="col-md-12">
                                    <label htmlFor="exampleFormControlTextarea4 font-weight-bold">
                                    <b>Description</b>
                                    </label>
                                    <textarea
                                    onChange={(event) => {
                                        this.setState({
                                        formDescription: event.target.value,
                                        });
                                    }}
                                    type="text"
                                    id="exampleFormControlTextarea4"
                                    className="form-control form_creat_interface form_creat_interface"
                                    rows="5"
                                    value={this.state.formDescription}
                                    placeholder="Enter load description (optional)."
                                    ></textarea>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="col-md-6 mb-3">
                            <div className="card">
                                <div className="card-header  p-2 add_info ">
                                <div className="row">
                                    <div className="col-md-6 float-left">
                                    <h2
                                        className="text-white mt-2"
                                        style={{ fontSize: "14px" }}
                                    >
                                        Load Stops
                                    </h2>
                                    </div>
                                </div>
                                </div>
                                <div className="card-body pl-0">
                                {stop_list}
                                </div>
                                <div
                                style={{ margin: "auto" }}
                                className="mt--3 mb-2 plus_font"
                                >
                                <i
                                    className="fa fa-plus"
                                    onClick={this.submit.bind(this)}
                                />
                                </div>
                            </div>
                            <div className=" card mt-2">
                                <div className="card-header  p-2 add_info ">
                                <h2
                                    className="text-white mt-2"
                                    style={{ fontSize: "14px" }}
                                >
                                    Driver Information
                                </h2>
                                </div>
                                <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                    <label>
                                        <b>Phone</b>
                                    </label>
                                    <div>
                                        <ReactTelInput
                                        listStyle={{
                                            zIndex: 20,
                                            backgroundColor: "white",
                                        }}
                                        style={{ height: "45px" }}
                                        flagsImagePath={
                                            "https://raw.githubusercontent.com/mukeshsoni/react-telephone-input/master/example/src/flags.png"
                                        }
                                        onChange={this.handleNumberChange}
                                        initialValue="+1"
                                        defaultCountry="us"
                                        inputProps={{
                                            value: this.state.d_phone,
                                            autoFocus: false,
                                            className:
                                            "form-control form_creat_interface form_creat_interface country_input",
                                        }}
                                        />
                                    </div>
                                    <label
                                        style={{
                                        color: label_class,
                                        fontSize: "11px",
                                        }}
                                    >
                                        {this.state.success != "" && d_phone != ""
                                        ? this.state.success
                                        : ""}
                                    </label>
                                    </div>
                                    <div className="col-md-6">
                                    <label>
                                        <b>Full Name</b>
                                    </label>
                                    <input
                                        className="form-control form_creat_interface form_creat_interface"
                                        style={{ width: "100%" }}
                                        id="1"
                                        type="text"
                                        placeholder="Full Name"
                                        onChange={(event) => {
                                        this.setState({
                                            d_name: event.target.value,
                                        });
                                        }}
                                        value={this.state.d_name}
                                    />
                                    </div>
                                </div>
                                {/* 2 */}
                                <div className="row pt-2">
                                    <div className="col-md-12">
                                    <label>
                                        <b>Email</b>
                                    </label>
                                    <input
                                        className="form-control form_creat_interface form_creat_interface"
                                        style={{ width: "100%" }}
                                        id="1"
                                        type="email"
                                        placeholder="Email"
                                        value={this.state.d_email}
                                        onChange={(event) => {
                                        this.setState({
                                            d_email: event.target.value,
                                        });
                                        }}
                                    />
                                    </div>
                                </div>
                                {/* 3 */}
                                </div>
                            </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            id="submit_buton"
                            className="btn btn-primary float-right submit"
                        >
                            Submit                       
                        </button>
                        </form>}
                    </CardBody>
                    </Card>
                </div>
                </Row>
            </Container>
            </div>
            {/* MODAL UI */}
            <Modal
            size="lg"
            show={lgShow}
            onHide={() =>
                this.setState({
                lgShow: false,
                edit_head: false,
                mapLATLNG: [40.7128, -74.006],
                Options: "",
                LocationName: "",
                formSchedule_date: "",
                formSchedule_time: "",
                TimeZoneModal:'',
                TimeZoneReturn:'',
                })
            }
            aria-labelledby="example-modal-sizes-title-lg"
            >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                {edit_head == true ? (
                    <h2>
                    Edit Load Stop <i className="fa fa-edit" />
                    </h2>
                ) : (
                    <h3>Create Load Stop</h3>
                )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={this.innerSubmit}>
                <div className="row p-3">
                    <div className="col-md-4">
                    <label className="font-weight-bold">Type</label>
                    <select
                        required
                        className="form-control"
                        placeholder="Status"
                        onChange={(event) =>
                        this.optionController(event.target.value)
                        }
                        value={this.state.Options}
                    >
                        <option value="">Select Type</option>
                        <option value="PICKUP">Pickup Stop</option>
                        <option value="DELIVERY">Delivery Stop</option>
                        <option value="INTERMEDIARY">Intermediary Stop</option>
                    </select>
                    </div>
                    <div className="col-md-8">
                    <div className="row">
                        <div class="form-group col-md-5">
                        <label className="font-weight-bold">Schedule Date</label>
                        <input
                            required
                            className="form-control"
                            style={{ " borderRightStyle": "none" }}
                            type="date"
                            onChange={(e) => {
                            this.setState({ formSchedule_date: e.target.value });                        }}
                            value={this.state.formSchedule_date}
                        />
                        </div>
                        <div class="form-group col-md-4">
                        <label className="font-weight-bold">Schedule Time</label>
                        <input                       
                            required
                            id="abc"
                            className="form-control"
                            style={{ " borderLeftStyle": "none" }}
                            type="time"
                            max="9999-24-24T00:00:00.00"
                            onChange={(e) => {
                            this.setState({ formSchedule_time: e.target.value });
                            }}
                            value={this.state.formSchedule_time}
                        />
                        </div>
                        <div className="form-group col-md-3">
                        <label className="font-weight-bold">Timezone</label>
                        <input  
                            disabled 
                            placeholder="Timezone"                  
                            className="form-control"
                            style={{ " borderLeftStyle": "none" }}
                            max="9999-24-24T00:00:00.00" 
                            value={this.state.TimeZoneModal.replace(/_/g,' ')}                     
                        />
                        {this.state.timezone_loading === true ?<div class="spinner-border spinner-border-sm" role="status">
                                <span class="sr-only">Loading...</span>
                                </div> :''}
                        </div>
                    </div>
                    </div>
                </div>
                <div id="modal"></div>
                <div className="m-2">
                    {this.state.isMapLoad == false ? (
                    <MapComponent
                        location_name=""
                        startPoint={[0, 0]}
                        endPoint={[0, 0]}
                        currentPoint={mapLATLNG}
                        getName={this.getLocationName}
                        search={true}
                    />
                    ) : (
                    <div class="d-flex justify-content-center m-5">
                            <div class="spinner-grow text-primary" role="status">
                                <span class="visually-hidden"></span>
                            </div>
                        </div>
                    )}
                </div>
                {this.state.Options != "" ? (
                    <div className="mt-2">
                    <Button type="submit" className="innersubmit ml-2 pt-2 pb-2 btn btn-primary float-right mr-2">
                        Submit
                    </Button>
                    </div>
                ) : (
                    <div></div>
                )}
                </form>
            </Modal.Body>
            </Modal>
        </>
        );
    }
}
export default withRouter(EditNewLoads);
