import {List, Map} from 'immutable'

import expect from 'expect'
import expectImmutable from 'expect-immutable'
import mockery from 'mockery'
import rndoam from 'rndoam/lib/withImmutable'

expect.extend(expectImmutable)

describe(`react-adaptive-grid`, () => {

    describe(`GridState`, () => {
        let GridState

        const calcVisibleGridSpy = expect.createSpy()
        const calcGridExcludeLastRowSpy = expect.createSpy()
        const calcGridSpy = expect.createSpy()
        const insertItemsSpy = expect.createSpy()

        beforeEach(() => {
            mockery.enable({
                warnOnUnregistered: false

            })
            mockery.registerMock(`./gridCalculations`, {
                calcGrid: calcGridSpy,
                calcGridExcludeLastRow: calcGridExcludeLastRowSpy,
                calcVisibleGrid: calcVisibleGridSpy,
                insertItems: insertItemsSpy
            });

            ({default: GridState} = require(`../src/GridState`))
        })

        afterEach(() => {
            mockery.deregisterAll()
            mockery.disable()

            calcVisibleGridSpy.reset()
            calcGridSpy.reset()
            insertItemsSpy.reset()
        })


        it(`should initialize with default values`, () => {
            const gridState = new GridState()

            expect(gridState.additionalHeight).toEqual(0)
            expect(gridState.containerWidth).toEqual(0)
            expect(gridState.containerHeight).toEqual(0)
            expect(gridState.minWidth).toEqual(0)
            expect(gridState.more).toEqual(false)
            expect(gridState.offset).toEqual(0)
            expect(gridState.offsetLeft).toEqual(0)
            expect(gridState.padding).toEqual(0)
            expect(gridState.grid).toEqualImmutable(Map({
                rows: List(),
                height: 0
            }))
        })

        it(`should update offset`, () => {
            const gridState = new GridState()
            const offset = rndoam.number()

            gridState.updateOffset(offset)

            expect(gridState.offset).toEqual(offset)
        })

        it(`should calculate grid`, () => {

            const additionalHeight = rndoam.number()
            const items = rndoam.list()
            const containerWidth = rndoam.number()
            const containerHeight = rndoam.number()
            const offset = rndoam.number()
            const offsetLeft = rndoam.number()
            const minWidth = rndoam.number()
            const padding = rndoam.number()

            const gridState = new GridState({additionalHeight, minWidth, offsetLeft, padding})

            gridState.updateGrid(items, containerWidth, containerHeight, offset, true)

            expect(gridState.containerWidth).toEqual(containerWidth)
            expect(gridState.containerHeight).toEqual(containerHeight)
            expect(gridState.offset).toEqual(offset)
            expect(gridState.more).toEqual(true)

            expect(calcGridSpy.calls.length).toEqual(1)

            const {arguments: args} = calcGridSpy.calls[ 0 ]

            expect(args).toEqual([
                items, additionalHeight, containerWidth, minWidth, offsetLeft, padding, padding
            ])
        })

        it(`should get initial state`, () => {
            const padding = rndoam.number()
            const grid = Map({
                rows: List([
                    Map(),
                    Map()
                ])
            })

            const gridState = new GridState({grid, padding})
            const offset = rndoam.number()
            const height = rndoam.number()
            const rows = List([
                Map({
                    top: offset
                })
            ])

            calcVisibleGridSpy.andReturn([ Map({
                rows,
                height
            }), 0 ])

            expect(gridState.getState())
                .toEqual({
                    loadMoreAllowed: false,
                    offset,
                    rows,
                    height,
                    padding
                })
            expect(calcVisibleGridSpy.calls.length).toEqual(1)
        })

        it(`should pass into calcVisible function grid without last ro if loading awaiting`, () => {
            const grid = Map({
                rows: List([
                    Map(),
                    Map()
                ])
            })

            const gridState = new GridState({
                grid,
                more: true
            })

            const gridExcludeLastRow = Map({
                rows: List([
                    Map()
                ])
            })

            calcGridExcludeLastRowSpy.andReturn(gridExcludeLastRow)

            gridState.getState()

            const {arguments: args} = calcVisibleGridSpy.calls[ 0 ]

            expect(args[ 0 ])
                .toBe(gridExcludeLastRow)
        })

        it(`should allow to load more items if last row is visible`, () => {
            const grid = Map({
                rows: List([
                    Map(),
                    Map()
                ])
            })

            const gridState = new GridState({
                grid
            })

            calcVisibleGridSpy.andReturn([ grid, 1 ])

            expect(gridState.getState().loadMoreAllowed).toBeTruthy()
        })

        it(`should allow to load more with buffer`, () => {
            const grid = Map({
                rows: List([
                    Map(),
                    Map(),
                    Map(),
                    Map()
                ])
            })

            const gridState = new GridState({
                grid,
                buffer: 3
            })

            calcVisibleGridSpy.andReturn([ grid, 1 ])

            expect(gridState.getState().loadMoreAllowed).toBeTruthy()
        })

        it(`should insert items and update more`, () => {
            const gridState = new GridState({
                more: true
            })
            const items = rndoam.list()

            gridState.insertItems(items, false)

            expect(gridState.more)
                .toEqual(false)

            expect(insertItemsSpy.calls.length).toEqual(1)
        })
    })
})