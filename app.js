const util = require('util')
const readlineSync = require('readline-sync')
const nations = require('./data/nations.json')
const players = require('./data/players.json')
const teams = require('./data/teams.json')

const mappingPlayers = (key, value) => {
  return players
    .filter(
      (player) =>
        String(player[key]).toLowerCase() === String(value).toLowerCase()
    )
    .map((player) => ({
      ...player,
      team: teams.find((i) => i._id === player.team_id).name,
      nation_name: nations.find((i) => i._id === player.nation_id).name
    }))
}

const mappingTeams = (key, value) => {
  return teams
    .filter(
      (team) => String(team[key]).toLowerCase() === String(value).toLowerCase()
    )
    .map((team) => ({
      ...team,
      nation_name: nations.find((nation) => nation._id === team.nation_id)
        ?.name,
      players: players
        .filter((player) => player.team_id === team._id)
        .map((player) => player.name)
    }))
}

const mappingNations = (key, value) => {
  return nations
    .filter(
      (nation) =>
        String(nation[key]).toLowerCase() === String(value).toLowerCase()
    )
    .map((nation) => ({
      ...nation,
      teams: teams
        .filter((team) => team.nation_id === nation._id)
        .flatMap((item) => mappingTeams('_id', item._id))
    }))
}

function showResult(option) {
  const options = {
    '1': { name: 'Players', func: mappingPlayers, keys: players[0] },
    '2': { name: 'Teams', func: mappingTeams, keys: teams[0] },
    '3': { name: 'Nations', func: mappingNations, keys: nations[0] }
  }
  while (true) {
    const searchTerm = readlineSync.question('Enter search term\n')
    if (searchTerm?.toLowerCase() === 'quit') {
      return 'quit'
    } else if (!Object.keys(options[option].keys).includes(searchTerm)) {
      console.log(`${searchTerm} does not exist in ${options[option].name}`)
    } else {
      const searchValue = readlineSync.question('Enter search value\n')
      if (searchValue?.toLowerCase() === 'quit') return 'quit'
      const getOptions = options[option].func || (() => [])
      const data = getOptions(searchTerm, searchValue)
      const result =
        data.length > 0 ? (data.length > 1 ? data : data[0]) : 'No Result'
      console.log(
        '=> Result:\n',
        util.inspect(result, {
          maxArrayLength: null,
          depth: null,
          colors: true
        })
      )
      break
    }
  }
}

function handleSearch() {
  console.log("Type 'quit' to exit at any time. Press 'Enter' to continue\n")

  while (true) {
    const input = readlineSync.question(
      "Select search options:\n- Press 1 to search\n- Press 2 to view a list of searchable fields\n- Type 'quit' to exit\n"
    )
    if (input?.toLowerCase() === 'quit') {
      return
    } else if (input === '1') {
      while (true) {
        const searchOption = readlineSync.question(
          'Select 1: Players or 2: Teams or 3: Nations\n'
        )
        if (searchOption?.toLowerCase() === 'quit') {
          return
        } else if (!['1', '2', '3'].includes(searchOption)) {
          console.log('Invalid Option. Please try another one')
        } else {
          const result = showResult(searchOption)
          if (result === 'quit') return
          break
        }
      }
    } else if (input === '2') {
      while (true) {
        const searchOption = readlineSync.question(
          'Select 1: Players or 2: Teams or 3: Nations\n'
        )
        const options = {
          '1': { name: 'Players', fields: Object.keys(players[0]) },
          '2': { name: 'Teams', fields: Object.keys(teams[0]) },
          '3': { name: 'Nations', fields: Object.keys(nations[0]) }
        }

        if (searchOption?.toLowerCase() === 'quit') {
          return
        } else if (!options[searchOption]?.fields) {
          console.log('Invalid input. Please select a valid option.')
        } else {
          const fields = options[searchOption].fields.join('\n')
          console.log(
            `=> Result:\nSearch ${options[searchOption].name} with\n${fields}`
          )
          break
        }
      }
    } else {
      console.log('Invalid input. Please select a valid option.')
    }
  }
}

handleSearch()
module.exports = {
  mappingPlayers,
  mappingTeams,
  mappingNations,
  showResult,
  handleSearch
}
