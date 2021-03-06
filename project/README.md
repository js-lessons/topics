# Финальный проект

### Базовые функции

Веб приложение, которое позволяет сохранять ссылки, помечать их тегами, производить поиск по тексту ссылок и тегам. Можно добавлять и удалять теги к ранее созданным ссылкам. Можно помечать ссылки как удаленные. Такие ссылки показываются на главной странице и участвуют в поисковой выдаче только когда включен специальный фильтр 'Показывать удаленные'.

### Дополнительные функции

* Аутентификация пользователя с привязкой данных к конкретному пользователю
* Использование сервиса по выделению контента по имеющейся ссылке (например Node.js обвязка вокруг 'mercury.postlight.com/web-parser/') и хранение контента вместе с ссылкой на него
* Работа приложения в оффлайне
* React Native приложение
* React Native и веб приложение с переиспользованием кода
* Отказ от Firebase SDK и использование Firebase REST API

### Стек

* Все статические ассеты отдаются сервером на Node.js
* В качестве хранилища данных используется firebase
* React.js
* Redux
* Redux-Saga
* Reselect для реализации логики фильтрации
* Jest для написания и запуска тестов
* Сборка приложения с помощью Webpack
* Хостинг кода проекта на github с описанием проекта, процесса сборки и настроенным CI (например travis)
* Деплой на github pages или на heroku


