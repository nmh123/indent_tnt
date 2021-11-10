
import React, { Component} from "react";
import 
{
    BrowserRouter as Router,
    Redirect,
} from "react-router-dom";
import netlifyIdentity from 'netlify-identity-widget'
import 
{
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

const TZ = config.TIME_ZONE;
export default class LoadsDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogin: true,
            user: null,
            loadsdata: [],
            tracking_data: [],
            startPoint: [0, 0],
            endPoint: [0, 0],
            currentPoint: [0, 0],
            pickTime: '',
            Time: '',
            NoRecordFound: false,
            Tracking_mode:'',
            load_id:null
        }
        this.loadDataAPI = this.loadDataAPI.bind(this);
        this.loadTrackingData = this.loadTrackingData.bind(this);
    }

    componentDidMount() {
        let self = this;
        
        const user = netlifyIdentity.currentUser();

        if (!user) {
            this.setState({ isLogin: false });
        } else {
            this.setState({ user: user });
        }

        netlifyIdentity.on('logout', () => {
            console.log('Logged out')
            self.setState({ isLogin: false });
        });


        this.loadDataAPI()
        this.loadTrackingData()


        setInterval(() => {
            this.loadTrackingData()
        }, (1000 * 60)); // 1 min
        
    }

    componentWillUnmount() {
        netlifyIdentity.off('logout');
    }


    loadDataAPI() {
        let self = this;
        let id = this.props.match.params.id;

        let url = config.APP_URL + "/list/detail?id=" + id;

        // console.log(url)
        fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
            .then(res => res.json())
            .then((response) => {
                
                
                self.setState({loadsdata: response})
                self.setState({Tracking_mode:response.tracking_mode})
                self.setState({load_id:response.id})
                
                

                if (response.stops.length) {
                    
                    let a = response.stops[0].schedule
                    let b = response.stops[response.stops.length - 1].schedule
                    
                        self.setState({
                            endPoint: [parseFloat(response.stops[response.stops.length - 1].lat), parseFloat(response.stops[response.stops.length - 1].long)],
                            startPoint: [parseFloat(response.stops[0].lat), parseFloat(response.stops[0].long)],


                        })
                        
                    
                    
                    

                    self.setState({
                        pickTime: moment(a).format('YYYY/MM/DD HH:mm  ') + response.stops[0].timezone_abbr,
                        deliverTime: moment(b).format('YYYY/MM/DD HH:mm  ') + response.stops[response.stops.length - 1].timezone_abbr,
                    })

                    console.log([parseFloat(response.stops[0].lat), parseFloat(response.stops[0].long)])
                    console.log([parseFloat(response.stops[response.stops.length - 1].lat), parseFloat(response.stops[response.stops.length - 1].long)])
                }
            }, (error) => {
                console.log(error)
            })

    }

    loadTrackingData () {
        let self = this;
        let url = config.APP_URL + "/tracking/load/events";

        let item = {
            'load_id': this.props.match.params.id,
        };
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(item)
        })
            .then(res => res.json())
            .then((response) => {
                console.log('json nmh', response);
                //return

                let data = [];
                let obj = {};
                //data.push(result);
                if(response.length === 0){
                    this.setState({
                        NoRecordFound:true
                    })
                    return
                }
                else{
                for (let row of response) {
                    obj = {
                        date: row.updated_time,
                        address: row.location,
                        timezone: row.time_zone
                    }
                    // console.log('timezone', obj.timezone)
                    let testDate = obj.date;
                    let newDate = moment(testDate).format('YYYY/MM/DD HH:mm ');
                    
                    obj.date = newDate + row.time_zone_abbr

                    data.push(obj);
                }
                data = data.reverse();
                //
                
                self.setState({
                    tracking_data: data,
                    currentPoint: [parseFloat(response[response.length - 1].latitude), parseFloat(response[response.length - 1].longitude)],
                })

                console.log("current point", this.currentPoint)
                }
            
            
                
                
            }, (error) => {
                console.log(error)
            })
        

    }

    async update_tracking_modes() {

        let url = config.APP_URL + '/update/tracking/mode'
        console.log('url: ', url)
        let token = await localStorage.getItem('authLogin')
        // console.log(this.state.cols[0])
        // console.log("order", this.state.sortOrder)
        // console.log("sortby", this.state.sortBy)

        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: {
                    
                    "tracking_mode": this.state.Tracking_mode,
                    "load_id": this.state.load_id
                }
        })
            .then(res => res.json())
            .then((response) => {

                if (response.error) {
                    alert(response.error)
                    return;
                }
                console.log("auth_response", response)

            });
    }

    render() {
        if (!this.state.isLogin) {
            return ( <Redirect to={{pathname: "/"}} /> )
        }
        
        

        let risk = [];
        if (this.state.loadsdata.risk) {
            if (this.state.loadsdata.risk == 'high') {
                risk.push(<td className="bg-danger text-white">{this.state.loadsdata.risk}</td>);
            } else if (this.state.loadsdata.risk == 'medium') {
                risk.push(<td className="bg-yellow text-white">{this.state.loadsdata.risk}</td>);
            } else {
                risk.push(<td className="">{this.state.loadsdata.risk}</td>);
            }
        }

        let tracking_data = this.state.tracking_data.map((loaddata, index) => {
            return (<tr key={index}>
                <td>
                    {loaddata.date}
                </td>
                <td>{loaddata.address}</td>
            </tr>)
        })

        return (
        <>
            <div className="main-content">
                
                <Header />

                <div className="mt--9 container-fluid">
                <Card className="mt-4">
                    <CardHeader><h3>Load Details</h3></CardHeader>

                    <div className="row">
                        <div className="col-sm-3">
                            <table className="table align-items-center table-sm">
                                <tr><th>Shipment:</th><td className="align-items-center">-</td></tr>
                                <tr><th>External Tracker:</th><td>Fourkites</td></tr>
                                <tr><th>External Load Number:</th><td>{this.state.loadsdata.order_number}</td></tr>
                                <tr><th>Load Number:</th><td>{this.state.loadsdata.uuid}</td></tr>
                                <tr><th>Status:</th><td>{this.state.loadsdata.status}</td></tr>
                                <tr className="text-capitalize"><th className="text-capitalize">Priority:</th><td>{this.state.loadsdata.priority}</td></tr>
                                <tr className="text-capitalize"><th className="text-capitalize">At Risk:</th>{risk}</tr>
                                <tr className="text-capitalize"><th className="text-capitalize">Tracking Mode:</th><select className="form-control mt-2 mb-2" placeholder="Status" onChange={(event) => this.setState({Tracking_mode:event.target.value},()=>this.update_tracking_modes())} value={this.state.Tracking_mode} >
                                                <option value="Automatic">Automatic</option>
                                                <option value="Estimated">Estimated</option>
                                                <option value="Manual">Manual</option>
                                                
                                            
                                            </select></tr>

                            </table>
                        </div>
                        <div className="col-sm-4">
                            <table className="table align-items-center table-sm">
                                <tr><th>Shipper:</th><td>{this.state.loadsdata.shipper}</td></tr>
                                <tr><th>Carrier:</th><td>{this.state.loadsdata.carrier}</td></tr>
                                <tr><th>Driver Phone:</th><td>{this.state.loadsdata.driver_phone}</td></tr>
                                <tr><th>No. Of Stops:</th><td>{this.state.loadsdata.total_stops}</td></tr>
                            </table>
                        </div>
                        <div className="col-sm-5" >
                            <table className="table align-items-center table-sm ">                                
                                <tr><th>Pickup Stop:</th><td style={{ whiteSpace: 'initial' }}>{(this.state.loadsdata.hasOwnProperty('stops')) ? this.state.loadsdata.stops[0].location : '-'}</td></tr>
                                <tr><th>Pickup City State: </th><td style={{ whiteSpace: 'initial' }}>{this.state.loadsdata.from_location}</td></tr>
                                <tr><th>Pickup Time:</th><td style={{ whiteSpace: 'initial' }}>{this.state.pickTime}</td></tr>
                                <tr><th>Delivery Stop:</th><td style={{ whiteSpace: 'initial' }}>{(this.state.loadsdata.hasOwnProperty('stops')) ? this.state.loadsdata.stops[this.state.loadsdata.stops.length - 1].location : '-'}</td></tr>
                                <tr><th>Delivery City State:</th><td style={{ whiteSpace: 'initial' }}>{this.state.loadsdata.to_location}</td></tr>
                                <tr><th>Delivery Time:</th><td style={{ whiteSpace: 'initial' }}>{this.state.deliverTime}</td></tr>
                            </table>
                            
                            

                            
{this.state.Tracking_mode == 'Manual' ?

                            <div>
                                {/* <button className="btn float-right mt-5 mr-5 mb-2">Add Details</button> */}
                                <Example className="mt-4"/>

                            </div>:<div></div>
    }
    
                        </div>
                    </div>
                </Card>

                <hr className="rounded" />

                <Card>
                    <CardHeader><h3>Tracking Details</h3></CardHeader>
                    <CardBody>
                        <div className="row">
                            <div className="col-md-5">
                                <div className="table-responsive" style={{ maxHeight: 420 }}>
                                    <Table className="align-items-center table-bordered">
                                        <tbody>
                                            {tracking_data}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                            <div className="col-md-7">
                                
                                {(this.state.startPoint[0] != 0 && this.state.endPoint[0] != 0 && this.state.currentPoint[0] != 0) ? <MapComponent
                                    startPoint={this.state.startPoint}
                                    endPoint={this.state.endPoint}
                                    currentPoint={this.state.currentPoint}
                                    
                                    
                                ></MapComponent> : this.state.NoRecordFound==true?<div>No record Found</div>:<div>Loading...</div>}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                </div>

                <Container fluid>
                    <Footer />
                </Container>
            </div>
        </>
        )
    }
}
