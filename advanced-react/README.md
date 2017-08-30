# React.js в продакшне

## redux-saga

### Сайдэффекты

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


## Ресурсы

* [Документация к Redux-Saga](https://redux-saga.js.org/)
* [Генераторы и итераторы](https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Iterators_and_Generators)
