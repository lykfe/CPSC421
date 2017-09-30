let stateCollection
let totalSumArray = []
let totalSum = 0

function compute () {
  const bs = document.getElementById('initialState').value.split(',').map(i => parseInt(i.trim())|| '').filter(i => i !== '')
  const actions = document.getElementById('actionSequence').value.split(',').map(i => parseInt(i.trim()) || '').filter(i => i !== '')
  const obs = document.getElementById('obsSequence').value.split(',').map(i => parseInt(i.trim()) || '').filter(i => i !== '')
  stateCollection = []
  if (safetyCheck(bs, actions, obs)) {
    stateCollection.push(createPreset(bs))
    actions.forEach((action, index) => {
      totalSum = 0
      const currentState = stateCollection[index]
      const newBeliefState = currentState.map((col, colIndex) => {
        return col.map((row, rowIndex) => {
          return {
            ...row,
            value: row.value !== -1 ? computeValue(row, action, obs[index], currentState).toPrecision(5) : -1
          }
        })
      })
      stateCollection.push(newBeliefState)
      totalSumArray.push(totalSum)
    })
    console.log(totalSumArray)
    populateGrid(stateCollection[stateCollection.length - 1])
  }
}

function safetyCheck (bs, actions, obs) {
  return actions.length === obs.length && (bs.length === 0 || bs.length === 2)
}

function computeValue (state, action, obs, currentState) {
  //console.log(state.id)
  const sensor = obs === -1 ? (state.numOfWalls === 0 ? 1 : 0) : (obs === state.numOfWalls ? 0.9 : 0.1)
  let sum = 0
  for (i = 0; i < 4; i++) {
    const ptlPrevState = state.adj[(action + i) % 4]
    //console.log((action + i) % 4)
    if (i === 0) {
      if (ptlPrevState[0] === null || ptlPrevState[1] === null) {
        sum += state.value*0.9
      }
    } else {
      if (ptlPrevState[0] !== null && ptlPrevState[1] !== null) {
        sum += currentState[ptlPrevState[0]][ptlPrevState[1]].value * (i === 2 ? 0.9 : 0.1)
      }
    }
  }
  //console.log('=========')
  totalSum += sensor*sum
  return sensor*sum
}

function createPreset (bs) {
  // (col, row) = (i, j)
  let presetGrid = [ [{},{},{}], [{},{},{}], [{},{},{}], [{},{},{}]]
  return presetGrid.map((col, colIndex) => {
    return col.map((row, rowIndex) => {
      // creating null block
      if (colIndex === 1 && rowIndex === 1) {
        return {value: -1}
      }
      return {
        id: [colIndex, rowIndex],
        value: (colIndex === 3 && rowIndex > 0) ? 0 : bs.length === 0 ? 1/9 : (bs[0] === colIndex && bs[1] === rowIndex ? 1 : 0),
        adj: computeNeighbours(colIndex, rowIndex),
        numOfWalls: colIndex === 2 ? 1 : 2
      }
    })
  })
}

function populateGrid (result) {
  result.forEach((row, colIndex) => {
    row.forEach((e, rowIndex) => {
      if (rowIndex === 1 && colIndex === 1) return
      document.getElementById(`${colIndex}${rowIndex}`).innerHTML = e.value
    })
  })
}

function computeNeighbours (colIndex, rowIndex) {
  // 0: top, 1: right, 2: down, 3: left
  return {
    0: (colIndex === 1 && rowIndex + 1 === 1) ? [null, null] : [colIndex, rowIndex >= 2 ? null : rowIndex + 1],
    1: (colIndex + 1 === 1 && rowIndex === 1) ? [null, null] : [colIndex >= 3 ? null : colIndex + 1, rowIndex],
    2: (colIndex === 1 && rowIndex - 1 === 1) ? [null, null] : [colIndex, rowIndex <= 0 ? null : rowIndex - 1],
    3: (colIndex - 1 === 1 && rowIndex === 1) ? [null, null] : [colIndex <= 0 ? null : colIndex - 1, rowIndex]
  }
}