import React, {Component} from "react";
import {
    BrowserRouter as Router,
    Redirect
} from "react-router-dom";
import netlifyIdentity from 'netlify-identity-widget'
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Container,
    Table,
} from "reactstrap";
import moment from 'moment';
import config from "../app_config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MapComponent from "../components/map/MapComponent";
import Example from "./Modals";
import {commaSeperate} from './utilities.js';
const TZ = config.TIME_ZONE;

export default class LoadsDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogin: true,
            user: null,
            loadsdata: [],
            tracking_data: [],
            startPoint: [
                0, 0
            ],
            endPoint: [
                0, 0
            ],
            currentPoint: [
                0, 0
            ],
            pickTime: '',
            Time: '',
            NoRecordFound: false,
            tracking_mode: 'AUTOMATIC',
            load_id: null,
            manualTime: '',
            manualLocation: '',
            manualLatLng: '',
            manualComments: '',
            time: '',
            event: '',
            StopsInfo: '-',
            ExternalTracker: '-',
            DeliveryStop: '-',
            DeliveryCityState: '-',
            PickupStop: '-',
            PickupCityState: '-',
            ApiError:false
        }
        this.loadDataAPI = this.loadDataAPI.bind(this);
        this.loadTrackingData = this.loadTrackingData.bind(this);
    }

    componentDidMount() {
        let self = this;
     /*    self.setState({load_id: this.props.match.params.id})
        const user = netlifyIdentity.currentUser();
        if (! user) {
            this.setState({isLogin: false});
        } else {
            this.setState({user: user});
        }

        netlifyIdentity.on('logout', () => {
            console.log('Logged out')
            self.setState({isLogin: false});
        });
 */

        this.loadDataAPI(() => {
            this.loadTrackingData()
        })


        setInterval(() => {
            this.loadTrackingData()
        }, (1000 * 60)); // 1 min

    }

    componentWillUnmount() {
        netlifyIdentity.off('logout');
    }

    loadDataAPI(cb) {
        let self = this;
        let id = this.props.match.params.id;
        let url = config.APP_URL + "/list/detail?id=" + id;
        fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }).then(res => res.json()).then((response) => {
            console.log('json>>>>>', response)
            console.log("hello", response.status)
            let mode = response.tracking_mode;
            console.log("hello---", mode)
            self.setState({loadsdata: response, tracking_mode: mode, load_id: response.id})
            if (response.source_id && response.source_id == '1') {
                this.setState({ExternalTracker: 'Fourkites'})
            } else if (response.source_id && response.source_id == '2') {
                this.setState({ExternalTracker: 'Macropoint'})
            } else if (response.source_id && response.source_id == '4') {
                this.setState({ExternalTracker: 'TnT'})
            }
            if (response.stops && response.stops.length != 0) {
                this.setState({StopsInfo: response.stops})
                for (let i = 0; i < response.stops.length; i++) {
                    if (response.stops[i].load_stop_type == "PICKUP") {
                        let a = response.stops[i].schedule
                        if (a == null) {
                            self.setState({pickTime: 'Not Available'})
                        } else {
                            if (this.state.StopsInfo.length != 0) {
                                self.setState({
                                    pickTime: moment(a).format('MM/DD/YYYY HH:mm  ') + this.state.StopsInfo[i].timezone_abbr,
                                    PickupStop: response.stops[i].location,
                                    PickupCityState: response.stops[i].city + ", " + response.stops[i].state
                                })
                            }
                        }
                    } else if (response.stops[i].load_stop_type == "DELIVERY") {
                        let a = response.stops[i].schedule
                        if (a == null) {
                            self.setState({deliverTime: 'Not Available'})
                        } else if (this.state.StopsInfo.length > 0) {
                            self.setState({
                                deliverTime: moment(a).format('MM/DD/YYYY HH:mm  ') + this.state.StopsInfo[i].timezone_abbr,
                                DeliveryStop: response.stops[i].location,
                                DeliveryCityState: response.stops[i].city + ", " + response.stops[i].state
                            })
                        }
                    }
                }
                self.setState({
                    endPoint: [
                        parseFloat(this.state.StopsInfo[this.state.StopsInfo.length - 1].lat),
                        parseFloat(this.state.StopsInfo[this.state.StopsInfo.length - 1].long)
                    ],
                    startPoint: [
                        parseFloat(this.state.StopsInfo[0].lat),
                        parseFloat(this.state.StopsInfo[0].long)
                    ]
                }, () => {
                    if (cb) 
                        cb();
                })
            }
        }, (error) => {
            console.log(error)
        }).catch(err=>{           
            this.setState({ApiError:true})   
        });
    }

    loadTrackingData() {
        let self = this;
        let url = config.APP_URL + "/tracking/load/events";
        let item = {
            'load_id': this.props.match.params.id
        };
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(item)
        }).then(res => res.json()).then((response) => {
            console.log('json nmh', response);
            // return
            let data = [];
            let obj = {};
            // data.push(result);
            if (response.length === 0) {
                this.setState({NoRecordFound: true, currentPoint: this.state.startPoint})
                return
            } else {
                console.log("response", response)
                for (let row of response) {
                    obj = {
                        date: row.updated_time,
                        address: row.location,
                        timezone: row.time_zone,
                        event_type: row.load_event_type,
                        comments: row.status,
                        event_sub_type: row.load_event_sub_type
                    }
                    let testDate = obj.date;
                    let newDate = moment(testDate).format('MM/DD/YYYY HH:mm ');

                    obj.date = newDate + row.time_zone_abbr
                    if (obj.date == null) {
                        obj.date = ''
                    } else if (obj.address == null) {
                        obj.address = ""
                    } else if (obj.time_zone == null) {
                        obj.time_zone = ''
                    } else if (obj.event_type == null) {
                        obj.event_type = ''
                    }
                    data.push(obj);
                }
                if (response[0].latitude != null) {
                    self.setState({
                        tracking_data: data,
                        currentPoint: [
                            parseFloat(response[0].latitude),
                            parseFloat(response[0].longitude)
                        ]
                    })
                } else {
                    self.setState({tracking_data: data, currentPoint: this.state.startPoint})
                }
                console.log("current point", self.state.currentPoint)
                console.log("start", this.state.startPoint)
                console.log("end", this.state.endPoint)
            }
        }, (error) => {
            console.log(error)
        }).catch(err=>{           
            this.setState({ApiError:true})   
        });
    }

    async update_tracking_modes(mode) {
        let url = config.APP_URL + '/update/tracking/mode'
        console.log('url: ', url)
        let token = await localStorage.getItem('authLogin')
        console.log('this.state.tracking_mode', mode)
        this.setState({tracking_mode: mode})
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(
                {"tracking_mode": mode, "load_id": this.state.load_id}
            )
        }).then(res => res.json()).then((response) => {
            if (response.error) {
                alert(response.error)
                return;
            }
            console.log("auth_response", response)
        }).catch(err=>{           
            this.setState({ApiError:true})   
        });
    }

    render() {
        if (this.state.render == '-') {
            this.loadDataAPI();
        }
        if (!this.state.isLogin) {
            return (
                <Redirect to={
                    {pathname: "/"}
                }/>
            )
        }
        let risk = [];
        let risk_status = ""
        if (this.state.loadsdata.status) {
            risk_status = this.state.loadsdata.risk ? this.state.loadsdata.risk.toLowerCase().replace(/_/g, ' ') : '';
            if (this.state.loadsdata.risk == 'HIGH') {
                risk.push (
                    <td className="bg-danger text-white ">
                        {risk_status}</td>
                );
            } else if (this.state.loadsdata.risk == 'MEDIUM') {
                risk.push (
                    <td className="bg-yellow text-white text-capitalize">
                        {risk_status}</td>
                );
            } else {
                risk.push (
                    <td className="shadow p-1 pr-4 pl-4 mb-5 bg-white rounded">
                        {risk_status}</td>
                );
            }
        }
        let tracking_data = this.state.tracking_data.map((loaddata, index) => {
            let address = loaddata.address ? loaddata.address.replace(/_/g, ' ') : '';
            let check_address = loaddata.address ? loaddata.address.replace(/_/g, ' ').split(',') : '';
            let address1 = check_address[0] && check_address[1] ? check_address[0] + ', ' + check_address[1].toUpperCase() : '';
            if (check_address && check_address.length == 2) {
                address = address1
            } else {
                address = address
            }
            let event_sub_type = loaddata.event_sub_type ? loaddata.event_sub_type.toLowerCase().replace(/_/g, ' ') : '';
            return (
                <tr key={index}>
                    <td> {
                        loaddata.date
                    } </td>
                    <td className="text-capitalize">
                        {
                        event_sub_type ? event_sub_type : ''
                    }
                        <b className="text-success">
                            {
                            event_sub_type == '' ? '' : address ? ' ; ' : loaddata.comments ? ' ; ' : ''
                        }</b>
                        {
                        address ? address : loaddata.comments ? loaddata.comments : ''
                    }</td>
                    <td className="text-capitalize">
                        {
                    loaddata.event_type ? loaddata.event_type.toLowerCase().replace(/_/g, ' ') :''
                    }</td>
                </tr>
            )
        })
        let manual_data = this.state.tracking_data.map((loaddata, index) => {
            return (
                <tr key={index}>
                    <td className="">
                        {
                        this.state.loadsdata.status ? this.state.loadsdata.status.toLowerCase().replace(/_/g, ' ') : ''
                    }</td>
                </tr>
            )
        })

        return (
            <>
                <div className="main-content">
                    <Header/>

                    <div className="mt--9 container-fluid">
                        <Card className="mt-4"
                            style={
                                {overFlow: "hidden"}
                        }>
                            <CardHeader className="float-left">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h3>Load Details</h3>
                                    </div>
                                    {
                                    this.state.ExternalTracker != '' && this.state.ExternalTracker == 'TnT' ? <div className="col-md-6">
                                        <Button className="btn btn-success float-right" type="button"
                                            onClick={
                                                (e) => this.props.history.push("/edit-loads/" + this.state.load_id)
                                        }>
                                            Edit
                                        </Button>
                                    </div> : <></>
                                } </div>
                            </CardHeader>
                            <div className="row">
                                <div className="col-sm-5">
                                    <table className="table align-items-center table-sm">
                                        <tr>
                                            <th>External Tracker :</th>
                                            <td>{
                                                this.state.ExternalTracker
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th>External Load Number:</th>
                                            <td> {
                                                this.state.loadsdata.order_number ? this.state.loadsdata.order_number : "-"
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Load Number:</th>
                                            <td> {
                                                this.state.loadsdata.uuid ? this.state.loadsdata.uuid : "-"
                                            } </td>
                                        </tr>
                                        <tr className="text-capitalize">
                                            <th>Status:</th>
                                            <td className="text-capitalize">
                                                {
                                                this.state.loadsdata.status ? this.state.loadsdata.status.toLowerCase().replace(/_/g, " ") : ""
                                            } </td>
                                        </tr>
                                        <tr className="text-capitalize">
                                            <th className="text-capitalize">Priority:</th>
                                            <td className="text-capitalize">
                                                {
                                                this.state.loadsdata.status ? this.state.loadsdata.priority.toLowerCase().replace("_", " ") : ""
                                            } </td>
                                        </tr>
                                        <tr className="text-capitalize">
                                            <th className="text-capitalize">At Risk:</th>
                                            <td className="text-capitalize">
                                                {
                                                risk ? risk : "-"
                                            }</td>
                                        </tr>
                                        <tr className="text-capitalize">
                                            <th className="text-capitalize">Tracking Mode:
                                            </th>
                                            <td>
                                                <select className="form-control mt-2 mb-2"
                                                    onChange={
                                                        (event) => this.update_tracking_modes(event.target.value)
                                                    }
                                                    value={
                                                        this.state.tracking_mode
                                                }>
                                                    <option value="AUTOMATIC">Automatic</option>
                                                    <option value="MANUAL">Manual</option>
                                                    <option value="ESTIMATED">Estimated</option>
                                                    <option value="ESTIMATED_STAY_IN_PLACE">
                                                        Estimated Stay In Place
                                                    </option>
                                                </select>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="col-sm-3">
                                    <table className="table align-items-center table-sm">
                                        <tr>
                                            <th>Shipper:</th>
                                            <td> {
                                                this.state.loadsdata.shipper ? this.state.loadsdata.shipper : "-"
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Carrier:</th>
                                            <td> {
                                                this.state.loadsdata.carrier ? this.state.loadsdata.carrier : "-"
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Driver Phone:</th>
                                            <td> {
                                                this.state.loadsdata.phone_number ? this.state.loadsdata.phone_number : "-"
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>No. Of Stops:</th>
                                            <td> {
                                                this.state.loadsdata.total_stops ? this.state.loadsdata.total_stops : ""
                                            } </td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="col-sm-4">
                                    <table className="table align-items-center table-sm ">
                                        <tr>
                                            <th>Pickup Stop:</th>
                                            <td className="text-capitalize"
                                                style={
                                                    {whiteSpace: "initial"}
                                            }>
                                                {
                                                this.state.PickupStop.toLowerCase().replace(/_/g, " ")
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Pickup City State:
                                            </th>
                                            <td className="text-capitalize"
                                                style={
                                                    {whiteSpace: "initial"}
                                            }>
                                                {
                                                commaSeperate(this.state.PickupCityState ? this.state.PickupCityState.replace(/_/g, " ") : "-")
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Pickup Date Time:</th>
                                            <td style={
                                                {whiteSpace: "initial"}
                                            }>
                                                {
                                                this.state.pickTime ? this.state.pickTime : "-"
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Delivery Stop:</th>
                                            <td style={
                                                    {whiteSpace: "initial"}
                                                }
                                                className="text-capitalize">
                                                {
                                                this.state.DeliveryStop.toLowerCase().replace(/_/g, " ")
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Delivery City State:</th>
                                            <td style={
                                                    {whiteSpace: "initial"}
                                                }
                                                className="text-capitalize">
                                                {
                                                commaSeperate(this.state.DeliveryCityState ? this.state.DeliveryCityState.replace(/_/g, " ") : "-")
                                            } </td>
                                        </tr>
                                        <tr>
                                            <th>Delivery Date Time:</th>
                                            <td style={
                                                {whiteSpace: "initial"}
                                            }>
                                                {
                                                this.state.deliverTime ? this.state.deliverTime : "-"
                                            } </td>
                                        </tr>
                                    </table>
                                    {
                                    this.state.tracking_mode == "MANUAL" ? (
                                        <div className="mt-6 mb-2 mr-4 float-right">
                                            <Example className="mt-4"
                                                loadId={
                                                    this.state.load_id
                                                }
                                                currentPoint={
                                                    this.state.currentPoint
                                                }
                                                dataload={
                                                    this.loadTrackingData
                                                }
                                                datastatus={
                                                    this.loadDataAPI
                                                }/>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )
                                } </div>
                            </div>
                        </Card>
                        <hr className="rounded"/>
                        <Card>
                            <CardHeader>
                                <h3>Tracking Details</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="table-responsive"
                                            style={
                                                {maxHeight: 420}
                                        }>
                                            <Table className="align-items-center table-bordered " responsive>
                                                {
                                                tracking_data != "" ? (
                                                    <thead className="text-lg text-bold align-items-center text-center thead-light ">
                                                        <tr className="text-center">
                                                            <th>Date</th>
                                                            <th>Information</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                ) : (
                                                    <></>
                                                )
                                            }
                                                <tbody className="text-center">
                                                    {
                                                    tracking_data != "" ? (tracking_data) : (
                                                        <div>No Records Found</div>
                                                    )
                                                } </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        {
                                        this.state.startPoint[0] != 0 && this.state.endPoint[0] != 0 && this.state.currentPoint[0] != 0 ? (
                                            <MapComponent startPoint={
                                                    this.state.startPoint
                                                }
                                                endPoint={
                                                    this.state.endPoint
                                                }
                                                currentPoint={
                                                    this.state.currentPoint
                                                }
                                                search={false}
                                                style={
                                                    {boxShadow: "0px 0px 12px 0px"}
                                            }></MapComponent>
                                        ) : (
                                            <div>
                                                <MapComponent startPoint={
                                                        [40.7128, -74.006]
                                                    }
                                                    endPoint={
                                                        [40.7128, -74.006]
                                                    }
                                                    currentPoint={
                                                        [40.7128, -74.006]
                                                    }
                                                    search={false}
                                                    style={
                                                        {boxShadow: "0px 0px 12px 0px"}
                                                }></MapComponent>
                                            </div>
                                        )
                                    } </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                <Container fluid>
                        <Footer/>
                    </Container>
                </div>
            </>
        );
    }
}

