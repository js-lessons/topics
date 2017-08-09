/**
 * Функция которая генерирует новую функцию с "привязаным" к ней контекстом и аргументами
 * @param {Object} context - контекст к которому будет "привязана" функция
 * @returns {Function}
 */
Function.prototype.bind1 = function(context) {
  var fn = this
  var bindedArgs = Array.from(arguments).slice(1)
  return function() {
    return fn.apply(context, bindedArgs.concat(Array.from(arguments)))
  }
}

/**
 * Аналог предидущей функции но с использованием ES6 фишек
 * @param {Object} context   - контекст к которому будет "привязана" функция
 * @param {Array} bindedArgs - массив аргументов которые будут "привязаны" к функции
 * @returns {function(...[*]): *}
 */
Function.prototype.bind2 = function(context, ...bindedArgs) {
  return (...args) => this.apply(context, [...bindedArgs, ...args])
}

const popup = {
  text: 'Hello world!',
  show(prepand, append) {
    console.log(`${prepand} | ${this.text} | ${append}`)
  }
}

const element = {
  onClick(listener) {
    setTimeout(() => listener('click', 'element'), 1000)
  }
}

// в данном случае контекст будет потерян и this.text === undefined
element.onClick(popup.show)

const showWithContext1 = popup.show.bind1(popup)
const showWithContext2 = popup.show.bind2(popup)
// в данном случае контекст будет сохранён и this.text === 'Hello world!'
element.onClick(showWithContext1)
element.onClick(showWithContext2)

const showWithArgs1 = popup.show.bind1(popup, 'test')
const showWithArgs2 = popup.show.bind2(popup, 'test')
// в данном случае кроме контекста будут привязаны и параметры и this.text === 'Hello world!', prepand === 'test', append === 'click'
// значение 'element' прийдет третим параметром в функцию и не будет использовано в ней
element.onClick(showWithArgs1)
element.onClick(showWithArgs2)