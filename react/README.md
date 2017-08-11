# Основы React.js

Основная концепция React.js основывается на идеи Web Components (подробнее про саму идею можно почитать на [хабре](https://habrahabr.ru/post/210058/)).

Главное что нам нужно знать:
 - Всё приложение состоит из компонентов
 - Каждый компонент максимально переиспользуемый
 - Каждый компонент может быть использован сколько-угодно раз на странице

### Определение React компонент, функциональные компоненты

Чтобы создать новый компонент нам нужно создать новый класс который наследуется от класса Component
```jsx harmony
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
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


### v = f(s, p)

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
  
  componentWillMount() {
    fetch('http://names.com/42').then(name => this.setState({ name }))
  }
  
  render() {
    return <h1>Hello, {this.state.name}</h1>;
  }
}

const element = <Greeting/>;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

#### shouldComponentUpdate


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

## Ресурсы
