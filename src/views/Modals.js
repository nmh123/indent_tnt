import React, { Component} from "react";
import MapComponent from "../components/map/MapComponent";
import time_arr from "./TimeZones";
import {Button} from "reactstrap";
import Modal from 'react-bootstrap/Modal';
import config from "../app_config";

export default class Example extends Component {
    constructor(props) {
    super(props);
    this.state = {
    smShow: false,
    lgShow: false,
    Options: '',
    Update_time: '',
    LocationUpdate_comment: '',
    CallSuccessful_time: '',
    CallSuccessful_notes: '',
    CallAttempted_time: '',
    CarrierEmailed_time: '',
    PickUp_status_arrived: '',
    Accepted_time: '',
    LocationUpdate_LAT: '',
    LocationUpdate_LNG: '',
    PickUp_status_departed: '',
    TimeZone: '',
    LocationName: '',
    currentPoint: this.props.currentPoint,
    userComments:'',
    }
    this.getLocationName = this.getLocationName.bind(this);
    console.log("Experiment", this.state.LocationName)
    console.log("currentPoint", this.props.currentPoint)
    //const searchComponent = (props) => <ReactLeafletSearch position="topleft" />;
}

    optionController(option) {
        this.setState({
        Options: option
        })
    }
    setPickupStatus(status) {
        this.setState({
        PickUp_status: status
        })
    }
    setTimeZone(status) {
        this.setState({
        TimeZone: status
        })
        console.log(status)
        console.log(this.state.Update_time)
    }

    getLocationName = (name, lati_long) => {
        this.setState({
        LocationName: name,
        LocationUpdate_LAT: lati_long.lat.toString(),
        LocationUpdate_LNG: lati_long.lng.toString(),
        })
    }

    async load_Event_API() {
        let api_data = {};
        if (this.state.Options === "LOCATION_UPDATE") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,
            "locationName": this.state.LocationName,
            "latitude": this.state.LocationUpdate_LAT,
            "longitude": this.state.LocationUpdate_LNG,
            "comments": this.state.LocationUpdate_comment,
        };
        } else if (this.state.Options === "CALL_SUCCESSFUL") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,
            "comments": this.state.LocationUpdate_comment,
        }
        } else if (this.state.Options === "CALL_ATTEMPTED" || this.state.Options === "CARRIER_EMAILED") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,
        }
        } else if (this.state.Options === "ACCEPTED") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options
        }
        }
        else if (this.state.Options === "PICK_UP_ARRIVED") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.props.Options,
            "type": this.state.PickUp_status_arrived
        }
        }
        else if(this.state.Options === "COMPLETED") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,      
            "user_comments":this.state.userComments,
        }
        }
        else if(this.state.Options === "DELIVERED") {
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,   
            "user_comments":this.state.userComments,
        }
        }
        else{
        api_data = {
            "load_id": this.props.loadId,
            "event_type": this.state.Options,      
            "user_comments":this.state.userComments,
        }
        }
        console.log('api_data', api_data)
        let url = config.APP_URL + '/status/update/load/event'
        console.log('url: ', url)
        let token = await localStorage.getItem('authLogin')
        this.setState({
        lgShow: false
        })
        fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body:
            JSON.stringify(api_data)
        })
        .then(res => res.json())
        .then((response) => {
            if (response.error) {
            alert(response.error)
            return;
            }
            else {
            this.setState({
                Options: '',
            }, () => this.props.dataload(), this.props.datastatus(), alert(response.success))
            }
            console.log("auth_response", response)
        }).catch(err=>{alert("Something went wrong.")});
        this.stateFormatter();
    }
    stateFormatter(){
    this.setState({
        lgShow: false, Options: '', Update_time: '',
        LocationUpdate_comment: '',
        CallSuccessful_time: '',
        CallSuccessful_notes: '',
        CallAttempted_time: '',
        CarrierEmailed_time: '',
        PickUp_status_arrived: '',
        Accepted_time: '',
        LocationUpdate_LAT: '',
        LocationUpdate_LNG: '',
        PickUp_status_departed: '',
        TimeZone: '',
        LocationName: ''
    })
    }

    render() {
        let dta = []
        for (let x in time_arr) {
        dta.push(<option value={time_arr[x]}>{time_arr[x]}</option>)
        }
        return (
        <>
            <Button onClick={() => this.setState({ lgShow: true })}>Add Load Event</Button>
            <Modal
            size="lg"
            show={this.state.lgShow}
            onHide={() => this.stateFormatter()}
            aria-labelledby="example-modal-sizes-title-lg"
            >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                Add Load Event
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                <div>
                    <label className="font-weight-bold">Type</label>
                    <select className="form-control" placeholder="Status" onChange={(event) => this.optionController(event.target.value)} value={this.state.optionController}>
                    <option value="">Select Type </option>
                    <option value="LOCATION_UPDATE">Location Update</option>
                    <option value="CALL_SUCCESSFUL">Phone Call Successful</option>
                    <option value="CALL_ATTEMPTED">Phone Call Attempted</option>
                    <option value="CARRIER_EMAILED">Carrier Emailed</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PICKUP_UP_ARRIVED">Pickup Arrived</option>
                    <option value="PICKUP_UP_DEPARTED">Pickup Departed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="EXPIRED">Expired</option>
                    </select>
                </div>
                {this.state.Options === "LOCATION_UPDATE" ? <div className="row">
                    <div className="column col-sm-6 fl-left">
                    <input type="text" className="mt-2 form-control" placeholder="Location Name" readOnly onChange={(event) => this.setState({ LocationName: event.target.value })} value={this.state.LocationName} />
                    <input type="text" hidden className="mt-2 form-control" placeholder="Latittude and Longitude" onChange={(event) => this.setState({ LocationUpdate_LNG: event.target.value })} value={this.state.LocationUpdate_LAT + '  ' + this.state.LocationUpdate_LNG} />
                    <textarea className="form-control mt-3" rows="4" cols="50" placeholder="Enter Comments..." onChange={(event) => this.setState({ LocationUpdate_comment: event.target.value })} value={this.state.LocationUpdate_comment}></textarea>
                    </div>
                    <div className="column col-sm-6 fl-right">
                    <div className="mt-2">
                        <MapComponent
                        startPoint={[0, 0]}
                        endPoint={[0, 0]}
                        currentPoint={this.props.currentPoint}
                        getName={this.getLocationName}
                        search={true}
                        />
                    </div>
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "CALL_SUCCESSFUL" ?
                    <div className="row">
                    <div className="column col-sm-6 fl-left">
                        <textarea className="mt-2 form-control" rows="4" cols="50" placeholder="Enter Comments..." onChange={(event) => this.setState({ LocationUpdate_comment: event.target.value })} value={this.state.LocationUpdate_comment}></textarea>
                    </div>
                    <div className="column col-sm-6 fl-right">
                    </div>
                    </div> : <div></div>
                }
                {this.state.Options === "CALL_ATTEMPTED" ? <div className="row">
                    <div className="column col-sm-6 fl-left">
                    </div>
                    <div className="column col-sm-6 fl-right">
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "CARRIER_EMAILED" ? <div className="row">
                    <div className="column col-sm-6 fl-left">
                    </div>
                    <div className="column col-sm-6 fl-right">
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "ACCEPTED" ? <div className="row">
                    <div className="column col-sm-6 fl-right">
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "PICKED UP ARRIVED" ? <div className="row">
                    <div className="column col-sm-6 fl-right">
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "PICKUP_UP_DEPARTED" ? <div className="row">
                    <div className="column col-sm-6 fl-right">
                    </div>
                </div> : <div></div>
                }
                {this.state.Options === "COMPLETED" ? <div className="row">        
                <div className="column col-sm-6 fl-right">
                <div class="form-floating">
                    <label for="floatingTextarea2 lead" className="m-1 mt-3"><b>Comments</b></label>
                    <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{height:"100px"}} onChange={(event) => this.setState({ userComments: event.target.value })} value={this.state.userComments}></textarea>               
                </div>
                </div>
                </div> : <div></div>
                }
                {this.state.Options === "DELIVERED" ? <div className="row">
                <div className="column col-sm-6 fl-right">
                <div class="form-floating">
                    <label for="floatingTextarea2 lead" className="m-1 mt-3"><b>Comments</b></label>
                    <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{height:"100px"}} onChange={(event) => this.setState({ userComments: event.target.value })} value={this.state.userComments}></textarea>             
                </div>
                </div>
                </div> : <div></div>
                }
                {this.state.Options === "EXPIRED" ? <div className="row">
                <div className="column col-sm-6 fl-right">
                <div class="form-floating">
                    <label for="floatingTextarea2 lead" className="m-1 mt-3"><b>Comments</b></label>
                    <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{height:"100px"}} onChange={(event) => this.setState({ userComments: event.target.value })} value={this.state.userComments}></textarea>               
                </div>
                </div>
                </div> : <div></div>
                }
                </div>
            </Modal.Body>
            <Modal.Footer>
                {this.state.Options !== '' ? <button className="btn btn-success" onClick={() => { this.load_Event_API() }}>Submit</button> : <></>}
            </Modal.Footer>
            </Modal>
        </>
        );
    }
}
