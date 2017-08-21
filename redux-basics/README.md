# Основы Redux

### Глобальная идея &mdash; храним все в одном месте

В Redux, в отличие от других библиотек, реалезующих flux паттерн, все состояние хранится в одном объекте. Изначально это было сделано чтобы упростить так называемое путешествие во времени, то есть простой переход между различными состояниями приложения, полученными, например, с помощью каких либо действий юзера (ввода данных, кликов и т. д.) Так же важно, что состояние приложения не хранится в какой-либо структуре, созданной автором приложения, что изначально упрощало горячую перезагрузку кода.

В итоге мы имеем глобальное состояние приложения в одном объекте и несколько сущностей и подходов для упрощения доступа к нему из компонент приложения и упрощения их обновления.

Схема для лучшего понимания

![Redux scheme](http://dev-city.me/wp-content/uploads/2017/03/redux-unidir-ui-arch.jpg "Redux scheme")

### Store, Actions, Reducers

Редьюсеры в Redux &mdash; это функции, описывающие мутации. Аргументами являются текущее состояние и `action`. Всегда должны возвращать состояние, новое или неизмененное старое. Если нужно вернуть новое состояние, то это должна быть новая структура, а не измененная старая. Если, например, состояние &mdash; это объект и мы добавили в него еще пару ключ/значение и вернули этот объект из редьюсера, то изменений никто не увидит.

[Пример редьюсера](https://jsfiddle.net/dra1n/s6sd2j9x/)

```js
const FLASH_SHOW = 'FLASH_SHOW'
const FLASH_HIDE = 'FLASH_HIDE'

const initialState = {
  active: false,
  kind: '',
  text: ''
}

const flash = (state = initialState, action) => {
  switch(action.type) {
  case FLASH_SHOW:
    return {
      active: true,
      kind: action.kind,
      text: action.text
    }
  case FLASH_HIDE:
    return initialState
  default:
    return state
  }
}

console.log(flash(initialState, {type: FLASH_SHOW, kind: 'success', text: 'it works!'}))
```

Экшн в Redux &mdash; это просто объект. Из-за этого можно диспатчить его напрямую, а можно написать функцию, которая будет возвращать такой объект.

Например. Где-то внутри компоненты

```js
dispatch({type: FLASH_SHOW, kind: 'success', text: 'it works!'})

// или

const displayAction = (kind, text) => ({
  kind, text, type: FLASH_SHOW
})

dispatch(displayAction('success', 'it works!'))
```

Экшны на самом деле могут быть не только объектами, но и функциями, промисами и т. д. Но тогда, скорее всего, в таком виде они будут бесполезными для редьюсеров и будут слушаться и преобразовываться в объекты в так навызваемом `middleware`. Чаще всего middleware нужны для обработки всяческих сайд эффектов.

Примеры middleware

```js
function thunkMiddleware({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action)
}

module.exports = thunkMiddleware
```

```js
function loggerMiddleware(store) {
  return next => action => {
    console.log(action.type)
    return next(action)
  }
}
```

```js
function promiseMiddleware(store) {
  return next => action => {
    if (typeof action.then !== 'function') {
      return next(action)
    }
    
    return Promise.resolve(action).then(store.dispatch)
  }
}
```
