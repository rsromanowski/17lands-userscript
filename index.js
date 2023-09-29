// ==UserScript==
// @name        Filter 17Lands data
// @namespace   Violentmonkey Scripts
// @match       https://www.17lands.com/card_data
// @grant       none
// @version     1.2.0
// @author      rsromanowski
// @license     MIT
// @description Adds a input to quickly filter cards by name. Separate by commas to see multiple cards. Click `/` to quickly focus on input
// @require https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @require https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1
// ==/UserScript==

function prettify() {
  const toolbar = document.querySelector('div > div > select').parentElement.parentElement
  toolbar.style.cssText += " justify-content: space-between"

  const divs = document.querySelectorAll('#app > div > div')
  divs.forEach(d => d.classList.add('container'))
}

function filterTable(filter) {
  const columns = [
    { name: 'Name', index: 0, isFilter: true },
    { name: 'Color', index: 1, isFilter: false },
    { name: 'Rarity', index: 2, isFilter: false },
  ]

  const filterColumns = columns.filter(c => c.isFilter).map(c => c.index)

  const rarityRegex = new RegExp('r[:=]([curm])', 'i')
  const colorRegex = new RegExp('c[:=]([wubrgcm])', 'i')

  // Currently only one table on page
  // Headers are in thead
  const rows = document.querySelectorAll(`table > tbody > tr`)

  const clauses = filter.split(",")
  const rarityClauses = clauses.filter(c => rarityRegex.test(c))
  const colorClauses = clauses.filter(c => colorRegex.test(c))
  const nameClauses = clauses.filter(c => !rarityRegex.test(c) && !colorRegex.test(c))

  const orFilter = nameClauses.filter(f => f.trim().length > 0).map(f => f.trim()).join("|")
  const regex = new RegExp(`${orFilter}`, 'i')
  const isFoundInTds = td => regex.test(td.innerHTML)
  const isFound = childrenArr => childrenArr.some(isFoundInTds)
  const setTrStyleDisplay = ({ style, children }) => {
    style.display = isFound([
      ...filterColumns.map(c => children[c]) // <-- filter Columns
    ]) ? '' : 'none'
  }

  rows.forEach(setTrStyleDisplay)
}

function createQueryInput() {
  const div = document.querySelector('.main-text')
  const i = document.createElement('input')
  i.id = "q"
  i.className = "form-control"
  i.placeholder = 'Press \'/\' to focus. Search by partial card names. i.e. "Candy Grapple" or "candy,torch"'
  div.appendChild(i)

  i.addEventListener("input", (event) => { filterTable(event.target.value) })

  // Select all text of focus for quick overwrite
  i.addEventListener("focus", function () { this.select() })
}

VM.observe(document.body, () => {
  const table = document.querySelector('table')

  if (table) {
    createQueryInput()
    prettify()

    return true // disconnect observer
  }
})

VM.shortcut.register('/', () => {
  document.getElementById("q").focus()
})