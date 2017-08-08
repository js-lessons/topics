
Function.prototype.bind1 = function(context) {
  var fn = this
  var bindedArgs = Array.from(arguments).slice(1)
  return function() {
    return fn.apply(context, bindedArgs.concat(Array.from(arguments)))
  }
}

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

element.onClick(popup.show)

const showWithContext1 = popup.show.bind1(popup)
const showWithContext2 = popup.show.bind2(popup)

element.onClick(showWithContext1)
element.onClick(showWithContext2)

const showWithArgs1 = popup.show.bind1(popup, 'test')
const showWithArgs2 = popup.show.bind2(popup, 'test')

element.onClick(showWithArgs1)
element.onClick(showWithArgs2)