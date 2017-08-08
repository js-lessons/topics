# Основы JavaScript

### Замыкания

Замыкание &mdash; это свойство функции сохранять значения свободных переменных,
доступных на момент определения функции. Очень часто сами функции
называют замыканиями.

[Пример](https://jsfiddle.net/dra1n/qu0h4d8x/)

```js
function init() {
  var name = "Mozilla"; // name is a local variable created by init
  function displayName() { // displayName() is the inner function, a closure
    alert(name); // displayName() uses variable declared in the parent function
  }
  displayName();
}
init();
```

С помощью замыканий можно эмулировать [приватные функции класса](https://jsfiddle.net/dra1n/bavvd107/),
сохранять [контекст](https://jsfiddle.net/dra1n/47srp5wt/) выполнения фунцкии и так далее.

```js
function fullName(firstName, lastName) {
  return firstName + " " + lastName
}

function Person(firstName, lastName) {
  this.firstName = firstName
  this.lastName = lastName
}

Person.prototype.sayHello = function() {
 // fullName is enclosed in Person#sayHello
 // acts kinda private method of class Person
  return "Hello, " + fullName(this.firstName, this.lastName)
}

var person = new Person('Vasya', 'Pupkin')

alert(person.sayHello())
```

```js
var myModule = {
  settings: 'module settings',
  bindHandlers: function() {
    var self = this

    $('a').on('click', function() {
      console.log(self.settings)
    })
  }
}
```

### Функция как конструктор

До появления ключевого слова `class` в стандарте EcmaScript для создания конструкторов объектов использовались функции.
Для того, чтобы отличать функции-конструкторы от обычных функций использовалось соглашение &mdash; именовать такие
функции в camel case.

[Пример](https://jsfiddle.net/dra1n/v4gsdmou/)

```js
function Person(name) {
  this.name = name
}

var person = new Person("Vasya")

alert(person.name)
```

### Прототипное наследование

У многих объектов JavaScript есть ссылка на прототип объекта. При обращении к какому-либо свойству объекта по имени сначала значение ищется среди собственных свойств объекта (`Object.hasOwnProperty('name')`). 3атем, если свойство не было найдено, поиск осуществляется в прототипе, затем в прототипе прототипа и так далее. С помощью этого механизма можно реализовать [наследование](https://learn.javascript.ru/class-inheritance). Функция конструктор позволяет нам добавить методы и свойства в прототип объектов.

[Пример](https://jsfiddle.net/dra1n/v4gsdmou/1/)

```js
function Person(name) {
  this.name = name
}

Person.prototype.dict = {
  'en': 'Hello',
  'es': 'Hola'
}

Person.prototype.sayHello = function(lang) {
  alert(this.dict[lang] + ", " + this.name)
}

var person = new Person("Vasya")

person.sayHello('es')
```

### Аргументы функции
В JavaScript любая функция может быть вызвана с произвольным количеством аргументов.
Доступ к переданым аргументам осуществляется через «псевдо-массив» `arguments`.

[Пример](https://jsfiddle.net/MihaChicken/4o00x0ej/)
```js
function sayHi() {
  for (var i = 0; i < arguments.length; i++) {
    alert( "Привет, " + arguments[i] );
  }
}

sayHi("Винни", "Пятачок");
```
Чтобы сделать из arguments честный массив, можно использовать `Array.from(arguments)`

Чтобы узнать сколько аргументов ожидает функция можно использовать свойство функции `length`

[Пример](https://jsfiddle.net/MihaChicken/gxuqgw3m/)
```js
function sum2(a, b) {
  return a + b 
}
function sum3(a, b, c) {
  return a + b + c
}

alert(sum2.length) // 2
alert(sum3.length) // 3
```


### bind, call, apply

В JavaScript есть понятие контекст вызова функции и обычно для обращения к контексту используют ключевое слово `this`.
`this` часто используется для доступа к текущему объекту из метода, также многие библиотеки (jQuery, React.js) дают доступ через `this` к инстансу события в обработчиках событий, определенных пользователем.

Контекст выполнения можно менять. Для этого используются методы `bind`, `call`, `apply`. `bind` позволяет привязать контекст и некоторые агрументы. Результатом вызова `bind` на функции является тоже функция.

[Пример](https://jsfiddle.net/dra1n/e06o1g7t/)

```js
function add(a) {
  return a + this.b
}

var numbers = {
  b: 5
}

var addNumbers = add.bind(numbers) // addNumbers is a function
var add10 = add.bind(numbers, 10) // bind context and first argument

alert(addNumbers(3))
alert(add10())
```

`call` и `apply` используются для вызова функции с определенным контекстом. Результатом вызова этих методов будет результат выполнения тела самой функции. Разница между ними в том, что первая принимает аргументы через запятую, а вторая в виде массива.

[Пример](https://jsfiddle.net/dra1n/w6vrcnk5/)

```js
function add(a) {
  return a + this.b
}

var numbers = {
  b: 5
}

alert(add.call(numbers, 3))
alert(add.apply(numbers, [10]))
```

### Arrow functions [(ES6)](http://exploringjs.com/es6/ch_arrow-functions.html)

Выражения стрелочных функций имеют более короткий синтаксис по сравнению с функциональными выражениями и лексически привязаны к значению `this` (но не привязаны к собственному `this`, `arguments`). Стрелочные функции всегда анонимные.

Пример 
```js

var square1 = function(n) { 
  return n * n; 
}
var square2 = (n) => {
  return  n * n;
}
var square3 = n => n * n

```
[Пример](https://jsfiddle.net/MihaChicken/gp0283t1/) использования `this`
```js

var o = {
  data: 1,
  f1: () => this.data,
  f2: function() {
    return this.data
  }
}

alert(o.f1()) // undefined
alert(o.f2()) // 1

```


### Деструктуризация [(ES6)](http://exploringjs.com/es6/ch_destructuring.html) и дефолтные значения[(ES6)](http://exploringjs.com/es6/ch_parameter-handling.html)

Деструктуризация позволяет извлекать данные из массивов или объектов и присваивать эти данные переменным используя специальный синтаксис.

[Пример](https://jsfiddle.net/dra1n/t7818dLb/) работы с объектами

```js
var o = { p: 42, q: true }
var { p, q } = o;

console.log(p); // 42
console.log(q); // true 

// Объявление новых переменных
var { p: foo, q: bar } = o;

console.log(foo); // 42
console.log(bar); // true
```

[Пример](https://jsfiddle.net/dra1n/b0pve4n1/) работы с массивами

```js
var a = [1, 2, 3, 4]

var [first, ...rest] = a

console.log(first) // 1
console.log(rest) // [2, 3, 4]
```

Также деструктуризацию можно использовать для разбора параметров функции

[Пример](https://jsfiddle.net/dra1n/sckteovn/)

```js
function userName({name = 'No Name'} = {}) {
  return name
}

console.log(userName({name: 'John'})) // 'John'
console.log(userName({email: 'john@example.com'})) // 'No Name'
console.log(userName()) //'No Name' все еще отработает, так как мы задали пустой объект {} в качестве пользователя по умолчанию
```

В параметрах функции можно указывать значения по умолчанию

[Пример](https://jsfiddle.net/dra1n/dn36vtqj/)

```js
function fullName(firstName, lastName = '') {
  return firstName + ' ' + lastName
}

console.log(fullName('John', 'Doe')) // 'John Doe'
console.log(fullName('Jonh Doe')) // 'John Doe' без параметра по умолчанию было бы 'Jonh Doe undefined'
```

Больше можно почитать на [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)


# Ресурсы

### JavaScript
- [ES6 tutorial](http://ccoenraets.github.io/es6-tutorial/) - устновка системы сборки и использование базовых фишек ES6
- [10 Interview Questions
   Every JavaScript Developer Should Know](https://medium.com/javascript-scene/10-interview-questions-every-javascript-developer-should-know-6fa6bdf5ad95)

### Вёрстка
- [Flexbox game tutorial](http://flexboxfroggy.com/) очень рекомендую
- [Flexbox guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [BEM guide](https://css-tricks.com/bem-101/)
