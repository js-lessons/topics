# React.js в продакшне

## context

Контекст это способ передать данные из компонента родителя во все вложенные компоненты, не зависимо от уровня вложености.

Проблема которую контекст решает: доступ к глобальным данным приложения (локализация, стилизация, глобальный state и т.д.)

Проблемы которые контекст создаёт: 
- Так или иначе контекст является глобальным, а всё что глобальное - плохо
- Компонент завязаный на котекст становится менее переиспользуемыемым, потому что теперь мы его можем использовтаь только в определённом контексте.
- Такой компонент тяжелее тестировать (Кроме свойств нам приходится думать и про контекст)
- Цепочка обновлений при изменении контекста может быть прервана методом shouldComponentUpdate компонента, который не знает о контексте

Поэтому не рекомендуется использвать контекст, если на это нету действительно весомой причины (например свой фреймворк).

Пример из [официальной документации](https://facebook.github.io/react/docs/context.html)  
```jsx harmony
const PropTypes = require('prop-types');

class Button extends React.Component {
  render() {
    return (
      <button style={{background: this.context.color}}>
        {this.props.children}
      </button>
    );
  }
}

Button.contextTypes = {
  color: PropTypes.string
};

class Message extends React.Component {
  render() {
    return (
      <div>
        {this.props.text} <Button>Delete</Button>
      </div>
    );
  }
}

class MessageList extends React.Component {
  getChildContext() {
    return {color: "purple"};
  }

  render() {
    const children = this.props.messages.map((message) =>
      <Message text={message.text} />
    );
    return <div>{children}</div>;
  }
}

MessageList.childContextTypes = {
  color: PropTypes.string
};
```
## HoC

High order Components - компоненты высшего порядка или компоненты-обёртки. Позволяют нам вынести функционал из одного компонента обернув его в другой компонент.

### HoC как инструмент композиции и решение проблем с дублированием кода
[Пример](https://jsfiddle.net/2f0wgku5/) HoC, который слушает событие изменения размера окна и передает актуальную высоту окна в обёрнутый компонент.
```jsx harmony
function screenSizeHoC(WrappedComponent) {
  return class ScreenSize extends React.Component {
    constructor(props) {
      super(props)
      
      this.state = {
        screenWidth: document.body.clientWidth
      }
      this.handleScreenResize = this.handleScreenResize.bind(this)
    }
    
    componentDidMount() {
      window.addEventListener('resize', this.handleScreenResize)
    }
    
    componentWillUnmount() {
      window.removeEventListener('resize', this.handleScreenResize)      
    }
    
    handleScreenResize() {
      this.setState({screenWidth: document.body.clientWidth})
    }    
    
    render() {
      return <WrappedComponent {...this.props} screenWidth={this.state.screenWidth}/>
    }
  }
}
```
### HoC и решение проблем с контекстом
HoC можно использовать для того чтобы инкапсулировать работу с контекстом внутри специального компонента который будет знать о контексте и передавать его в обёрнутый компонент через props
Таким образом компонент станет более переиспользуемым(мы сможем использовать его как с контекстом(с помощью HoC) так и передавать props напрямую(без HoC))

```jsx harmony
export default function(WrappedComponent) {
  return class WithStyle extends Component {

    static contextTypes = {
      style: PropTypes.object
    }

    render() {
      return <WrappedComponent {...this.props} style={this.context.style || {}}/>
    }
  }
}
```
Также HoC нужно использовать чтобы избежать проблемы с shouldComponentUpdate. 
В этом случае HoC должен быть подписан на изменения контекста через промежуточный объект observer. 
Поробнее можно почитать в [статье](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076) от создателя MobX.


## redux-saga

### Сайдэффекты

> Now, to a functional programmer, effects are scary in a [xenomorph kind of way](https://www.google.com.au/search?q=xenomorph). Nothing messes with functional purity quite like the need for side effects. On the other hand, effects are marvelous because they move the app forward. Without them, an app stays stuck in one state forever, never achieving anything.

> [Re-freame docs](https://github.com/Day8/re-frame)

Если наше приложение при каждой перезагрузке страницы стартует с нулевого состояния и все действия пользователя меняют только стор, то в таком приложении нет никаких побочных эффектов и действия можно описать плоскими объектами. Сайдэффекты проявляются как только нам нужно синхронизироваться (достать либо сохранить данные) с сервером или с каким-либо хранилищем помимо стора. Всю логику взаимодействия с сервером можно реализовать внутри компонент, но это нарушает DRY принцип и усложняет тестирование. Поэтому ее обычно выносят в redux middleware.

### redux-thunk не нужен

Проблем с redux-thunk несколько. Во-первых он вынуждает нас всегда определять функции, создающие экшны (`actionCreators`). Во-вторых логика, описывающая взаимодействие со стором скорее всего будет описана внутри коллбеков, что усложняет понимание работы программы. Ну и в-третьих для тестирования таких экшнов придется создавать моки или стабы вызывающихся внутри функций.

```js
export function itemsFetchData(url) {
  return (dispatch) => {
    dispatch(itemsIsLoading(true))                            // Вызов экшна

    fetch(url)                                                // Нужно стабить fetch
    .then((response) => {
      if (!response.ok) {
      throw Error(response.statusText)
    }
    dispatch(itemsIsLoading(false))
      return response;
    })
    .then((response) => response.json())
    .then((items) => dispatch(itemsFetchDataSuccess(items)))  // Вызов экшна на другом
    .catch(() => dispatch(itemsHasErrored(true)))             // уровне вложенноcти
  }
}
```

Вот как бы это выглядело с использованием `redux-saga`

```js
import { call, put, takeEvery } from 'redux-saga/effects'
import { ITEMS_FETCH_DATA, itemsIsLoading, itemsHasErrored } from '../actions/items'

export function *itemsFetchData({url}) {
  yield put(itemsIsLoading(true))
  
  const response = yield call(fetch, url)
  
  if (response.ok) {
    yield put(itemsIsLoading(false))
  } else {
    yield put(itemsHasErrored(true))
  }
}

export function *watchItems() {
  yield [takeEvery(ITEMS_FETCH_DATA, itemsFetchData)]
}

```

В данном примере мы слушаем `plain action` вида `{ type: ITEMS_FETCH_DATA, url: 'http://example.com/items.json' }`. При появлении такого экшна запускается обработчик `itemsFetchData`. Этот обработчик является JavaScript `генератором`. В нем сначала создается экшн, оповещающий нашу систему о том, что началась загрузка. Делается это с помощью `эффекта` `put`, который определен внутри библиотеки redux-saga. Он позволяет нам диспатчить экшны. Далее мы выполняем http запрос и сохраняем ответ в переменную. Здесь интересно то, что запрос делается без вызова fetch напрямую, а используя эффект `call`. Это позволяет нам написать тест, в котором мы полностью контролируем эффекты и их аргументы. В тестовом окружении вызова fetch не произойдет, так что нам не нужно создавать какие-либо заглушки. Далее происходит проверка ответа и вызов соответствующих экшнов.

В данном случае мы получили возможность использовать "плоские" экшны. Также из-за использования генераторов логика описывается без использования коллбеков. И из-за того, что все вызовы других функций и экшнов происходят с использованием эффектов мы получили полный контроль над телом генератора в тестовом окружении.

### Генераторы

Генераторы &mdash; новый вид функций в современном JavaScript. Они отличаются от обычных тем, что могут приостанавливать своё выполнение, возвращать промежуточный результат и далее возобновлять его позже, в произвольный момент времени. Подробнее почитать можно [тут](https://learn.javascript.ru/generator).

[Пример](https://jsfiddle.net/dra1n/h6s4b6Lw/)

```js
function* generateSequence() {
  yield 1
  yield 2
  return 3
}

const generator = generateSequence()

console.log(generator.next()) // {value: 1, done: false}
console.log(generator.next()) // {value: 2, done: false}
console.log(generator.next()) // {value: 3, done: true}
```

Имея ссылку на генератор мы контролируем момент, когда `yield` вернет результат. Таким образом можно эмулировать синхронность в асинхронном коде.

[Еще пример](https://jsfiddle.net/dra1n/uok446v4/)

```js
function async(makeGenerator) {
  return function() {
    const generator = makeGenerator()

    function handle(result) {
      // result => { done: [Boolean], value: [Object] }
      if (result.done) {
        return Promise.resolve(result.value)
      }

      return Promise.resolve(result.value).then(res => {
        return handle(generator.next(res))
      }, err => {
        return handle(generator.throw(err))
      })
    }

    try {
      return handle(generator.next())
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

function call(fn, ...args) {
  return fn.apply(null, args)
}

function delay(time = 500, result = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result)
    }, time)
  })
}

function* generateSequence() {
  const waitMore = yield call(delay, 2000, 1000)
  console.log(waitMore) // 1000

  const result = yield call(delay, waitMore, '42')
  console.log(result) // '42'

  return 3
}

const sequence = async(generateSequence)

sequence().then(r => console.log(r))

```

### Тестируемость

В тестовом окружении эффекты не производят вызовов функций, что значительно упрощает тестирование. Так как нужно просто проверить, что был применен нужный эффект. В то же время эффекты представляют из себя простые JavaScript объекты.

```js
console.log call(fetchCollection, 'demands')

/*
{
  @@redux-saga/IO: true,
  CALL: {
    fn: fetchCollection
    context: null,
    args: ['demands']
  }
}
*/
```

```js
console.log(put({ type: MY_CRAZY_ACTION }))

/*
{
  @@redux-saga/IO: true,
  PUT: {
    channel: null,
    action: {
      type: 'MY_CRAZY_ACTION'
    }
  }
}
 */
```

Пример тестирования

```js
const gen = fetchCollectionSaga()

// ...

expect(gen.next()).toEqual(call(fetchCollection, 'demands'))
expect(gen.next()).toEqual(put({ type: MY_CRAZY_ACTION }))
```

## Reducers as BD, selectors as Materialized Views

Если представить глобальный стор некоторой базой данных, то функцию маппинга стейта на свойства компоменты, которою мы передаем в `connect`, можно считать запросом к этой базе данных. В большинстве случаев это простые запросы, которые не содержат никакой логики, не несут никакого оверхеда, то есть не нуждаются в оптимизации, так же не нуждаются в тестах и могут быть определены в тех же файлах, что и компоненты.

Пример обращения к глобальному стору

```js
const mapStateToProps = state => ({
  users: state.users                   // SELECT * FROM users
})

class UsersList extends Component {
  // ...
}

connet(mapStateToProps)(UsersList)
```

Но иногда логика в `mapStateToProps` бывает более сложной. Например нужно сгрупировать данные из нескольких редьюсеров, или каким-либо образом видоизменить, агрегировать или отфильтровать. В таком случае функцию маппинга уже нужно описать оттдельно от компоненты, протестировать и оптимизировать. Все это позволяет делать библиотека [Reselect](https://github.com/reactjs/reselect)

```js
import { createSelector } from 'reselect'

const getVisibilityFilter = (state) => state.visibilityFilter
const getTodos = (state) => state.todos

export const getVisibleTodos = createSelector(
  [ getVisibilityFilter, getTodos ],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_ALL':
        return todos
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed)
    }
  }
)
```

## Тестирование с Jest, снепшот тестирование

[Jest](https://facebook.github.io/jest/) &mdash; библиотека для тестирования, разработанная в facebook. В ней есть стандартный набор фич, который есть практически в каждой подобной библиотеке &mdash; возможность создавать моки функций и объектов, набор матчеров, возможность тестировать асинхронный код. Но также Jest пропогандирует интересный подход к тестированию React компонент &mdash; снепшот тестирование.

Это подход при котором мы приводим компоненту к некоторому состоянию (например при помощи эмуляции действий пользователя), а потом ее сериализуем и сохраняем в файл (создаем снепшот). После этого этот снепшот становится эталонным и если при следующем запуске теста компонента сериализуется в какое-то другое состояние, то тест не проходит. Если же падение теста произошло из-за преднамеренных действий разработчика, например из-за того, что поменялся тест, то Jest дает возможность перегенерировать снепшот.

На самом деле таким образом можно тестировать не только React компоненты, но и любые сериализуемые данные.

Пример теста

```js
import React from 'react'
import Link from '../Link.react'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer.create(
    <Link page="http://www.facebook.com">Facebook</Link>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
```


## Redux dev-tools, redux-logger

Redux DevTools Extension &mdash; незаменимая вещь в работе над большим приложением. Отображает все происходящее в приложении &mdash; все действия, их дополнительные данные и то, как они меняют состояние. Уже после двух месяцев работы над приложением все его глобальное состояние перестает укладываться в голове и то, что за пару кликов можно просмотреть все дерево и историю того, каким образом оно было получено, экономит кучу времени. Если нет возможности использовать расширение, то можно воспользоваться чуть менее легковесной и соответсвенно менее функциональной библиотекой redux-logger, которая представляет из себя Redux middleware.


## Storybook

[Storybook](https://github.com/storybooks/storybook) &mdash; это интерактивная среда для разработки UI компонент. Которая лекго превращается в документацию и стайлгайд после того как компонента будет написана. Также может служить средой для тестирования в нескольких смыслах. В Storybook легко проводить эксперименты, если какая-то компонента сломалется, то это можно будет сразу заметить. Ну и описания компонент для Storybook можно автоматически превратить в снепшот тесты. Для этого есть [инструменты](https://github.com/storybooks/storybook/tree/master/addons/storyshots). И еще важно то, что компоненты, изначально написанные с использованием Storybook обладают очень низкой связанностью, так как писались в изоляции. Это значительно улучшает возможности переиспользования и тестирования.

## propTypes, eslint, prettier, prettier-eslint

`propTypes` и `eslint` вросят немного порядка в тот хаос, который представляет из себя динамически типизированный JavaScript. Есть несколько способов привнести систему типов в JavasScript &mdash; использовать [TypeScript](https://www.typescriptlang.org/) или [Flow](https://github.com/facebook/flow), но можно начать совсем с малого и использовать `propTypes`.

Наибольшую пользу `eslint` будет приностить будучи встроенным в редактор. Таким образом отзыв будет максимально быстрым и глупые ошибки будут исправляться сразу же. Ну и возвращаясь к `propTypes`, eslint можно настроить так, что он будет выдавать ошибку если внутри компоненты будет использовано какое-либо свойство, не указанное в `propTypes`. Более того, можно попробовать использовать `eslint` с ключом `--fix`. Что будет автоматически исправлять ошибки линтинга, в основном связанные с форматированием.

Если хочется вообще автоматизировать форматирование, тем самым убрав целый пласт ошибок, которые обычно пытаются исправить во время код ревью, то можно использовать [prettier](https://github.com/prettier/prettier). Есть способ заставить его работать по заранее определенным `eslint` правилам с помощью [prettier-eslit](https://github.com/prettier/prettier-eslint).

## Ресурсы

* [What about the context issue](https://stackoverflow.com/questions/36428355/react-with-redux-what-about-the-context-issue) Den Abramov (Redux creator) answer
* [How to safely use react context](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076) Michel Weststrate (MobX creator) article
* [Документация к Redux-Saga](https://redux-saga.js.org/)
* [Генераторы и итераторы](https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Iterators_and_Generators)
* [Jest Getting Started](https://facebook.github.io/jest/docs/en/getting-started.html)
* [Jest Snapshot Testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html)
* [React Casts](https://www.youtube.com/channel/UCZkjWyyLvzWeoVWEpRemrDQ) 