const isNumber = num => typeof num == 'number'

const baseControls = {
  '←': 'left',
  '→': 'right',
  '↑': 'forward',
  '↓': 'backward',
  // 'Space:': 'jump',
  // 'Enter:': 'attack',
  // 'CapsLock:': 'run',
}

export default class GUI {
  constructor({
    scoreTitle = 'Score',
    subtitle = 'left',
    points = 0,
    total,
    controls = baseControls,
    messageDict,
    endText = 'Bravo!<br>Nothing left',
    showHighScore = false,
    useBlink = false,
    scoreClass = 'rpgui-button golden',
    controlsClass = '', // rpgui-button
    openControls = false,
    moreControls = {},
  } = {}) {
    this.scoreTitle = scoreTitle
    this.subtitle = subtitle
    this.points = points
    this.total = total
    this.controls = controls
    this.messageDict = messageDict
    this.endText = endText
    this.useBlink = useBlink
    this.openControls = openControls

    this.tempTextRendered = false
    this.playerDead = false

    this.gameScreen = document.createElement('div')
    this.gameScreen.className = 'central-screen'
    document.body.appendChild(this.gameScreen)

    this.addControls({ ...controls, ...moreControls }, controlsClass)

    if (scoreTitle) {
      this.scoreDiv = document.createElement('div')
      this.scoreDiv.className = `score ${scoreClass}`
      document.body.appendChild(this.scoreDiv)
      this.addScore(0, total)

      this.highScore = +localStorage.getItem(location.pathname)
      if (showHighScore) this.showHeighScore()
    }
  }

  reset() {
    this.points = 0
    this.renderScore(0, this.total)
    this.clearScreen()
  }

  /* GAME SCREEN */

  closeSoon(milliseconds = 3000) {
    setTimeout(() => {
      this.closeGameScreen()
      this.tempTextRendered = false
    }, milliseconds)
  }

  renderText(text, blink = false) {
    const blinkClass = blink ? 'blink' : ''
    const html = `<h3 class="${blinkClass}">${text}</h3>`
    if (this.gameScreen.innerHTML === html) return
    this.gameScreen.innerHTML = html
  }

  showMessage(message, blink, milliseconds) {
    if (this.tempTextRendered) return
    this.renderText(message, blink)
    this.closeSoon(milliseconds)
    this.tempTextRendered = true
  }

  showMotivationalMessage(left, points = this.points) {
    const message = this.messageDict[points]
    if (message) this.showMessage(message)
    if (left === 0) this.renderText(this.endText)
  }

  showBlinkingMessage({ message, time, messageInterval = 20 }) {
    if (!this.playerDead && Math.ceil(time) % messageInterval == 0)
      this.showMessage(message, true)
  }

  clearScreen() {
    this.closeGameScreen()
    this.gameScreen.onclick = undefined
  }

  closeGameScreen() {
    this.gameScreen.classList.remove('rpgui-container', 'framed', 'pointer')
    this.gameScreen.innerHTML = ''
  }

  openGameScreen(html) {
    this.gameScreen.classList.add('rpgui-container', 'framed', 'pointer')
    this.gameScreen.innerHTML = html
  }

  getStartScreen({ goals = [], title = 'Click to START!', subtitle = '' } = {}) {
    const li = goals.map(goal => `<li>${goal}</li>`).join('')

    return `
      <ul>${li}</ul>
      <h2>${title}</h2>
      ${subtitle}
    `
  }

  get endScreen() {
    return /* html */`
      <h2>You are dead.</h2>
      <p>Press Reload to play again</p>
    `
  }

  showGameScreen({ callback, autoClose = false, usePointerLock = false, ...params } = {}) {

    const getScreen = () => this.playerDead ? this.endScreen : this.getStartScreen(params)

    if (this.gameScreen.innerHTML === getScreen()) return

    this.openGameScreen(getScreen())

    // HANDLE CLICK
    this.gameScreen.onclick = e => {
      if (callback) callback(e)
      if (autoClose) this.clearScreen()
      if (usePointerLock) document.body.requestPointerLock() // gameLoop starts
    }

    // HANDLE POINTER LOCK
    if (usePointerLock) document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement)
        this.closeGameScreen()
      else
        this.openGameScreen(getScreen())
    })
  }

  showEndScreen(params = {}) {
    this.showGameScreen({ title: 'You are dead.', subtitle: 'Click here to start again', ...params })
  }

  showHeighScore() {
    if (this.highScore < 2) return
    this.showMessage(`Your current high score is ${this.highScore} points. Beat it!`)
  }

  /* CONTROLS */

  addControls(controls, controlsClass) {
    const div = document.createElement('div')
    div.className = 'controls'

    const button = document.createElement('button')
    button.className = controlsClass

    const content = document.createElement('div')
    content.className = 'rpgui-container framed'
    content.innerHTML = Object.keys(controls).map(key =>
      `<p><b>${key}</b> ${controls[key]}</p>`
    ).join('')

    const open = () => {
      content.style.display = 'block'
      button.innerHTML = 'CONTROLS &#9654;'
    }

    const close = () => {
      content.style.display = 'none'
      button.innerHTML = 'CONTROLS &#9660;'
    }

    if (this.openControls) open()
    else close()

    button.addEventListener('click', () => {
      if (content.style.display == 'none') open()
      else close()
    })

    div.appendChild(button)
    div.appendChild(content)
    document.body.appendChild(div)
  }

  /* SCORE */

  renderScore(points, left) {
    const blink = this.useBlink ? 'blink' : ''
    const subtitle = isNumber(left) ? `<br><small class="${blink}">${this.subtitle}: ${left}</small>` : ''

    const innerHTML = `
      <p>
        ${this.scoreTitle}: ${points}
        ${subtitle}
      </p>
    `
    if (this.scoreDiv.innerHTML === innerHTML) return

    this.scoreDiv.innerHTML = innerHTML

    if (this.messageDict) this.showMotivationalMessage(left, points)

    if (points > this.highScore)
      localStorage.setItem(location.pathname, points)
  }

  addScore(change = 1, left) {
    this.points += change
    this.renderScore(this.points, left)
  }

  /* UTILS */

  renderTime() {
    this.renderScore(Math.floor(performance.now() / 1000))
  }

  /* SCORE */

  update({ time, points, left, dead, blinkingMessage, messageInterval } = {}) {
    this.playerDead = dead
    this.renderScore(points, left)
    if (blinkingMessage) this.showBlinkingMessage({ time, message: blinkingMessage, messageInterval })
  }
}