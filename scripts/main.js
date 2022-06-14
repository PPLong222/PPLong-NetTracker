var decoders;
var PROTOCOL;
var Cap;
var catchState = false;
var netDevice = null;
var c;
var dstAddr = [];
var ip_addr_map = new Map();
var successIpRequestCount = 0;
var timeoutInterval;
var currentPacketCount = 0;
var currentPacketSize = 0;
var ratio = 0;
var rawDataArray;
var fs;
var electron;
var dialog
const IP_QUERY = "https://ip.useragentinfo.com/json?ip=";
// "http://ip-api.com/json/";
try {
    electron = require("electron");
    dialog = electron.remote.dialog;
    Cap = require("cap").Cap;
    decoders = require("cap").decoders;
    PROTOCOL = decoders.PROTOCOL;
    fs = require("fs");
} catch (error) {
    alert("require error: " + error);
}

// set ui setting
document.getElementById("button-catch").onclick = onCatchButtonClick;
document.getElementById("button-dump").onclick = onDumpButtonClick;
document.getElementById("offline-catch-count").innerHTML = currentPacketCount;
document.getElementById("offline-catch-size").innerHTML = currentPacketSize + " Byte";
document.getElementById("ip-request-progress-ratio").innerHTML = ratio + "%";
document.getElementById("gen-ip-map-button").onclick = generateIPMap;

equipDeviceList()


function equipDeviceList() {
    for (device of Cap.deviceList()) {
        var div = document.createElement("div");
        var element = document.createElement("input");
        element.type = "radio";
        element.id = device['name'];
        element.name = "net-device";
        div.appendChild(element);
        div.innerHTML += device['name'];
        div.className = "radio-text"
        document.getElementById("select-device-scroll").appendChild(div);
    }
}

function beginToCap(device) {
    currentPacketCount = 0;
    currentPacketSize = 0;
    dstAddr.length = 0;
    rawDataArray = new Array();
    onReceivedPacket();


    try {
        // var filter = 'tcp and dst port 80';
        var filter = '';
        var bufSize = 10 * 1024 * 1024;
        var buffer = Buffer.alloc(65535);

        c = new Cap();
        var linkType = c.open(device, filter, bufSize, buffer);


        c.setMinBytes && c.setMinBytes(0);

        c.on('packet', function(nbytes, trunc) {
            console.log("catching!");
            console.log(buffer.slice(0, nbytes));
            currentPacketCount++;
            currentPacketSize += nbytes;
            onReceivedPacket();
            if (linkType === 'ETHERNET') {
                var ret = decoders.Ethernet(buffer);
                // write to array to be written to locality
                let curTimeStamp = new Date().getTime();
                rawDataArray.push("TimeStamp: " + curTimeStamp + " Raw-Hex-Dump: " + buffer.slice(0, nbytes).toString("hex"));

                // console.log(ret)
                if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
                    // console.log('Decoding IPv4 ...');
                    ret = decoders.IPV4(buffer, ret.offset);
                    // console.log('from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr);
                    dstAddr.push(ret.info.dstaddr);
                    if (ret.info.protocol === PROTOCOL.IP.TCP) {
                        var datalen = ret.info.totallen - ret.hdrlen;

                        // console.log('Decoding TCP ...');

                        ret = decoders.TCP(buffer, ret.offset);
                        // console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
                        datalen -= ret.hdrlen;
                        // console.log(buffer.toString('binary', ret.offset, ret.offset + datalen));
                    } else if (ret.info.protocol === PROTOCOL.IP.UDP) {
                        // console.log('Decoding UDP ...');

                        ret = decoders.UDP(buffer, ret.offset);
                        // console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
                        // console.log(buffer.toString('binary', ret.offset, ret.offset + ret.info.length));
                    } else
                        console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
                } else {
                    console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
                }
            }
        });
    } catch (error) {
        alert(error)
        catchState = false;
        document.getElementById("button-catch").innerHTML = "Begin to Cap";
    }

    function onReceivedPacket() {
        document.getElementById("offline-catch-count").innerHTML = currentPacketCount;
        document.getElementById("offline-catch-size").innerHTML = currentPacketSize + " Byte";
    }
}


function closeNetCatching() {
    if (c) {
        c.close();
    }
}

function onCatchButtonClick() {
    if (!catchState) {
        elements = document.getElementsByTagName("input");
        for (element of elements) {
            if (element.checked) {
                netDevice = element.id;
            }
        }
        if (!netDevice) {
            alert("Please Select Net-Device First!");
            return;
        } else {
            console.log(netDevice);
            catchState = true;
            beginToCap(netDevice);
            document.getElementById("button-catch").innerHTML = "Stop Catching";
        }
    } else {
        catchState = false;
        closeNetCatching();
        document.getElementById("button-catch").innerHTML = "Begin to Cap";
    }
}


function generateIPMap() {
    var ip_index = 0;
    ratio = 0;
    timeoutInterval = setInterval(() => {
        if (ip_index >= dstAddr.length) {
            list = []
            for (let [key, value] of ip_addr_map) {
                map = { 'name': key, 'value': value };
                list.push(map);
            }
            console.log(list)
            window.localStorage.setItem("list", JSON.stringify(list));
            window.open("map.html");
            clearInterval(timeoutInterval);
            return;
        }
        fetch(IP_QUERY + dstAddr[ip_index]).then(res => res.json()).then((res) => {
            if (res['code'] == 200) {
                successIpRequestCount++;
                loadRes(res);
                updateProgress();
            } else {
                successIpRequestCount++;
                console.log("request err : " + res['desc']);
            }
        })
        ip_index++;

    }, 1500);

}

function updateProgress() {
    progressBar = document.getElementById("ip-request-progress");
    ratioText = document.getElementById("ip-request-progress-ratio");
    let ratio = Math.floor(successIpRequestCount / dstAddr.length * 100);
    console.log(ratio);
    progressBar.value = ratio;
    ratioText.innerHTML = ratio + "%";
}

function loadRes(res) {
    if (res['city'] != "") {
        city = res['city'].substr(0, res['city'].length - 1);
        num = ip_addr_map.get(city);
        if (num != null) {
            ip_addr_map.set(city, ++num);
        } else {
            ip_addr_map.set(city, 1);
        }
    } else {
        console.log("city is empty!");
    }
}

function onDumpButtonClick() {
    BrowseFolder();
}

function saveRawDataToLocalWithHex(path) {
    for (let i in rawDataArray) {
        let content = "Sequence: " + i + " " + rawDataArray[i] + "\n";
        fs.appendFile(path, content, err => {
            if (err) {
                alert("file write error: " + err);
            }
        });
    }
    alert("file successfully write to path: " + path);
}

function BrowseFolder() {
    dialog.showSaveDialog({
        title: "Choose Save Path"
    }).then(res => {
        if (!res.canceled) {
            saveRawDataToLocalWithHex(res.filePath);
        }
    }).catch(err => {
        alert(err);
    })

}