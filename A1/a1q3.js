// global variables
let stateCollection = []
let totalSumArray = []
let totalSum = 0

// This function is the main function
function compute () {
  // Initializing ================================================
  // Extrating value from <input>
  // bs = S_0(s).
  // actions = sequence of actions
  // obs = sequence of observations
  const bs = extractValue('initialState')
  const actions = extractValue('actionSequence')
  const obs = extractValue('obsSequence')
  // stateCollection is a collection of belief state with index = [0,1,...,k]
  // totalSumArray is used for normalizing probability vectors
  stateCollection = []
  totalSumArray = []

  // Computation ==================================================
  // small safety check to validate we have appropriate arguments.
  if (safetyCheck(bs, actions, obs)) {
    // create intial belief state and add to array
    // If no initial state given, we consider all 9 grids else just 1 grid
    stateCollection.push(createPreset(bs))
    totalSumArray.push(bs.length === 0 ? 9 : 1)
    // Iterate through each actions
    actions.forEach((action, index) => {
      // Initialize total sum of this belief state for normalizing
      totalSum = 0
      const currentState = stateCollection[index]
      const newBeliefState = currentState.map((col, colIndex) => {
        return col.map((row, rowIndex) => {
          // Iterating through each grid in the matrix and assigning new values
          return Object.assign({}, row, {
            value: row.value !== -1 ? computeValue(row, action, obs[index], currentState) : -1
          })
        })
      })
      // Save values
      stateCollection.push(newBeliefState)
      totalSumArray.push(totalSum)
    })
    // Pretty cool dropdown I've made so that you can see how belief state looks like at iteration k
    populateDropdown()
    // Populate pre-generated grid with corresponding values.
    populateGrid(stateCollection.length - 1)
  }
}

// This function takes in 4 params and returns the new b'(s) of state s
// state = state of interest
// action = current action
// obs = observation made at current action
// currentState = the entire current belief state b(s)
function computeValue (state, action, obs, currentState) {
  // Calculating sensor probability.
  // Checks what we've observed at current action and see if it matches with state of interest
  const sensor = obs === -1 ? (state.numOfWalls === 0 ? 1 : 0) : (obs === state.numOfWalls ? 0.9 : state.numOfWalls !== 0 ? 0.1 : 0)
  // Calculating sum probablity of all states that can reach state of interest
  let sum = 0
  // ptlPrevState = potential previous state.
  // 'i' will help to start with adjacent grid of current action's direction on current state and iterate clockwise around adjacent grids of current state.
  // Example) (2,2) with action 'up' will start looking at (2,3) then (3,2),(2,1),(1,2)
  for (i = 0; i < 4; i++) {
    const ptlPrevState = state.adj[(action + i) % 4]
    // If the potential previous grid is a valid grid, add to computation since it's a possibility.
    // However, we exclude i = 0 because there's no way for the potential state to move into state of interest with current action.
    // We will consider cases when the adjacent state is a wall in else case
    if (ptlPrevState[0] !== null && ptlPrevState[1] !== null && i !== 0) {
      // Assuming in the perspective of the direction of the action taken, i = 2 means that the potential state is behind,
      // which also means that it's an intended move thus has 0.8 probablity.
      // Otherwise, it's a sideways movement thus has 0.1 probability.
      sum += currentState[ptlPrevState[0]][ptlPrevState[1]].value * (i === 2 ? 0.8 : 0.1)
    } else if (ptlPrevState[0] === null || ptlPrevState[1] === null) {
      // If there's a wall in the direction of the current action, that means that there's a potential the previous state being the current state.
      // This is because if there's a wall in the direction we wish to go, the state will be the same after taking action (assuming we have gone where we intended)
      // Otherwise, there's a potential it has moved sideways but hit a wall and ended up in the same state = 0.1 probablity
      // There's no way it's coming from a wall so ignore i = 2 (behind grid) case
      if (i === 0) {
        sum += state.value*0.8
      } else if (i !== 2) {
        sum += state.value*0.1
      }
    }
  }
  // add to total sum for normalization later and return calculated belief state at state s.
  totalSum += sensor*sum
  return sensor*sum
}

// Creates initial belief state.
function createPreset (bs) {
  let presetGrid = [ [{},{},{}], [{},{},{}], [{},{},{}], [{},{},{}]]
  return presetGrid.map((col, colIndex) => {
    return col.map((row, rowIndex) => {
      // creating null block for (1,1)
      if (colIndex === 1 && rowIndex === 1) {
        return {value: -1}
      }
      /* state = {
        id: (column, row)
        value: 0 for terminal, or 1 otherwise
        adj: adjacent grids
        numOfWalls: number of walls the state has. If it's terminal give it 0 since we know it's terminal state with certainty.
      }*/
      return {
        id: [colIndex, rowIndex],
        value: (colIndex === 3 && rowIndex > 0) ? 0 : bs.length === 0 ? 1 : (bs[0] === colIndex && bs[1] === rowIndex ? 1 : 0),
        adj: computeNeighbours(colIndex, rowIndex),
        numOfWalls: (colIndex === 3 && rowIndex > 0) ? 0 : colIndex === 2 ? 1 : 2
      }
    })
  })
}

// state index = [column, row]
// If any of column or row is null, that means it's not a valid state (out of bounds/block thus out of computation)
// index of this object corresponds to the following => 0: top, 1: right, 2: down, 3: left
function computeNeighbours (colIndex, rowIndex) {
  return {
    0: (colIndex === 1 && rowIndex + 1 === 1) ? [null, null] : [colIndex, rowIndex >= 2 ? null : rowIndex + 1],
    1: (colIndex + 1 === 1 && rowIndex === 1) ? [null, null] : [colIndex >= 3 ? null : colIndex + 1, rowIndex],
    2: (colIndex === 1 && rowIndex - 1 === 1) ? [null, null] : [colIndex, rowIndex <= 0 ? null : rowIndex - 1],
    3: (colIndex - 1 === 1 && rowIndex === 1) ? [null, null] : [colIndex <= 0 ? null : colIndex - 1, rowIndex]
  }
}

// Extrating Value given element Id
function extractValue (id) {
  return document.getElementById(id).value.split(',').map(i => i === '' ? '' : parseInt(i.trim())).filter(i => i !== '')
}

// Simple safety check
function safetyCheck (bs, actions, obs) {
  return actions.length === obs.length && (bs.length === 0 || bs.length === 2) && bs.every(e => !isNaN(e)) && actions.every(e => !isNaN(e)) && obs.every(e => !isNaN(e))
}

// Populating a dropdown so users can view belief state at iteration k
function populateDropdown () {
  const dropdownItems = stateCollection.map((val, i) => {
    return `<a class="dropdown-item" id='${i}' onclick='populateGrid(this.id)'>${i}</a>`
  }).join('')
  document.getElementById('iteration').innerHTML = dropdownItems
}

// Populating grid with belief state at iteration k
function populateGrid (index) {
  stateCollection[index].forEach((row, colIndex) => {
    row.forEach((e, rowIndex) => {
      // (1,1) is block grid
      if (rowIndex === 1 && colIndex === 1) return
      // Normalizing Probablity vector by the total sum of all grid at iteration k
      document.getElementById(`${colIndex}${rowIndex}`).innerHTML = (e.value/totalSumArray[index]).toPrecision(5)
    })
  })
}

