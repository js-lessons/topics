# React.js в продакшне

## redux-saga

### redux-thunk не нужен

Проблем с redux-thunk несколько. Во-первых он вынуждает нас определять функции, создающие экшны (`actionCreators`), так как определять экшны, которые представляют из себя функции "на лету" затратно по производительности и нарушает принцип dry. Во-вторых логика, описывающая взаимодействие со стором скорее всего будет описана внутри коллбеков, что усложняет понимание работы программы. Ну и в-третьих для тестирования таких экшнов придется создавать моки или стабы вызывающихся внутри функций.

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

В данном примере мы слушаем `plain action` вида `{ type: ITEMS_FETCH_DATA, url: 'http://example.com/items.json' }`. При появлении такого экшна запускается обработчик `itemsFetchData`. Этот обработчик является JavaScript `генератором`. В нем сначала создается экшн, оповещающий нашу систему о том, что началась загрузка. Делается это с помощью `эффекта` `put`, который предопределен внутри библиотеки redux-saga. Он позволяет нам диспатчить экшны. Далее мы выполняем http запрос и сохраняем ответ в переменную. Здесь интересно то, что запрос делается без вызова fetch напрямую, а используя эффект `call`. Это позволяет нам написать тест, в котором мы полностью контролируем эффекты и их аргументы. В тестовом окружении вызова fetch не произойдет, так что нам не нужно создавать какие-либо заглушки. Далее происходит проверка ответа и вызов соответствующих экшнов.

В данном случае мы получили возможность использовать "плоские" экшны. Также из-за использования генераторов логика описывается без использования коллбеков. И из-за того, что все вызовы других функций и экшнов происходят с использованием эффектов мы получили полный контроль над телом генератора в тестовом окружении.

### effects

### generators

### testability
