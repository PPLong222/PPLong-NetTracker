# PPLong Net-Tacker

<img src="https://img.shields.io/badge/Frame-@13.6.8-blue?logo=electron&label=Electron&logoColor=#47848F&labalColor=#1fd041&color=#2b56a1&link=https://www.electronjs.org">
<img src="https://img.shields.io/badge/Frame-@5.3.2-blue?&label=echarts&labelColor=#5a5a5a&color=#e43961&link=https://www.electronjs.org">

<style>
.logo-panel {
    margin-top: 10px;
    margin-bottom: 10px;
    max-width: 450px;
}
.logo-normal-echart {
    width: 176px;
    height: 40px;
}
.logo-normal-electron{
    width: 32px;
    height: 32px;
}
.logo-normal-electron-text{
    margin-left: 0.2em;
    max-width: 180px;
    height: 40px;
}
.electron-logo{
    margin-left: 2.4em;
}
</style>


<div class="logo-panel">
     <a href="https://echarts.apache.org/" target="_blank">
     <img class="logo-normal-echart" src="./resources/logo.png">
     </a>
     <a href="https://www.electronjs.org/" target="_blank">
     <span class="electron-logo">
     <img class="logo-normal-electron" src="./resources/electron.svg">
     <img class="logo-normal-electron-text" src="./resources/electron-text.svg">
     </span>
     </a>
</div>


## Introduce

A Net-Tacker based on Electron which can capture all the net packets through specified NIC and generate IP Map optionally using echarts(currently supporting China nationwide).

![PPLong Net-Tracker version@1.0.0](https://s401177923-1302493622.cos.ap-nanjing.myqcloud.com/mdImages/image-20220614105259468.png)

![IP-Distribution](https://s401177923-1302493622.cos.ap-nanjing.myqcloud.com/mdImages/image-20220614121729699.png)

## Install

### Development

To  complete run this project in your own developing environment, you need to do things below:

1. clone this repository

```shell
git clone git@github.com:PPLong222/PPLong-NetTracker.git -b master
```

2. do **`npm install`** to install all the necessary modules 

3. rebuild the **`cap`** module

   1. go to **./node_modules/cap/binding.gyp** and add code below to avoid 

      ```json
      {
          "variables": {
              "openssl_fips" : "0" 
          },
        // 'targets': .....
      }
      ```

      ​	this is to avoid the build error : *"name 'openssl_fips' is not defined while evaluating condition 'openssl_fips != ""' in binding.gyp while trying to load binding.gyp"*

   2. in the project main directory, do **`./node_modules/.bin/electron-rebuild` **to rebuild the modules
      * this is because the [cap module](https://www.npmjs.com/package/cap)  have already been built by the author's own nodejs version,and normally your own version of nodejs differ from him. That may occur the problem which report the version conflict of the your nodejs and the module's.

4. then npm start to run the project

If you have any problem in your computer, put it in github  **issue** module.