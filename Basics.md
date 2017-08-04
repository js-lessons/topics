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
