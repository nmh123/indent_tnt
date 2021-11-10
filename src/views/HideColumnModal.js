
import React, { Component, useState } from "react";
import {
    Button,
} from "reactstrap";
import Modal from 'react-bootstrap/Modal';

export default class Example extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lgShow: false,
        }
    }

    updateColumn(id) {
        this.props.updateChecked(id)
    }

    updateSetting() {
        let self = this;
        let abc = this.props;
        this.props.updateCall(abc)
        self.setState({
            lgShow: false
        })
    }

    render() {
        var test = [];
        var listItems = this.props.cols_data;
        var setItems = this.props.cols_setting;
        let lbl = '';
        for (let j = 0; j < setItems.length; j++) {
            for (let i = 0; i < listItems.length; i++)
                if (listItems[i].id == setItems[j].id)
                    lbl = listItems[i].value;
            test.push(
                <div key={j} className="">
                    <input className="mr-3 " type="checkbox" checked={setItems[j].notVisible} onChange={this.updateColumn.bind(this, setItems[j].id)} />
                    <label className="text-lg">{lbl.replace(`<br/>`, ' ')}</label>
                </div>
            )
        }
        return (
            <>
                <Button onClick={() => this.setState({ lgShow: true })}><i class="fa fa-cog"></i></Button>
                <Modal
                    size="md"
                    show={this.state.lgShow}
                    onHide={() => this.setState({ lgShow: false }, () => { this.updateSetting() })}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton className="d-flex flex-row">
                        <Modal.Title id="example-modal-sizes-title-lg" className="d-flex flex-row">
                            Settings
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div><h3>Select columns to show</h3></div>
                            {test}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={() => this.updateSetting()}>Close</button>
                    </Modal.Footer>
                </Modal>

            </>
        );
    }
}