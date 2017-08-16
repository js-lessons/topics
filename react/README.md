# Основы React.js

Основная концепция React.js основывается на идеe Web Components (подробнее про саму идею можно почитать на [хабре](https://habrahabr.ru/post/210058/)).

Главное что нам нужно знать:
 - Всё приложение состоит из компонентов
 - Каждый компонент максимально переиспользуемый
 - Каждый компонент может быть использован сколько угодно раз на странице

### Определение React компонентов, функциональные компоненты

Чтобы создать новый компонент нам нужно создать новый класс который наследуется от класса Component
```jsx harmony
class Greeting extends React.Component {
  render() {
    return <h1 className="greeting">Hello world!</h1>;
  }
}

const element = <Greeting/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

Функция `ReactDOM.render` отрисует компонент на странице

### JSX
Babel компилирует JSX в обычный JS
```jsx harmony
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```
Результат:
```jsx harmony
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

### props vs state, глупые и умные компоненты, поток данных и событий

Есть два источника данных на основе которых генерируется представление &mdash; это свойства(props) и состояние(state):
- props попдают в компонент из родителя.
- state генерируется и изменяется внутри компонента.

#### Props

Пример передачи props
```jsx harmony
class Greeting extends React.Component {
  render() {
    const {name} = this.props
    return <h1>Hello, {name}</h1>;
  }
}

const element = <Greeting name="World!"/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

Пример передачи функции
```jsx harmony
class GreetingButton extends React.Component {
  render() {
    const {onClick, name} = this.props
    return <button onClick={onClick}>Click me, {name}!</button>;
  }
}

GreetingButton.propTypes = {
  onClick: React.PropTypes.func, 
  name: React.PropTypes.string, 
}

const element = <GreetingButton name="Vasya" onClick={() => {alert('Hello World!')}}/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

Важно помнить:
- props всегда read-only и не могут быть изменены внутри компонента
- Мы можем передать колбэк в компонент чтобы подписаться на событие
- Хорошая практика &mdash; всегда указывать типы props которые ожидает компонент

#### State
Пример работы с состоянием
```jsx harmony
class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      time: 0
    }
  }
  
  componentDidMount() {
    setInterval(() => {
      // this.setState({
      //   time: this.state.time + 1
      // })
      this.setState((state) => ({
        time: state.time + 1
      }))
    }, 1000)  
  }
  
  render() {
    const {time} = this.state
    return <h1>You have mounted this component {time} second(s) ago!</h1>;
  }
}

const element = <Timer/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```
Функция `this.setState` принимает в себя два аргумента: `updater` и `callback`

`updater` может быть объектом или функцией. В случае если это объект, то все его значения будут перенесены в стейт.
this.setState выполняется асинхронно, что означает что состояние будет обовленно через какое-то время после вызова этой функции 
и к этому моменту текущее состояние может уже изменится. Это особенно критично если новое состояние расчитывается исходя из старого.
Чтобы решить эту проблему `this.setState` может принимать первым параметром функцию которая будет вызвана с актуальным state и props 
прямо перед обновлением компонента и результатом работы этой функции должен быть обновленный стейт.

`callback` будет вызван после того как компонент будет обновлён.

#### props vs state

Сходства:
- и то и то js-объекты
- изменения генерирует перерисовку компонента
- играют определяющие значение на результат работы (render) компоненты

Различия:
- props определяется извне
- state определяется изнутри
- props immutable
- state - private

```jsx harmony
class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      time: this.props.initialTime || 0
    }
  }
  
  componentDidMount() {
    setInterval(
      () => this.setState(({time}) => ({ time: time + 1 }))
      , 1000)  
  }
  
  render() {
    const {time} = this.state
    return <h1>{this.props.message} {time} second(s) ago!</h1>;
  }
}

Timer.propTypes = {
  initialTime: React.PropTypes.number,
  message: React.PropTypes.string  
}

const element = <Timer initialTime={Math.abs(Date.now() / 1000)} message="01.01.1970 was"/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

#### глупые и умные компоненты
В зависимости от наличие state компоненты делятся на два типа:
- Stateless (глупые) - результат работы таких таких компонентов зависит только от props и их можно рассматривать как чистые функции,
потому что при одинаковом наборе props они всегда будут "возвращать" одинаковый результат. Такие компоненты легко переиспользовать и тестировать.
- Statefull (умные) - являются местами "концентрации" состояния в приложении, как следствие содержат логику работы с этим состоянием 
и обработку пользовательских событий.

Stateless компоненты можно объявлять в виде функций
```jsx harmony
const Greeting = ({name, official}) => (
  <h1>{official ? 'Hello my dear' : 'Hi'}, {name}!</h1>
)

Greeting.propTypes = {
  name: React.PropTypes.string,
  official: React.PropTypes.bool
}

ReactDOM.render(
  <Greeting name="World" official={true}/>,
  document.getElementById('root')
);
```
 
#### поток данных и событий
 Обычно, умные компоненты стараются держать как можно выше в дереве компонентов,
 чтобы покрыть стейтом как можно больше вложеных компонентов.
 
```jsx harmony
const Button = ({title, onClick, isDisabled}) => (
  <button 
    className={`button ${isDisabled ? 'button_disabled' : ''}`} 
    onClick={onClick}>
    {title}
  </button>
)

Button.propTypes = {
  title: React.PropTypes.string,
  onClick: React.PropTypes.func,
  isDisabled: React.PropTypes.bool
}

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.defaultValue || 0
    }
    
    this.increment = this.changeValue.bind(this, 1)
    this.decrement = this.changeValue.bind(this, -1)
  }
  
  changeValue(diff) {
    this.setState(({value}) => ({
      value: value + diff
    })) 
  }
  
  render() {
    const {value} = this.state
    return (
      <div>
        <Button title="-" onClick={this.increment} isDisabled={value === this.props.min}/>
        <span>{value}</span>
        <Button title="+" onClick={this.decrement} isDisabled={value === this.props.max}/>
      </div>
    )
  }
}

Counter.propTypes = {
  defaultValue: React.PropTypes.number,
  min: React.PropTypes.number,
  max: React.PropTypes.number
}
```
### v = f(s)
 
Важно понимать, что всё React приложение это функция которая на основе текущего состояния генерирует текущее представление.
 
 
### Методы жизненного цикла React компоненты

![react-lifecycle](https://staminaloops.github.io/undefinedisnotafunction/images/react-lifecycle.jpg)

В реакт компоненте можно реализовать методы которые будут вызваны на определённой стадии жизененного цикла компонента

#### Вот некоторые из них:
#### componentWillMount и componentDidMount
Вызываются перед и, соответсвенно, после того как компонент будет добавлен на страницу. 
Чаще всего используется для подгрузки дополнительных данных.
```jsx harmony
class Greeting extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = { name: '' }
  }
  
  componentDidMount() {
    fetch('http://names.com/42').then(name => this.setState({ name }))
  }
  
  render() {
    return <h1>Hello, {this.state.name}</h1>;
  }
}

ReactDOM.render(
  <Greeting/>,
  document.getElementById('root')
);
```

#### shouldComponentUpdate
Вызывается перед тем как компонент должен обновится. Метод принимает в себя параметрами новые значения state и props
и должен вернуть true или false в зависимости от того должен ли компонент обновится.
Используется для оптимизации производительности

Пример
```jsx harmony
class WhatEver extends React.Component {
  
  shouldComponentUpdate(nextProps) {
    return nextProps.someNumber % 5 !== this.props.someNumber % 5 
  }
  
  render() {
    const fooAmount = this.props.someNumber % 5
    return <div>{Array.from({length: fooAmount}).map(() => <h1>foo</h1>)}</div>;
  }
}

ReactDOM.render(
  <WhatEver someNumber={4}/>,
  document.getElementById('root')
);
```
В данном примере видно что при разных props результат отображения будет одинаковый, 
поэтому чтобы избежать ненужных манипуляций с VirtualDOM мы реализуем метод shpuldComponentUpdate

Главное помнить: Преждевременная оптимизация - корень всех зол (с)

#### componentWillUnmount
Вызывается перед тем как компонент будет удалён со страницы
Используется для очистки всего, что нужно за собой подчищать :)
```jsx harmony
class Timer extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = { time: 0 }
  }
  
  componentWillMount() {
    this.interval = setInterval(
      () => 
        this.setState((time) => ({time: time + 1}))
      , 1000)
  }
  
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  
  render() {
    return <h1>Time: {this.state.time}</h1>;
  }
}
```

## Домашнее задание
- [Пройти туториал](https://facebook.github.io/react/tutorial/tutorial.html)

## Ресурсы
- [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)
- [React Forms](https://facebook.github.io/react/docs/forms.html)
- [React Context](https://facebook.github.io/react/docs/context.html)
- [Lifting state up](https://facebook.github.io/react/docs/lifting-state-up.html)
- [React Comments JSFiddle](https://jsfiddle.net/dra1n/q8u0a3xh/)
- [React Comments Github](https://github.com/js-lessons/react-comments)
