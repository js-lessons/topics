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
