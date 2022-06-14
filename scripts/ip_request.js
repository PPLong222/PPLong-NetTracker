fetch("https://ip.useragentinfo.com/json?ip=117.136.12.79").then((res) => res.json()).then((res)=>{
    console.log(res)
})