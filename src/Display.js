import React, {Component} from 'react'

import Grid from './Grid'
import gridStateFactory from './gridStateFactory'

const displayStyle = {
    height: `100%`,
    overflowX: `hidden`,
    overflowY: `scroll`,
    position: `relative`,
    width: `100%`
}

const contentStyle = {}

const getDisplaySize = (inst) => {
    const {top: displayTop, width, height} = inst.getDisplayBoundingClientRect()
    const {top: contentTop} = inst.getContentBoundingClientRect()
    const scrollTop = displayTop - contentTop

    return {
        scrollTop,
        width,
        height
    }
}

const createScrollListener = inst =>
    () => {
        const {scrollTop} = getDisplaySize(inst)
        inst.gridState.updateOffset(scrollTop)

        inst.setState(inst.gridState.getState())
    }

const createWindowResizeListener = inst => {
    inst.windowResizeListener = () => {
        const {scrollTop, width, height} = getDisplaySize(inst)
        const {items, more} = inst.props
        inst.gridState.updateGrid(items, width, height, scrollTop, more)
        inst.setState(inst.gridState.getState())
    }

    return inst.windowResizeListener
}


class Display extends Component {

    constructor(props) {
        super()
        const {additionalHeight, minWidth, offsetLeft, padding, more} = props
        this.gridState = gridStateFactory({additionalHeight, minWidth, offsetLeft, padding, more})

        this.state = this.gridState.getState()
    }

    componentDidMount() {
        const {items, more} = this.props
        const {scrollTop, width, height} = getDisplaySize(this)
        this.gridState.updateGrid(items, width, height, scrollTop, more)

        this.setState(this.gridState.getState())

        this.display.addEventListener(`scroll`, createScrollListener(this))
        window.addEventListener(`resize`, createWindowResizeListener(this))
    }

    componentWillUnmount() {
        window.removeEventListener(`resize`, this.windowResizeListener)
    }

    getDisplayBoundingClientRect() {
        return this.display.getBoundingClientRect()
    }

    getContentBoundingClientRect() {
        return this.content.getBoundingClientRect()
    }

    render() {

        return (
            <div ref={display => {
                this.display = display
            }}
                 style={displayStyle}
            >
                <div ref={content => {
                    this.content = content
                }} style={contentStyle}
                >
                    <Grid {...this.state} />
                </div>
            </div>
        )
    }
}


export default Display