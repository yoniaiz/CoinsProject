// hover the search icon on focus input
$('#searchCoin').on('focus', function () {
    $("#searchIcon").css("color", "rgba(45,154,158,0.8)");
});
$('#searchCoin').focusout(function () {
    $("#searchIcon").css("color", "#3AD48C");
});

// ----------------------------------------------------------
// Paralax scrolling
$(window).on('scroll', function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        printCoins()
    }
    $('.logo').css('transform', 'translate(0px,' + $(window).scrollTop() / 2.8 + '%)')
})

// ----------------------------------------------------------
coin = {
    dollar: '',
    euro: '',
    shekel: '',
    img: '',
    update: true
}
modalCheck = false
myStorage = window.localStorage;
coins = []
symbols = []
if (myStorage.getItem(`myCoins`)) {
    coins = JSON.parse(myStorage.getItem(`myCoins`));
}
myStorage.clear()
myStorage.setItem(`myCoins`, JSON.stringify(coins))
var lastcounter = 0 // counter to print the cards by order.
coinsArray = []
coinsNameArray = []

$('#coinNum').html(coins.length) //show the coin number in stack on coin logo


createUrl = (coinId) => {
    if (coinId == null)
        url = "https://api.coingecko.com/api/v3/coins/list"
    else
        url = `https://api.coingecko.com/api/v3/coins/${coinId}`
    return url;
}

getCoins = () => {
    createModal()
    url = createUrl(null)
    $.ajax({
        type: 'GET',
        datatype: 'json',
        url: url,
        success: function (data) {
            let i = 0;
            while (i < 1000) {
                coinsArray[i] = data[i];
                coinsNameArray[i] = data[i].symbol;
                i++;
            }
            autocomplete(document.getElementById("searchCoin"), coinsNameArray);
            printCoins()
            if (myStorage.getItem('myCoins')) {
                createSymbolsArr() //creating symbols for the chart
            }
        },
        error: function (error) {
            console.log(error)
        }
    });
}
createSymbolsArr = () => { //creating simbols for chart
    symbols = []
    myStorage.removeItem(`mySymbols`)
    $.each(coinsArray, function (i, coin) {
        let index = coins.indexOf(coin.id)
        if (index > -1) {
            symbols.push(coin.symbol)
        }
    })
    myStorage.setItem(`mySymbols`, JSON.stringify(symbols))
}
searchCoin = () => {
    $('body').css('overflow','hidden')
    if ($('.about').css("visibility") == 'visible') { //if the page of about is show and user search coin
        $('.about').css("visibility", 'hidden')
        $('.about').css("opacity", '0')
        $('#coins').css('visibility', 'visible')
        $('#coins').css('opacity', '1')
        $('.logo').css("opacity", '1')
    } else if ($('.canvasDiv').css("visibility") == 'visible') { //if the page of about is show and user search coin
        $('.canvasDiv').css("visibility", 'hidden')
        $('.canvasDiv').css("opacity", '0')
        $('#coins').css('visibility', 'visible')
        $('#coins').css('opacity', '1')
        $('.logo').css("opacity", '1')
    }
    coinName = ($('#searchCoin').val()).toLowerCase()
    $.each(coinsArray, function (i, coin) {
        if ((coin.symbol).toLowerCase() == coinName || (coin.name).toLowerCase() == coinName) {
            $('#coins').css("visibility", 'visible')
            $('#coins').html('')
            createCard(coin)
            $(coinCard).css('display', 'inline-block')
            if (coins.length >= 5) {
                $('.toggleButton_unchecked').prop('disabled', true);
                $('.fullCoinArray').css('opacity', '1')
            }

            $('#searchCoin').bind('input', function () {
                if ($('#searchCoin').val() == '') {
                    window.location.reload()
                }
            });
        }

    })
}

getCoinInfo = (coinId) => {
    if (!myStorage.getItem(`${coinId}`) || JSON.parse(myStorage.getItem(`${coinId}`)).update == true) {
        $('#coinLoader').css('display', 'inline-block')
        createUrl(coinId)
        $.ajax({
            type: 'GET',
            datatype: 'json',
            url: url,
            success: function (data) {
                coin = {
                    dollar: (data.market_data.current_price.usd).toFixed(4),
                    euro: (data.market_data.current_price.eur).toFixed(4),
                    shekel: (data.market_data.current_price.ils).toFixed(4),
                    img: data.image.large,
                    update: false
                }
                $('#coinLoader').css('display', 'none')
                createValuesCardOfCoin(coinId, coin.dollar, coin.euro, coin.shekel, coin.img)
                $(`#${coinId}`).toggleClass('flipped');
                myStorage.setItem(`${coinId}`, JSON.stringify(coin));
                setTimeout(function () {
                    coin.update = true
                    myStorage.setItem(`${coinId}`, JSON.stringify(coin));
                }, 120000);
            },
            error: function (error) {
                $('#coinLoader').css('display', 'none')
                console.log(error)
            }
        });
    } else
        $(`#${coinId}`).toggleClass('flipped');
}
// creating the back card of coin
createValuesCardOfCoin = (coinId, dollar, euro, shekel, image) => {
    $(`#${coinId}_worth`).html(`<div class='col-12'> 
        <h1><strong>Coin worth:</strong><h1>
    </div>
    <div class='col-4'> 
        <h3> In Dollar <br>  ${dollar}$</h3>
    </div>
    <div class='col-4'> 
        <h3> In Euro  <br> ${euro}€</h3>
    </div>
    <div class='col-4'> 
        <h3> In Shekel  <br> ${shekel}&#8362; </h3>
    </div>`)
    $(`#${coinId}_image`).html(`
    <img src="${image}" class="img-fluid" alt="Responsive image">
    `)
}
// prints only 6 coins every scroll down to create Paralax scrolling
printCoins = () => {
    if (myStorage.getItem(`myCoins`)) {
        coins = JSON.parse(myStorage.getItem(`myCoins`));
    }
    let i = 0
    while (lastcounter < coinsArray.length && i < 6) {
        lastcounter++
        i++
        createCard(coinsArray[lastcounter])
    }
    $(coinCard).css('display', 'inline-block')
}

createCard = (coin) => {
    cardstr = ''
    cardstr += `<div id="coinCard" class="col-xl-4 col-lg-4 col-md-6 col-sm-12 mt-5">
                <div class="flip">
            <div id="${coin.id}" class="card" style="width: 100%;">
             <div class="face front"> 
                <div class="inner">
                  <label class="switch">`
    if (coins.includes(coin.id)) {
        cardstr += `<input id="${coin.id}_checkbox" class='toggleButton__checked' type="checkbox" onclick="myCoins('${coin.id}')" checked >`
    } else {
        cardstr += `<input id="${coin.id}_checkbox" class='toggleButton_unchecked' type="checkbox" onclick="myCoins('${coin.id}')"  >`
    }
    cardstr += ` <span class="slider round"></span>
                  </label> 
                    <div class="card-body">
                        <h5 class="card-title">${coin.symbol}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${coin.name}</h6>
                        <button type="button" class="btn btn-outline-success" onclick="getCoinInfo('${coin.id}')">More info</button>
                    </div>
                </div> 
             </div>  
             <div class="face back"> 
                    <div class="inner text-center"> 
                    <div id="${coin.id}_worth" class='row'> </div> 
                    <div  class="p-0 m-0 row"> 
                        <div id="${coin.id}_image" class="p-0 offset-4 col-4"></div>
                    </div>
                      <button type="button" class="btn btn-outline-success" onclick="$('#${coin.id}').toggleClass('flipped');">Back</button>
             </div> 
            </div>
        </div>   
    </div>`
    $('#coins').append(cardstr)
}
myCoin = ''
myCoins = (coin) => {
    myCoin = coin
    if (coins.length >= 5 && $(`#${coin}_checkbox`).prop("checked") && modalCheck == false) {
        myStorage.setItem('lastCoin', `#${coin}_checkbox`)
        $(`#${coin}_checkbox`).prop('checked', false);
        createModal()
        modalCheck = true
        $("#myModal").modal("show");
    }
    // add coin to array
    if ($(`#${coin}_checkbox`).prop("checked")) {
        coins.push(coin)
        myStorage.setItem(`myCoins`, JSON.stringify(coins))
        createSymbolsArr()
        $(`#${coin}_checkbox`).removeClass('toggleButton_unchecked')
        $(`#${coin}_checkbox`).addClass('toggleButton_checked')
    } else { //remove coin from array
        $(`#${coin}_checkbox`).removeClass('toggleButton_checked')
        $(`#${coin}_checkbox`).addClass('toggleButton_unchecked')
        var index = coins.indexOf(coin);
        if (index > -1) {
            coins.splice(index, 1);
        }
        myStorage.setItem(`myCoins`, JSON.stringify(coins))
        createSymbolsArr()
    }
    createModal()
    $('#coinNum').html(coins.length)
}

createModal = () => {
    if (coins.length == 5) {
        $('.modal-title').html(`You're coins stack <br> is full.`)
    } else {
        $('.modal-title').html(`You're coins stack.`)
    }
    $('#modalCoins').html('<div class="offset-1"></div>')
    $.each(coins, function (i, coin) {
        $('#modalCoins').append(`<div class="col-2">
        <div class="coinLogo silver" onclick="deleteCoin(${i})"></div>
        <h3 id="coin${i-1}" class="ml-2 mt-1 coinName">Delete <br> ${coins[i]}</h3>
    </div>`)
    })
}
//delete coin from array by modal
deleteCoin = (index) => {
    coins.splice(index, 1);
    if (modalCheck == true)
        coins.push(myCoin)
    myStorage.setItem(`myCoins`, JSON.stringify(coins))
    createSymbolsArr()
    window.location.reload()
}

showAbout = () => {
    $('body').css('overflow','hidden')
    setTimeout(function () {
        $('#coins').css("visibility", 'hidden')
        $('.canvasDiv').css("visibility", 'hidden')
        setTimeout(function () {
            $('.about').css("visibility", 'visible')
            $('.about').css("opacity", '1')
            $('.logo').css("transition", '0.5s')
            $('.logo').css("opacity", '0.2')
        }, 400)
    }, 500)
    $('#coins').css("opacity", '0')
    $('.canvasDiv').css("opacity", '0')
}


function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
//----------------------------------------------------------------------------------------
//the script of the chart (used chartJs for the project).

showCoinChart = () => {
    $('body').css('overflow','hidden')
    setTimeout(function () {
        $('#coins').css("visibility", 'hidden')
        $('.about').css("visibility", 'hidden')
        setTimeout(function () {
            $('.canvasDiv').css("visibility", 'visible')
            $('.canvasDiv').css("opacity", '1')
            $('.logo').css("transition", '0.5s')
            $('.logo').css("opacity", '0.2')
        }, 400)
    }, 500)
    $('#coins').css("opacity", '0')
    $('.about').css("opacity", '0')
    if (lineChart.data.datasets.length == 0) {
        getFirstTimeCoinValue()
        lineChart.data.labels.push(new Date().toLocaleTimeString())
        lineChart.update();
    }
}

//colors for lines
colors = ['#192E5B', '#1D65A6', '#72A2C0', '#00743F',
    '#F2A104']


//object of line
dataset = {
    label: '',
    fill: false,
    lineTension: 0.1,
    borderColor: "",
    borderCapStyle: 'butt',
    borderDash: [],
    backgroundColor: '#ddd',
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: "",
    pointBackgroundColor: "#fff",
    pointBorderwidth: 1,
    pointHoverRadius: 5,
    data: []
}

createURLToChart = () => {
    url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=`
    $.each(symbols, function (i, symbol) {
        if (i == symbols.length - 1)
            url += `${symbol.toUpperCase()}&`
        else
            url += `${symbol.toUpperCase()},`
    })
    url += 'tsyms=USD&api_key=e4a3b39acfddf48bf77f9fcd30d341eefa322de6d8ef9d100a0b314278bbaafb'
    return url
}
getFirstTimeCoinValue = () => { //creating first time the line object and then update evry 2 sec

    url = createURLToChart()
    $.ajax({
        type: 'GET',
        datatype: 'json',
        url: url,
        success: function (coinData) {
            $.each(symbols, function (i, symbol) { //checks if all coins exist if not it splice the coin from the array and starts the func again
                if (!(Object.keys(coinData).includes(symbol.toUpperCase()))) {
                    symbols.splice(i, 1)
                    alert(symbol + ' values not found in the system')
                    getFirstTimeCoinValue()
                }
            })
            $.each(symbols, function (i, symbol) {
                createDataset(symbol, (coinData[Object.keys(coinData)[i]].USD), colors[
                    i])
                lineChart.update();
            })
        },
        error: function (error) {
            console.log(error)
        },
        complete: function () {
            myVar = setInterval(updateChart, 2000);
        }
    });
}
Chart.defaults.global.tooltips.backgroundColor = '#ababab'
resetDataset = () => {
    dataset = {
        label: '',
        fill: false,
        lineTension: 0.1,
        borderColor: "",
        borderCapStyle: 'butt',
        borderDash: [],
        backgroundColor: '',
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "",
        pointBackgroundColor: "#fff",
        pointBorderwidth: 1,
        pointHoverRadius: 5,
        data: []
    }
}
createDataset = (symbol, val, color) => {
    resetDataset()
    dataset.label = symbol;
    dataset.data.push(String(val));
    dataset.borderColor = color;
    dataset.backgroundColor = color;
    dataset.pointBorderColor = color;
    lineChart.data.datasets.push(dataset)
}

chart = document.getElementById('lineChart');
lineChart = new Chart(chart, {
    type: 'line',

    data: {
        labels: [],
        datasets: []
    },
    options: {
        legend: {
            labels: {
                fontColor: "grey",
                fontSize: 18,
            }
        },
        showAllTooltips: true,
        tooltips: {
            custom: function (tooltip) {
                if (!tooltip) return;
                // disable displaying the color box;
                tooltip.displayColors = false;
            },
            callbacks: {
                label: function (tooltipItems, data) {
                    return tooltipItems.yLabel.toString() + "$";
                },

                labelTextColor: function (tooltipItem, chart) {
                    return 'white';
                },
                bodyFontSize: function (tooltipItem, chart) {
                    return 20;
                },
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    }
                }],
            }
        }
    }
});


updateChart = () => {
    lineChart.data.labels.push(new Date().toLocaleTimeString())
    url = createURLToChart()
    $.ajax({
        type: 'GET',
        datatype: 'json',
        url: url,
        success: function (coinData) {
            $.each(symbols, function (i, symbol) {
                lineChart.data.datasets[i].data.push((coinData[Object.keys(coinData)[i]]
                    .USD))
                lineChart.update();
            })
        },
        error: function (error) {
            console.log(error)
        },
    });
}