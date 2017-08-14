# Модули

### Дефолтный и именованый экспорт

В JavaScript файле можно определить и экспортировать какие угодно сущности &mdash; функции, объекты, массивы, строки, числа и т. д. Существует два вида экспорта данных из файла &mdash; дефолтный и именованый. Когда какой экспорт использовать решает сам разработчик, и во многом это зависит от того, как он хочет в последствии импортировать эти данные.

Если файл определяет одну какую-то сущность, то имеет смысл создавать только дефолтный экспорт.

Например конфигурацию

```js
const config = {
  'DROPBOX_APP_KEY': '9jllu8tn',
  'CONTACT_REQUEST_URL': 'http://cookbox-contact.herokuapp.com/message'
}

export default config
```

Или React компоненту

```js
class Flash extends Component {
  render() {
    return <div className='flash'>
      { this.props.flash.text }
    </div>
  }
}

export default Flash
```

Импорт данных в таком случае будет выглядеть следующим образом

```js
import appConfig from './config'
import Flash from './flash'
```

Здесь видно, что сущности, экспортированные как дефолтные, не обязательно называть так-же, как они были названы в исходном файле. И путь к импортируемому файлу должен быть всегда относительный (можно конечно сделать и абсолютным, но это чревато проблемами).

Именованый экспорт можно использовать в случае когда в файле определяется несколько равноценных сущностеть. Например это файл с набором хелперов или констант.

```js
export const isDefined = v => typeof v !== 'undefined'
export const isUndefined = v => !isDefined(v)
export const isServer = () => !(isDefined(window) && window.document)
```

```js
export const UPDATE_DEMANDS_REQUEST = 'UPDATE_DEMANDS_REQUEST'
export const APPEND_DEMANDS_DATA = 'APPEND_DEMANDS_DATA'
```

Соответствующий импорт

```js
import { isDefined, isServer } from './utils'
import { UPDATE_DEMANDS_REQUEST, APPEND_DEMANDS_DATA } from './actions/demands'
```

В одном файле можно смешивать дефолтные и именованые импорты / экспорты.


### index.js и barrel файлы

Если в каталоге есть index.js файл, то он будет использоваться при попытке импортировать этот каталог. Этот файл обычно используется чтобы собрать все экспорты из данного каталога в одном месте. Это и есть [barrel](https://basarat.gitbooks.io/typescript/docs/tips/barrel.html) файл.

Например

```js
// demo/foo.js
export class Foo {}

// demo/bar.js
export class Bar {}

// demo/baz.js
export class Baz {}
```

Без использования `index.js` файла пользователь вынужден будет делать три импорта

```js
import { Foo } from '../demo/foo'
import { Bar } from '../demo/bar'
import { Baz } from '../demo/baz'
```

Вместо этого можно добавить в `demo/index.js` следующее

```js
// demo/index.js
export * from './foo'; // re-export all of its exports
export * from './bar'; // re-export all of its exports
export * from './baz'; // re-export all of its exports
```

После этого можно импортировать все, что нам нужно

```js
import { Foo, Bar, Baz } from '../demo'; // demo/index.ts is implied
```

Об `index.js` файле каталога можно еще рассуждать как о публичном интерфейсе который предоставляет данный каталог. Внутри каталога может быть много файлов, данные и функции из которых нужны для работы других функций этого же каталога, но не обязательно все эти функции выставлять наружу.


### as синтаксис

В случае если мы хотим сделать именованый импорт при этом имя уже занято, или же мы хотим объединить все именованые сущности в один объект, то можно использовать алиасы.

Например

```js
// demo.js
export class Foo {}
export class Bar {}
export class Baz {}

// demo2.js
export class Foo {}
```

Импорт может выглядеть так

```js
import { Foo as Bar } from './demo2'
import * as Stuff from './demo'
```


## Ресурсы

- [import](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Statements/import)/[export](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Statements/export)
- [ECMAScript 6 modules: the final syntax](http://2ality.com/2014/09/es6-modules-final.html)
