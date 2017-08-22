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

Экшн в Redux &mdash; это просто объект. Зачастую он хранит в себе уникальный тип экшна для простой идентификации и опциональные дополнительные данные (payload). Его можно диспатчить (отправлять на обработку редьюсерами) напрямую, а можно написать функцию, которая будет возвращать такой объект, и в `dispatch` передавать результат вызова этой функции.

Например. Где-то внутри компоненты

```js
dispatch({type: FLASH_SHOW, kind: 'success', text: 'it works!'})

// или

const displayAction = (kind, text) => ({
  kind, text, type: FLASH_SHOW
})

dispatch(displayAction('success', 'it works!'))
```

Store объеденяет в себе `dispatcher` и глобальное хранилище состояния.


### Получение данных внутри компоненты, Provider, connect

Для получения доступа к глобальному состоянию из компонент наше приложение должно быть обернуто в компоненту `Provider`

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './components/App'

const store = createStore(todoApp)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

Внутри нашего приложения любая компонента может получить доступ к глобальному хранилищу используя функцию `connect`. Эта функция создает компоненту высшего порядка, которая снабжает вашу компоненту указанными данными через `props`. Для указания какие именно данные нужны вашей компоненте используется первый параметр функции `connect`. В нем указывается какая именно часть глобального состояния нужна вашей компоненте и под какими именами.

```js
import React from 'react'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  todos: state.todos.collection,
  filters: state.filters
})

// const { todos, filters } = props
const DisplayTodos = ({todos, filters}) => (
  <div>
    ...
  </div>
)

export default connect(mapStateToProps)(DisplayTodos)
```


### Изменение данных из компоненты, dispatch, bindActionCreators

Любые изменения глобального состояния приложения делаются через экшны. В компоненте, декорированной функцией `connect`,`dispatch` становится доступным через `props`. Как уже обсуждалось выше экшны могут быть переданы в `dispatch` в виде объектов.


```js
import React from 'react'
import { connect } from 'react-redux'

// const { dispatch } = props
const DisplayTodos = ({dispatch}) => (
  <div>
    ...
    <a onClick={() => { dispatch({ type: 'ADD_TODO', text: this.input.value }) }}>
      Add todo
    </a>
  </div>
)

export default connect()(DisplayTodos)
```

Также в компоненту можно передать заранее определенный набор экшнов. Для этого используется второй параметр функции `connect`.

```js
import React from 'react'
import { connect } from 'react-redux'

const mapDispatchToProps = dispatch => ({
  addTodo: text => { dispatch({ type: 'ADD_TODO', text }) }
})

const DisplayTodos = ({addTodo}) => (
  <div>
    ...
    <a onClick={() => addTodo(this.input.text)}>
      Add todo
    </a>
  </div>
)

export default connect(null, mapDispatchToProps)(DisplayTodos)
```

Если экшн описан функцией (`actionCreator`), то можно использовать хелпер `bindActionCreators` для того, чтобы сразу получить набор действий, который пропускает `actionCreator` через `dispatch`.


```js
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

// actions/todos.js
const addTodo = text => ({
  type: 'ADD_TODO', text
})

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    addTodo
  }, dispatch)
)

const DisplayTodos = ({addTodo}) => (
  <div>
    ...
    <a onClick={() => addTodo(this.input.text)}>
      Add todo
    </a>
  </div>
)

export default connect(null, mapDispatchToProps)(DisplayTodos)
```

### Сайдэффекты, middleware и redux-thunk

Часто кроме изменения глобального состояния нам нужно отправить запрос на сервер. Подобную логику нельзя хранить ни в компонентах, ни в редьюсерах. Один из вариантов хранить ее в экшнах. Следовательно экшны могут быть не только объектами, но и функциями, промисами и т. д. Но тогда, скорее всего, в таком виде они будут бесполезными для редьюсеров и будут слушаться и преобразовываться в объекты в так навызваемом `middleware`. Чаще всего `middleware` нужны для обработки сайд эффектов.

Примеры middleware

```js
function thunkMiddleware({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action)
}
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

## Ресурсы

[Getting Started with Redux](https://egghead.io/courses/getting-started-with-redux)
[The Elm Architecture](https://guide.elm-lang.org/architecture/)
