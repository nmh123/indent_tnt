import React, {Component } from "react";
import {
BrowserRouter as Router,
Link,
Redirect,
withRouter,
} from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import moment from "moment";
import { sortable } from "react-sortable";
import Example from "./HideColumnModal";
import {
Card,
CardBody,
CardHeader,
CardFooter,
Table,
Pagination,
PaginationItem,
PaginationLink,
Container,
Row,
} from "reactstrap";
import config from "../app_config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import { withAuth0,useAuth0,withAuthenticationRequired} from '@auth0/auth0-react';

const { user,loginWithRedirect,logout,getAccessTokenSilently} = withAuth0();

const TZ = config.TIME_ZONE;

class Item extends Component {
    render() {
        let v = this.props.children;
        if (v.indexOf("<br/>") != -1) {
        let s = v.split("<br/>");
        v = [];
        v.push(s[0]);
        v.push(<br />);
        v.push(s[1]);
        }
        let sortIcon = (
        <i className="fa fa-sort" style={{ alignSelf: "center" }}></i>
        );
        if (this.props.sort == null) {
        sortIcon = "";
        } else if (this.props.sort == this.props.sortBy) {
        if (this.props.sortOrder == "ASC") {
            sortIcon = (
            <i className="fa fa-sort-up" style={{ alignSelf: "center" }}></i>
            );
        } else {
            sortIcon = (
            <i className="fa fa-sort-down" style={{ alignSelf: "center" }}></i>
            );
        }
        }

        return (
        <th scope="col" {...this.props} style={{ cursor: "pointer" }}>
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "row",
                minWidth: "100px",
            }}
            >
            <span>{v}</span>
            {sortIcon}
            </div>
        </th>
        );
    }
}

var SortableItem = sortable(Item);

class ActiveLoads extends Component {
    constructor(props) {
        super(props);

        this.state = {
        isLogin: true,
        user: null,
        filterStartDate: "",
        filterEndDate: "",
        filterStatus: "",
        filterCustomer: "",
        filterCarier: "",
        filterPriority: "",
        filterAtRisk: "",
        filterOrderNo: "",
        sortBy: "id",
        sortOrder: "ASC",
        totalPage: 0,
        loadsData: [],
        pages: 0,
        perPages: 20,
        ApiError:false,
        cols: [
            {
            id: 1,
            key: "next_check_date",
            value: "Next Check<br/>Date Time",
            sort: "next_check_at",
            notVisible: true,
            },
            {
            id: 2,
            key: "customers_name",
            value: "Customer Name",
            sort: "S.name",
            notVisible: true,
            },
            {
            id: 3,
            key: "carrier_name",
            value: "Carrier Name",
            sort: "C.name",
            notVisible: true,
            },
            {
            id: 4,
            key: "order_number",
            value: "Load Number",
            sort: "uuid",
            notVisible: true,
            },
            {
            id: 5,
            key: "external_load_number",
            value: "External<br/>Load Number",
            sort: "external_load_id",
            notVisible: true,
            },
            {
            id: 6,
            key: "pick_appointment_time",
            value: "Pickup<br/>Date Time",
            sort: "pickup_stop_time",
            notVisible: true,
            },
            {
            id: 7,
            key: "delivery_appointment_time",
            value: "Delivery<br/>Date Time",
            sort: "delivery_stop_time",
            notVisible: true,
            },
            {
            id: 8,
            key: "ship_city_state",
            value: "Pickup<br/>City State",
            sort: "from_location",
            notVisible: true,
            },
            {
            id: 9,
            key: "dest_city_state",
            value: "Dest<br/>City State",
            sort: "to_location",
            notVisible: true,
            },
            {
            id: 10,
            key: "latest_check_call_type",
            value: "Latest Check<br/>Call Type",
            sort: "check_call_type",
            notVisible: true,
            },
            {
            id: 11,
            key: "risk",
            value: "At Risk",
            sort: "risk",
            notVisible: true,
            },
            {
            id: 12,
            key: "stops",
            value: "Stops",
            sort: "stops",
            notVisible: true,
            },
            {
            id: 13,
            key: "status",
            value: "Status",
            sort: "status",
            notVisible: true,
            },
            {
            id: 14,
            key: "comments",
            value: "Last<br/> Comment",
            sort: "description",
            notVisible: true,
            },
            {
            id: 15,
            key: "priority",
            value: "Priority",
            sort: "priority",
            notVisible: true,
            },
            {
            id: 16,
            key: "tracking_mode",
            value: "Tracking<br/> Mode",
            sort: "tracking_mode",
            notVisible: true,
            },
            {
            id: 17,
            key: "external_tracker",
            value: "External<br/>Tracker",
            sort: "tracker",
            notVisible: true,
            },
        ],
        colsSetting: [
            { id: 1, notVisible: true },
            { id: 2, notVisible: true },
            { id: 3, notVisible: true },
            { id: 4, notVisible: true },
            { id: 5, notVisible: true },
            { id: 6, notVisible: true },
            { id: 7, notVisible: true },
            { id: 8, notVisible: true },
            { id: 9, notVisible: true },
            { id: 10, notVisible: true },
            { id: 11, notVisible: true },
            { id: 12, notVisible: true },
            { id: 13, notVisible: true },
            { id: 14, notVisible: true },
            { id: 15, notVisible: true },
            { id: 16, notVisible: true },
            { id: 17, notVisible: true },
        ],
        filterTrackingMode: "",
        path: this.props.type,
        modal_hide: false,
        loading: true,
        filterExternalTracker: "",
        };

        this.updateColumn = this.updateColumn.bind(this);
        this.loadDataAPI = this.loadDataAPI.bind(this);
        this.updatePage = this.updatePage.bind(this);
        this.update_user_setting = this.update_user_setting.bind(this);
        this.get_user_setting = this.get_user_setting.bind(this);
        this.updatePerPage = this.updatePerPage.bind(this);
        this.filter = this.filter.bind(this);
        this.resetFilter = this.resetFilter.bind(this);
    }

    componentDidMount() {
        
        const queryParams = new URLSearchParams(this.props.location.search);
        const id = queryParams.get("id");
        console.log(id);
        let self = this;

        const page_num = queryParams.get("page_num");
        const per_page = queryParams.get("per_page");
        const status = queryParams.get("status");
        const tracking_mode = queryParams.get("tracking_mode");
        const external_tracker = queryParams.get("tracker");
        const load_number = queryParams.get("load_no");
        const customer_name = queryParams.get("customer");
        const carrier_name = queryParams.get("carier");
        const priority = queryParams.get("priority");
        const risk = queryParams.get("risk");
        const startDate = queryParams.get("start_date");
        const endDate = queryParams.get("end_date");
        self.setState({
        pages:page_num && page_num != null && page_num != 0? parseInt(page_num) - 1: 0,
        perPages: per_page && per_page != undefined ? parseInt(per_page) : 20,
        filterStatus: status && status != undefined ? status : "",
        filterTrackingMode:tracking_mode && tracking_mode != undefined ? tracking_mode : "",
        filterExternalTracker:
            external_tracker && external_tracker != undefined
            ? external_tracker
            : "",
        filterOrderNo: load_number && load_number != undefined ? load_number : "",
        filterCustomer:
            customer_name && customer_name != undefined ? customer_name : "",
        filterCarier:
            carrier_name && carrier_name != undefined ? carrier_name : "",
        filterPriority: priority && priority != undefined ? priority : "",
        filterAtRisk: risk && risk != undefined ? risk : "",
        filterStartDate: startDate && startDate != undefined ? startDate : "",
        filterEndDate: endDate && endDate != undefined ? endDate : "",
        });

        console.log("param>>", status);
        this.get_user_setting(() => {
        this.loadDataAPI();
        });
    }

    componentWillUnmount() {
        netlifyIdentity.off("logout");
    }

    updateColumn(id) {
        let d = this.state.colsSetting;
        let p = this.state.cols;
        console.log("arr", p);
        console.log("arra_2", d);
        for (let j = 0; j < p.length; j++) {
        for (let i = 0; i < d.length; i++) {
            if (p[j].id == id && d[i].id == id) {
            p[j].notVisible = p[j].notVisible == true ? false : true;
            d[i].notVisible = d[i].notVisible == true ? false : true;
            }
        }
        }
        this.setState(
        {
            cols: p,
            colsSetting: d,
        },
        () => console.log("clicked", JSON.stringify(this.state.colsSetting))
        );
    }
    async update_user_setting(cb) {
        let url = config.APP_URL + "/update-user-setting/";
        console.log("url_update: ", url);
        let token = await localStorage.getItem("authLogin");
        fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            column_order: JSON.stringify(this.state.colsSetting),
            sort_order: this.state.sortOrder,
            sort_by: this.state.sortBy,
            per_page: this.state.perPages,
        }),
        })
        .then((res) => res.json())
        .then((response) => {
            if (response.error) {
            alert(response.error);
            return;
            }
            console.log("---------------------res",response);
            console.log("---------------------updated");
            if (cb) {
            this.onSortItems(this.state.cols);
            this.get_user_setting(() => this.loadDataAPI());
            }
        }).catch((err) => {
            console.log("---------------------errr",err);
            this.setState({ApiError:true , loading:false})   
        });
    }

    async get_user_setting(cb) {
        const queryParams = new URLSearchParams(this.props.location.search);
        const per_page_get_user = queryParams.get("per_page");
        let self = this;
        const tokn = await localStorage.getItem('authLogin');
        let url = config.APP_URL + "/get-user-setting/";
        console.log("url: ", url);
        self.setState({
        loading: true,
        });
        fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokn}`,
        },
        })
        .then((res) => res.json())
        .then((response) => {
            console.log("response testing", response.error);
            if (response.error) {
            this.update_user_setting()
            this.loadDataAPI();
            }
            let cols = self.state.cols;
            let cols_set = self.state.colsSetting;
            let sortOrder = self.state.sortOrder;
            let sortBy = self.state.sortBy;
            let abc = {};
            let xyz = [];
            let perP = self.state.perPages;
            if (response.sort_order && response.sort_order != null) {
            sortOrder = response.sort_order;
            }
            if (response.sort_by && response.sort_by != null) {
            sortBy = response.sort_by;
            }
            if(per_page_get_user !== undefined && per_page_get_user === null){
                if (response.per_page && response.per_page != null) {
                perP = response.per_page;
                }
            }
            let updated_setting = [];
            let default_col_length = self.state.cols.length;
            let response_col = JSON.parse(response.column_order);
            if (
            response.column_order &&
            response.column_order != null &&
            response.column_order != "[]" &&
            response.column_order.length > 0 &&
            response_col.length == default_col_length
            ) {
            console.log("test");
            let response_data = JSON.parse(response.column_order);
            let json = cols;
            for (let i = 0; i < response_data.length; i++) {
                for (let j = 0; j < json.length; j++) {
                if (json[j].id == response_data[i].id) {
                    abc = {
                    id: json[j].id,
                    value: json[j].value,
                    notVisible: response_data[i].notVisible,
                    sort: json[j].sort,
                    comments: json[j].comments,
                    key: json[j].key,
                    };
                    xyz.push(abc);
                    updated_setting.push(response_data[i]);
                }
                }
            }
            } else {
            xyz = cols;
            updated_setting = cols_set;
            }
            console.log("uop", xyz);
            self.setState(
            {
                cols: xyz,
                colsSetting: updated_setting,
                sortOrder: sortOrder,
                sortBy: sortBy,
                perPages: perP,
            },
            () => {
                if (cb) cb();
            }
            );
        }).catch(err=>{
            this.setState({ApiError:true , loading:false})   
        });
    }

    loadDataAPI() {
        let self = this;
        let path = this.state.path;
        console.log(path);
        console.log("state", self.state.filterStatus);
        let page = `page=${this.state.pages}`;
        let url = config.APP_URL + "/load/list?" + page;
        window.scrollTo(500, 0);
        if (
        self.state.filterExternalTracker != "" &&
        self.state.filterExternalTracker != "null"
        ) {
        url += "&tracker=" + encodeURI(self.state.filterExternalTracker);
        }
        if (self.state.filterCarier != "" && self.state.filterCarier != "null") {
        url += "&carrier=" + encodeURI(self.state.filterCarier);
        }
        if (
        self.state.filterCustomer != "" &&
        self.state.filterCustomer != "null"
        ) {
        url += "&customer=" + encodeURI(self.state.filterCustomer);
        }
        if (
        self.state.filterPriority != "" &&
        self.state.filterPriority != "null"
        ) {
        url += "&priority=" + self.state.filterPriority;
        }
        if (self.state.filterStatus != "" && self.state.filterStatus != "null") {
        url += "&status=" + encodeURI(self.state.filterStatus);
        }
        if (
        self.state.filterTrackingMode != "" &&
        self.state.filterTrackingMode != "null"
        ) {
        url += "&trackingmode=" + encodeURI(self.state.filterTrackingMode);
        }
        if (self.state.filterAtRisk != "" && self.state.filterAtRisk != "null") {
        url += "&risk=" + self.state.filterAtRisk;
        }
        if (self.state.sortBy != "") {
        url += "&sort=" + self.state.sortBy;
        }
        if (self.state.sortOrder != "") {
        url += "&sort_type=" + self.state.sortOrder;
        }
        if (self.state.perPages != "" && self.state.perPages != "null") {
        url += "&per_page=" + self.state.perPages;
        }
        if (self.state.filterOrderNo != "" && self.state.filterOrderNo != "null") {
        url += "&order_number=" + self.state.filterOrderNo;
        }
        if (
        self.state.filterStartDate != "" &&
        self.state.filterStartDate != "null"
        ) {
        url += "&start_date=" + self.state.filterStartDate;
        }
        if (self.state.filterEndDate != "" && self.state.filterEndDate != "null") {
        url += "&end_date=" + self.state.filterEndDate;
        }
        self.setState({
        loading: true,
        });
        console.log("url",url)
        fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        })
        .then((res) => res.json())
        .then(
            (response) => {
            if (response.error) {
                alert(response.error);
                self.setState({
                loadsData: [],
                totalPage: 0,
                loading: false,
                });
                return;
            }
            self.setState({
                loading: false,
            });
            console.log("json>>>>>", response);
            let data = [];
            let obj = {};
            for (let row of response.rows) {
                obj = {
                id: row.id,
                next_check_date: row.next_check_date_time,
                customers_name: row.shipper,
                carrier_name: row.carrier,
                order_number: row.uuid,
                external_load_number: row.order_number,
                pick_appointment_time: row.pickup_stop_time,
                delivery_appointment_time: row.delivery_stop_time,
                ship_city_state: row.from_location,
                dest_city_state: row.to_location,
                latest_check_call_type: row.check_call_type,
                priority: row.priority,
                risk: row.risk,
                stops: row.total_stops,
                status: row.status,
                comments: row.description,
                timezonename: row.pickup_stop_timezone,
                tracking_mode: row.tracking_mode,
                external_tracker: row.source,
                };
                if(obj.next_check_date && obj.next_check_date !== null){
                let datetime = obj.next_check_date.split(' ');
                
                obj.next_check_date = moment(
                    datetime[0]
                ).format("MM/DD/YYYY")+" "+datetime[1]+" "+datetime[2]
                }
                if (obj.ship_city_state && obj.ship_city_state !=null) {
                let abc = obj.ship_city_state.toLowerCase().replace(/_/g, "");
                let x = abc.split(",");
                if(x.length>1)
                {
                    obj.ship_city_state = x[0] + "," + x[1].toUpperCase();
                }             
                } else if (obj.ship_city_state == null) {
                obj.ship_city_state = "Not Available";
                }
                if (obj.dest_city_state && obj.dest_city_state !=null) {
                let abc = obj.dest_city_state.toLowerCase().replace(/_/g, "");
                let x = abc.split(",");
                if(x.length>1)
                {
                    obj.dest_city_state = x[0] + "," + x[1].toUpperCase();
                }
                } else if (obj.dest_city_state == null) {
                obj.dest_city_state = "Not Available";
                }
                if (!obj.order_number || obj.order_number == null) {
                obj.order_number = "-";
                }
                if (obj.pick_appointment_time == null) {
                obj.pick_appointment_time = "Not Available";
                } else {
                let newpick_timeZone = moment(obj.pick_appointment_time).format(
                    "MM/DD/YYYY HH:mm "
                );
                obj.pick_appointment_time =
                    newpick_timeZone + " " + row.pickup_stop_timezone_abbr;
                }
                if (obj.delivery_appointment_time == null) {
                obj.delivery_appointment_time = "Not Available";
                } else {
                let newdeliver_timeZone = moment(
                    obj.delivery_appointment_time
                ).format("MM/DD/YYYY HH:mm ");
                obj.delivery_appointment_time =
                    newdeliver_timeZone + " " + row.delivery_stop_timezone_abbr;
                }
                if (obj.priority) {
                obj.priority = obj.priority.toLowerCase().replace(/_/g, " ");
                }
                if (obj.risk) {
                obj.risk = obj.risk.toLowerCase().replace(/_/g, " ");
                }
                if (obj.status) {
                obj.status = obj.status.toLowerCase().replace(/_/g, " ");
                }
                if (obj.tracking_mode) {
                obj.tracking_mode = obj.tracking_mode
                    .toLowerCase()
                    .replace(/_/g, " ");
                }
                if (obj.carrier_name && obj.carrier_name == null) {
                obj.carrier_name = "-";
                }
                if (obj.customers_name && obj.customers_name == null) {
                obj.customers_name = "-";
                }
                data.push(obj);
            }
            self.setState({
                loadsData: data,
                totalPage: response.total_record,
            });
            },
            (error) => {
            console.log(error);
            }
        ).catch(err=>{
            this.setState({ApiError:true , loading:false})   
        });
    }

    updatePage(pages) {
        let self = this;
        this.setState({ pages }, () => {
        this.loadDataAPI();
        });
        this.props.history.push(
        `/active-loads/?page_num=${pages + 1}&per_page=${
            this.state.perPages
        }&status=${
            this.state.filterStatus ? this.state.filterStatus : null
        }&tracking_mode=${
            this.state.filterTrackingMode ? this.state.filterTrackingMode : null
        }&tracker=${
            this.state.filterExternalTracker
            ? this.state.filterExternalTracker
            : null
        }&load_no=${
            this.state.filterOrderNo ? this.state.filterOrderNo : null
        }&customer=${
            this.state.filterCustomer ? this.state.filterCustomer : null
        }&carier=${
            this.state.filterCarier ? this.state.filterCarier : null
        }&priority=${
            this.state.filterPriority ? this.state.filterPriority : null
        }&risk=${
            this.state.filterAtRisk ? this.state.filterAtRisk : null
        }&start_date=${
            this.state.filterStartDate ? this.state.filterStartDate : null
        }&end_date=${this.state.filterEndDate ? this.state.filterEndDate : null}`
        );
    }

    updatePerPage(v) {
        this.setState({ perPages: v, pages: 0 },() => {this.update_user_setting(this.props.history.push(
            `/active-loads/?page_num=${1}&per_page=${v}&status=${
              this.state.filterStatus ? this.state.filterStatus : null
            }&tracking_mode=${
              this.state.filterTrackingMode ? this.state.filterTrackingMode : null
            }&tracker=${
              this.state.filterExternalTracker
                ? this.state.filterExternalTracker
                : null
            }&load_no=${
              this.state.filterOrderNo ? this.state.filterOrderNo : null
            }&customer=${
              this.state.filterCustomer ? this.state.filterCustomer : null
            }&carier=${
              this.state.filterCarier ? this.state.filterCarier : null
            }&priority=${
              this.state.filterPriority ? this.state.filterPriority : null
            }&risk=${
              this.state.filterAtRisk ? this.state.filterAtRisk : null
            }&start_date=${
              this.state.filterStartDate ? this.state.filterStartDate : null
            }&end_date=${this.state.filterEndDate ? this.state.filterEndDate : null}`            
          ))
        });    
    }

    filter() {
        this.setState({ pages: 0 }, () => {
        console.log("current page", this.state.pages);
        this.loadDataAPI();
        });
        this.props.history.push(
        `/active-loads/?page_num=${1}&per_page=${this.state.perPages}&status=${
            this.state.filterStatus ? this.state.filterStatus : null
        }&tracking_mode=${
            this.state.filterTrackingMode ? this.state.filterTrackingMode : null
        }&tracker=${
            this.state.filterExternalTracker
            ? this.state.filterExternalTracker
            : null
        }&load_no=${
            this.state.filterOrderNo ? this.state.filterOrderNo : null
        }&customer=${
            this.state.filterCustomer ? this.state.filterCustomer : null
        }&carier=${
            this.state.filterCarier ? this.state.filterCarier : null
        }&priority=${
            this.state.filterPriority ? this.state.filterPriority : null
        }&risk=${
            this.state.filterAtRisk ? this.state.filterAtRisk : null
        }&start_date=${
            this.state.filterStartDate ? this.state.filterStartDate : null
        }&end_date=${this.state.filterEndDate ? this.state.filterEndDate : null}`
        );
    }

    resetFilter() {
        this.setState(
        {
            filterStartDate: "",
            filterEndDate: "",
            filterStatus: "",
            filterCustomer: "",
            filterCarier: "",
            filterPriority: "",
            filterAtRisk: "",
            filterOrderNo: "",
            filterTrackingMode: "",
            perPages: 20,
            pages: 0,
            filterExternalTracker: "",
        },
        () => {
            this.get_user_setting(() => {
            this.loadDataAPI();
            });
        }
        );
        this.props.history.push("/active-loads/");
    }

    onSortItems = (cols) => {
        let self = this;
        let f = navigator.userAgent.search("Firefox");
        console.log("item test", cols);
        let col_set = self.state.colsSetting;
        let arr_colset = [];
        let myJson = {};
        for (let i = 0; i < cols.length; i++) {
        for (let j = 0; j < col_set.length; j++) {
            if (col_set[j].id == cols[i].id) {
            myJson = { id: col_set[j].id, notVisible: col_set[j].notVisible };
            arr_colset.push(myJson);
            }
        }
        }
        arr_colset = arr_colset.sort((a, b) =>
        a.notVisible > b.notVisible ? +1 : -1
    );
    arr_colset.reverse();
        console.log(">>> cols", arr_colset);
         if (f > -1) {
        arr_colset = arr_colset.sort((a, b) =>
            a.notVisible > b.notVisible ? +1 : -1
        );
        arr_colset.reverse();     
        } 
        this.setState(
        {
            colsSetting: arr_colset,
        },
        () => {
            self.update_user_setting();
        }
        );
    }

    updateSort = (sortBy) => {
        if (sortBy != null) {
        let order = this.state.sortOrder;
        let by = this.state.sortBy;
        if (sortBy == this.state.sortBy) {
            order = order == "ASC" ? "DESC" : "ASC";
        } else {
            by = sortBy;
            order = "ASC";
        }
        let self = this;
        this.setState(
            {
            sortOrder: order,
            sortBy: by,
            pages: 0,
            },
            () => {
            self.loadDataAPI();
            self.update_user_setting();
            }
        );
        }
    }
    render() { 
        const { user,loginWithRedirect,logout,getAccessTokenSilently} = this.props.auth0;
        console.log(JSON.stringify(user))
        console.log(
        "Total pages",
        parseInt(this.state.totalPage % this.state.perPages)
        );
        if (!this.state.isLogin) {
        return <Redirect to={{ pathname: "/" }} />;
        }

        let { cols, colsSetting } = this.state;

        var listItems = cols
        .filter((item) => item.notVisible === true)
        .map((item, i) => {
            return (
            <SortableItem
                key={i}
                onSortItems={this.onSortItems}
                onClick={() => this.updateSort(item.sort)}
                items={cols}
                sort={item.sort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}
                sortId={i}
            >
                {item.value}
            </SortableItem>
            );
        });
        let listdata = this.state.loadsData.map((loaddata, index) => {
        let tr_cls =
            loaddata.risk == "high"
            ? "bg-danger text-capitalize"
            : loaddata.risk == "medium"
            ? "bg-yellow text-capitalize"
            : "" + "text-capitalize";
        let tds = cols
            .filter((item) => item.notVisible === true)
            .map((col, idx) => {
            return (
                <td scope="row" key={idx}>
                <Link
                    style={{ color: "#333" }}
                    to={"/loads-details/" + loaddata.id}
                >
                    {loaddata[col.key]}
                </Link>
                </td>
            );
            });
        return <tr className={tr_cls}>{tds}</tr>;
        });
        let prev_button = [];
        let next_button = [];
        let pages_btn = [];
        let pages = this.state.pages;
        let pageSet = pages;
        if (this.state.totalPage > this.state.perPages) {
        let nd =
            pages + 1 > parseInt(this.state.totalPage / this.state.perPages)
            ? "disabled"
            : "";
        let pd = pages - 1 < 0 ? "disabled" : "";
        prev_button.push(
            <PaginationItem className={pd}>
            <PaginationLink
                href=""
                onClick={(e) => this.updatePage(pages - pageSet)}
                tabIndex="-1"
            >
                <i className="fas fa-angle-left" />
                <i className="fas fa-angle-left" />
                <span className="sr-only">Previous</span>
            </PaginationLink>
            </PaginationItem>
        );
        prev_button.push(
            <PaginationItem className={pd}>
            <PaginationLink
                href=""
                onClick={(e) => this.updatePage(pages - 1)}
                tabIndex="-1"
            >
                <i className="fas fa-angle-left" />
                <span className="sr-only">Previous</span>
            </PaginationLink>
            </PaginationItem>
        );
        next_button.push(
            <PaginationItem className={nd}>
            <PaginationLink href="" onClick={(e) => this.updatePage(pages + 1)}>
                <i className="fas fa-angle-right" />
                <span className="sr-only">Next</span>
            </PaginationLink>
            </PaginationItem>
        );
        next_button.push(
            <PaginationItem className={nd}>
            <PaginationLink
                href=""
                onClick={(e) => this.updatePage(total_pages_count)}
            >
                <i className="fas fa-angle-right" />
                <i className="fas fa-angle-right" />
                <span className="sr-only">Next</span>
            </PaginationLink>
            </PaginationItem>
        );
        let total_pages_count =
            parseInt(this.state.totalPage % this.state.perPages) == 0
            ? parseInt(this.state.totalPage / this.state.perPages) - 1
            : parseInt(this.state.totalPage / this.state.perPages);
        if (total_pages_count > 3) {
            if (pages - 1 > 0) {
            pages_btn.push(
                <PaginationItem className="">
                <PaginationLink
                    href=""
                    onClick={(e) => this.updatePage(pages - 2)}
                >
                    {pages - 1}
                </PaginationLink>
                </PaginationItem>
            );
            }
            if (pages > 0) {
            pages_btn.push(
                <PaginationItem className="">
                <PaginationLink
                    href=""
                    onClick={(e) => this.updatePage(pages - 1)}
                >
                    {pages}
                </PaginationLink>
                </PaginationItem>
            );
            }
            pages_btn.push(
            <PaginationItem className="active">
                <PaginationLink href="" onClick={(e) => this.updatePage(pages)}>
                {pages + 1}
                </PaginationLink>
            </PaginationItem>
            );

            if (pages < total_pages_count) {
            pages_btn.push(
                <PaginationItem className="">
                <PaginationLink
                    href=""
                    onClick={(e) => this.updatePage(pages + 1)}
                >
                    {pages + 2}
                </PaginationLink>
                </PaginationItem>
            );
            }
            if (pages + 1 < total_pages_count) {
            pages_btn.push(
                <PaginationItem className="">
                <PaginationLink
                    href=""
                    onClick={(e) => this.updatePage(pages + 2)}
                >
                    {pages + 3}
                </PaginationLink>
                </PaginationItem>
            );
            }
        } else {
            for (let p = 0; p <= total_pages_count; p++) {
            let a = pages == p ? "active" : "";
            pages_btn.push(
                <PaginationItem className={a} key={p}>
                <PaginationLink href="" onClick={(e) => this.updatePage(p)}>
                    {p + 1}
                </PaginationLink>
                </PaginationItem>
            );
            }
        }
        }

        return (
        <>
            <div className="main-content">
            <Header />
            <Container className="mt--9" fluid style={{ padding: "40px" }}>         
                <Row>
                <div className="col-lg-3 container">
                    <Card className="shadow">
                    <CardHeader>
                        <h3 className="mb-0">Filters</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="mb-2">
                        <label className="">Date</label>
                        <DateRangePicker
                            onApply={(ev, picker) => {
                            this.setState({
                                filterStartDate:
                                picker.startDate.format("MM-DD-YYYY"),
                                filterEndDate: picker.endDate.format("MM-DD-YYYY"),
                            });
                            }}
                        >
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Date"
                            value={
                                this.state.filterEndDate != "null" &&
                                this.state.filterEndDate != ""
                                ? this.state.filterStartDate +
                                    " - " +
                                    this.state.filterEndDate
                                : ""
                            }
                            />
                        </DateRangePicker>
                        </div>
                        <div className="mb-2">
                        <label>External Tracker</label>
                        <select
                            className="form-control"
                            placeholder="External Tracker"
                            onChange={(event) =>
                            this.setState({
                                filterExternalTracker: event.target.value,
                            })
                            }
                            value={this.state.filterExternalTracker}
                        >
                            <option className="form-control" value="">
                            All
                            </option>
                            <option className="form-control" value="MACROPOINT">
                            Macropoint
                            </option>
                            <option className="form-control" value="FOURKITES">
                            Fourkites
                            </option>
                            <option className="form-control" value="TnT">
                            TnT
                            </option>
                        </select>
                        </div>
                        <div className="mb-2">
                        <label>Status</label>
                        <select
                            className="form-control"
                            placeholder="Status"
                            onChange={(event) =>
                            this.setState({ filterStatus: event.target.value })
                            }
                            value={this.state.filterStatus}
                        >
                            <option className="form-control" value="">
                            All
                            </option>
                            <option
                            className="form-control"
                            value="TRACKING_INFO_ASSIGNED"
                            >
                            Tracking Info Assigned
                            </option>
                            <option className="form-control" value="TRACKING">
                            Tracking
                            </option>
                            <option className="form-control" value="AT_PICKUP">
                                At Pickup
                            </option>
                            <option
                            className="form-control"
                            value="PARTIALLY_PICKED_UP"
                            >
                            Partially Picked Up
                            </option>
                            <option className="form-control" value="PICKED_UP">
                            Picked Up
                            </option>
                            <option className="form-control" value="AT_TERMINAL">
                            At Terminal
                            </option>
                            <option
                            className="form-control"
                            value="AT_CONSIGNEE"
                            >
                            At Consignee
                            </option>
                            <option className="form-control" value="COMPLETED">
                            Completed
                            </option>
                        </select>
                        </div>

                        <div className="mb-2">
                        <label>Tracking Mode</label>
                        <select
                            className="form-control"
                            placeholder="Status"
                            onChange={(event) =>
                            this.setState({
                                filterTrackingMode: event.target.value,
                            })
                            }
                            value={this.state.filterTrackingMode}
                        >
                            <option value="">All</option>
                            <option value="AUTOMATIC">Automatic</option>
                            <option value="MANUAL">Manual</option>
                            <option value="ESTIMATED">Estimated</option>
                            <option value="ESTIMATED_STAY_IN_PLACE">
                            Estimated Stay In Place
                            </option>
                        </select>
                        </div>
                        <div className="mb-2">
                        <label>External Load Number</label>
                        <input
                            id="myOrderInput"
                            className="form-control"
                            type="text"
                            placeholder="External Load Number"
                            onChange={(event) =>
                            this.setState({ filterOrderNo: event.target.value })
                            }
                            value={
                            this.state.filterOrderNo == "null"
                                ? ""
                                : this.state.filterOrderNo
                            }
                        />
                        </div>
                        <div className="mb-2">
                        <label>Customer Name</label>
                        <input
                            id="myInput"
                            className="form-control"
                            type="text"
                            row="2"
                            column="3"
                            placeholder="Customer Name"
                            onChange={(event) =>
                            this.setState({ filterCustomer: event.target.value })
                            }
                            value={
                            this.state.filterCustomer == "null"
                                ? ""
                                : this.state.filterCustomer
                            }
                        />
                        </div>
                        <div className="mb-2">
                        <label>Carrier Name</label>
                        <input
                            className="form-control"
                            type="text"
                            row="2"
                            column="3"
                            placeholder="Carrier Name"
                            onChange={(event) =>
                            this.setState({ filterCarier: event.target.value })
                            }
                            value={
                            this.state.filterCarier == "null"
                                ? ""
                                : this.state.filterCarier
                            }
                        />
                        </div>
                        <div className="mb-2">
                        <label>Priority</label>
                        <select
                            className="form-control"
                            onChange={(event) =>
                            this.setState({ filterPriority: event.target.value })
                            }
                            value={this.state.filterPriority}
                        >
                            <option value="">All</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="HOT">Hot</option>
                        </select>
                        </div>
                        <div>
                        <label>At Risk</label>
                        <select
                            className="form-control"
                            value={this.state.filterAtRisk}
                            onChange={(event) =>
                            this.setState({ filterAtRisk: event.target.value })
                            }
                        >
                            <option value="">All</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="row">
                        <div className="col-md-6 text-left">
                            <button
                            type="button"
                            className="btn btn-success"
                            onClick={this.filter}
                            >
                            Filter
                            </button>
                            {/* </Link> */}
                        </div>
                        <div className="col-md-6 text-right">
                            <button
                            type="button"
                            className="btn btn-primary"
                            onClick={this.resetFilter}
                            >
                            Reset
                            </button>
                        </div>
                        </div>
                    </CardFooter>
                    </Card>
                </div>
                <div className="col-lg-9">
                    <Card className="shadow">
                    <CardHeader className="border-0">
                        <div className="row">
                        <div className="col-md-9">
                            <h2 className="mt-4">Active Loads</h2>
                        </div>
                        {this.state.loading == true ? (
                            ""
                        ) : (
                            <div className="col-md-2">
                            <label>
                                <b>Per Page</b>
                            </label>
                            <br />
                            <select
                                className="form-control"
                                onChange={(event) =>
                                this.updatePerPage(event.target.value)
                                }
                                value={this.state.perPages}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            </div>
                        )}
                        {this.state.loading == true ? (
                            ""
                        ) : (
                            <div className="col-md-1">
                            <label style={{ display: "block" }}>&nbsp;</label>
                            <Example
                                className=""
                                cols_data={cols}
                                cols_setting={colsSetting}
                                updateCall={this.update_user_setting}
                                set={this.get_user_setting}
                                updateChecked={this.updateColumn}
                            />
                            </div>
                        )}
                        </div>{" "}
                    </CardHeader>

                    {this.state.loading == true ? (
                        <div className="d-flex justify-content-center">
                        <div class="spinner-grow text-primary m-2" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <div class="spinner-grow text-primary m-2" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <div class="spinner-grow text-primary m-2" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        </div>
                    ) : this.state.ApiError === true ? <div style={{margin:"auto"}}>Something went wrong.</div> : (
                        <Table
                        id="myTable"
                        className="align-items-center table-flush"
                        responsive 
                        type="card"
                        >
                        <thead className="thead-light">
                            <tr className="sortable-list">{listItems}</tr>
                        </thead>
                        <tbody>{listdata}</tbody>
                        </Table>
                    )}

                    <CardFooter className="py-4 " id="pablo">
                        <nav aria-label="...">
                        <Pagination
                            className="pagination justify-content-end mb-0"
                            listClassName="justify-content-end mb-0"
                        >
                            {prev_button}
                            {pages_btn}
                            {next_button}
                        </Pagination>
                        </nav>
                    </CardFooter>
                    </Card>
                </div>
                </Row>
            </Container>
            <Container fluid>
                <Footer />
            </Container>
            </div>
        </>
        );
    }
}
export default withRouter(withAuth0(ActiveLoads));
