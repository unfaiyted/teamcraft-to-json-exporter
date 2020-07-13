// ==UserScript==
// @name         FFXIV Teamcraft to Lisbeth Exporter
// @namespace    https://danemiller.me
// @version      0.1
// @description  create a list of items to use for lisbeth
// @author       You
// @match        https://ffxivteamcraft.com/**
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

   let output = [];

    // Used to download the file to your computer
    function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

    // Sets the format for the lisbeth items
    function lisbethItem(number, amount, classType) {
        return {
         "Group":1,"Item":number,"Amount":amount,"Enabled":true,"Type": classType
        }
    }


    //Adds a button to the page
    function addButton(dataOut) {
        const toolbar = document.getElementsByClassName("toolbar")[0];

        let button = document.createElement("button");
        button.innerHTML = "Lisbeth Export";
        button.className = "ant-btn ant-btn-square"

        const h2 = document.getElementsByTagName("h2")[0];

        const fileName = h2.textContent.trim().split(" ").join("-") + ".json";

        button.onclick = () => {
            console.log(dataOut);
            download(dataOut,fileName,"text/plain;charset=utf-8");
        }

        toolbar.appendChild(button);
    }

    console.log("hello! Looking for the right page...");


    function searchForData() {

        const findLists = setInterval(() => {

            let groups = document.getElementsByClassName("ant-collapse-content-box");

            if(groups.length > 0) {
                console.log("page loaded");
                console.log(groups, groups.length);


                const finalItems = groups[groups.length-1].getElementsByClassName("item-row");

                // Reset data in output.
                output = [];

                for (let item of finalItems) {

                    // const texts = list.getElementsByClassName("panel-header")[0].textContent;
                    console.log(item);


                    const jobSrc = item.getElementsByClassName("img-icon")[0].getAttribute("src").split("/");
                    const itemNbrSrc = item.getElementsByClassName("icon-container")[0].getAttribute("href").split("/");
                    const jobName = jobSrc[jobSrc.length - 1].split(".")[0];



                    const name = item.getElementsByClassName("item-name")[0].textContent.trim();
                    const amount = parseInt(item.getElementsByClassName("needed")[0].textContent.replace("x","").trim());
                    const itemNbr = parseInt(itemNbrSrc[itemNbrSrc.length - 1].split(".")[0]);
                    const job = jobName.charAt(0).toUpperCase() + jobName.slice(1);

                    output.push(lisbethItem(itemNbr, amount, job));

                }

                addButton(JSON.stringify(output));

                console.log(JSON.stringify(output));

                clearInterval(findLists);
            } else {
                console.log("still looking");
            }

        }, 500);


    }


    // Detects changes in browser location
    history.pushState = ( f => function pushState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.pushState);

    history.replaceState = ( f => function replaceState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.replaceState);

    window.addEventListener('popstate',()=>{
        window.dispatchEvent(new Event('locationchange'))
    });

    window.addEventListener('locationchange', function(){
    console.log('location changed!');
        searchForData();

    })



})();
