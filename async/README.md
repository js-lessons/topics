# Асинхронность в JS
JavaScript является однопоточным, но асинхронным языком программирования. 
Асинхронность в данном случае достигается за счет наличия очереди выполнения (Event Loop). 
После выполнения какой-либо асинхронной операции, функция-колбэк, которая должна выполниться, попадает в конец очереди. 
И будет выполнена когда интерпретор выполнит все функции перед ней. 
Так же эта функция может запустить любую другую асинхронную операцию и передать колбэк, который в определённый момент времени попадет в конец очереди.

![js execution queue](./js-execution-queue.jpg)

Важно понимать, что если заблокировать эту очередь тяжелой операцией то остальные функции не будут выполнены пока не завершится эта операция.
Это называется заблокировать thread. Чтобы этого избежать нужно разбивать тяжелые операции на маленькие асинхронные функции.
Самый просто способ выполнить функцию асинхронно это с помощью `setTimeout`

```js
setTimeout(function() { console.log(2) }, 0)
setTimeout(function() { console.log(3) }, 0)
console.log(1)
```
Результат будет: 1 2 3

## Callback hell
Самый простой способ отреагировать на выполнение асинхронной опрерации это передать в неё функцию-callback, 
но когда нужно сделать несколько последовательных асинхронных операций код становится малочитабельным.

![callback hell](https://www.twilio.com/blog/wp-content/uploads/2017/03/Screen-Shot-2017-03-06-at-5.11.06-PM.png)


## I Promise, мир не будет прежним
Promise(обещание) - это объект который может находится в трёх состояниях:
* Pending - Асинхронная операция ещё не выполнена
* Fulfilld(Resolved) - Операция выполнена успешно
* Rejected - Операция выполнена с ошибкой

![promise](https://learn.javascript.ru/article/promise/promiseInit.png)

Пример создания промиса который вполнится через одну секунду 
```js
const waitOneSecond = new Promise(res => {
  setTimeout(res, 1000)
})

```

Пример созданий промиса который выполнится мгновенно но с вероятность 50\50 успешно или нет
```js
const random = new Promise((res, rej) => {
  Math.random() > .5 ? res() : rej()
})

```
Пример передачи результата выполнения промиса
```js
const deepThought = new Promise((res, rej) => {
  setTimeout(() => res(42), 1000)
})

```

В независимости от текущего состояния объекта мы можем добавлять выполнять на нём функции с помощью `then`.
`then` принимает в себя два параметра: 
* первый - функция которая будет выполнена когда объект перейдет в статус resolved
* второй - функция которая будет выполнена когда обхект перейдет в статус rejected
Если на момент вызова `then` объект уже имеет статус, то одна из функций будет вызвана сразу же(но асинхронно).
```js
const waitOneSecond = new Promise(res => {
  setTimeout(res, 1000)
})
waitOneSecond.then(() => alert('hello world'))

const random = new Promise((res, rej) => {
  Math.random() > .5 ? res() : rej()
})
random.then(
  () => alert('любит'),
  () => alert('не любит')
)

const deepThought = new Promise(res => {
  setTimeout(() => res(42), 1000)
})

deepThought.then(answer => alert(`Answer to the Ultimate Question of Life, The Universe, and Everything: ${answer}`))
```

### Promise chain
Результатом работы `then` является промис который будет переведён в следующий статус(resolved\rejected) в зависимости от того что вернула функция которая была выполнена внутри `then`.
```js
const waitOneSecond = () => new Promise(res => {
  setTimeout(res, 1000)
})

waitOneSecond()
  .then(() => 42)
  .then(answer => console.log('Deep Thought', answer))

```

Если результатом работы колбэка переданого в `then` будет промис. 
То следующая цепочка будет выполнена только после того как это промис будет выполнен и в зависимости от статуса выполнения будет выбран нужный колбэк.
Пример
```js
const waitOneSecond = () => new Promise(res => {
  setTimeout(res, 1000)
})

const random = () => new Promise((res, rej) => {
  Math.random() > .5 ? res() : rej()
})

waitOneSecond()
    .then(random)
    .then(
      () => console.log(':)'),
      () => console.log(':(')
    )

```

Если в ходе выполнения колбэка возникнет исключения, то будет вызван колбэк который обрабатывает rejected из следующего `then`
```js
const waitOneSecond = () => new Promise(res => {
  setTimeout(res, 1000)
})
waitOneSecond()
    .then(() => {
      throw "error ;("
    })
    .then(
      () => console.log('useless function'),
      (e) => console.log(e) // "error ;("
    )

```
### Catch 
Кроме `then` на промисе можно вызвать `catch`. Вызов `catch(fn1)` полностью еквивалентен вызову `then(null, fn1)`
```js
const waitOneSecond = () => new Promise(res => {
  setTimeout(res, 1000)
})
waitOneSecond()
    .then(() => {
      throw "error ;("
    })
    .catch(
      (e) => console.log(e) // "error ;("
    )

```
### Применение на практике

`fetch` в ES6 позволяет выполнять AJAX запрос и возвращает промис. Просми сначала будет выполненым с объектом `response`  
из которого можно получить ответ. В примере ниже `response.json()` вернет тоже промис, который будет выполнен когда овтет будет распаршен.

[Пример](https://jsfiddle.net/gpyq3u9h/)
```js
fetch('https://599abe5f0a23a100111004bb.mockapi.io/users/1') 
  .then(response => response.json()) // response.json() - Promise
  .then(user => console.log('User', user.name))
  .then(() => fetch('https://599abe5f0a23a100111004bb.mockapi.io/posts') )
  .then(response => response.json())
  .then(posts => console.log('Posts loaded', posts.length))
  .catch(e => {  	
  	console.log('Error', e)
  })
```
`catch` будет вызван не зависимо от того в каком запросе произошла ошибка в первом или во втором.
   
### Promise.all
Если данные нужно загрузить не последовательно а паралельно, можно использовать `Promise.all`. 
`Promise.all` принимает в себя массив который может содержать объекты любых типов и возвращает промис который будет 
разрезолвлен когда все объекты типа Promise в этом массиве будут разрезолвлены.

[Пример](https://jsfiddle.net/nrm02c3p/)
```js

const fetchUser = fetch('https://599abe5f0a23a100111004bb.mockapi.io/users/1') 
	.then(response => response.json())
  
const fetchPosts =  fetch('https://599abe5f0a23a100111004bb.mockapi.io/posts')
	.then(response => response.json())
  
Promise.all([fetchUser, fetchPosts])
  .then(
    ([user, posts]) => console.log('posts and users are loaded', user.name, posts.length)
  )
  .catch(e => {  	
  	console.log('Error', e)
  })

```

## Домашние задание

Разобраться с [примером](https://jsfiddle.net/nq8c1hsk/)

[Пример без промисов](https://jsfiddle.net/v0tsenuL/)

## Ресурсы

- [Официальная дока](https://learn.javascript.ru/promise)
- [Fetch](https://learn.javascript.ru/fetch)
