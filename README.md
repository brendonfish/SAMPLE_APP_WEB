# AppWeb

## Requirements
- Node.js

## Install
```
# npm install
```

## Development
```
# npm run dev
```
Then open http://localhost:7777 to see the website.

```
http://localhost:7777/sign-up
http://localhost:7777/sign-in
http://localhost:7777/lost-password
http://localhost:7777/password-reset?user_id=xxx@xx.xx&lost=xx
http://localhost:7777/password-change?user_id=xxx@xx.xx
http://localhost:7777/sample-registration?token=xxx
```

## Build
```
# npm run build
```

## Folder Structure

### In Root

  Name     |  Description
--------- | ---------------------------------------
  public/  |  Real server root path (builded files)
  src/     |  source code

### In src

  Name         |  Description
------------- | -------------------
  apis/        |  All API payload
  components/  |  Common components
  constants/   |  Global constants
  hocs/        |  HoC components
  images/      |  Images files
  public/      |  Static files
  scenes/      |  Scenes files
  utils/       |  Utils scripts
  App.js       |  React App
  i18n.js      |  I18n setting
  index.html   |  Root path
  index.js     |  Entry point
  routes.js    |  Router setting
