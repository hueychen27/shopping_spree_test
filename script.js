if (((window.innerWidth > 0) ? window.innerWidth : screen.width) < 299) { // https://stackoverflow.com/a/6850319
    alert("Your screen is too small to display this website.")
}

function getParameter(url, parameterName) {
    return new URL(url).searchParams.get(parameterName) ?? 0;
}

/**
 * 
 * @param {HTMLInputElement} el 
 * @param {string|number|null} val 
 * @param {RegExp|string} regex 
 * @returns 
 */
function setInput(el, val, regex = undefined) {
    if (regex != undefined || regex != null) {
        if (!new RegExp(regex).test(val)) return null;
    }
    if (val == null) return val;
    el.setAttribute("data-lastValid", val);
    el.value = val;
}

setInput(document.getElementById("taxInput"), getParameter(window.location.href, "tax"), /^(?:\d{1,2}(?:\.\d{0,3})?|100(?:\.0*)?|0\.)$/);
setInput(document.getElementById("tipInput"), getParameter(window.location.href, "tip"), /^(?:\d{1,2}(?:\.\d{0,3})?|100(?:\.0*)?|0\.)$/);
setInput(document.getElementById("budget"), getParameter(window.location.href, "budget"), /^[0-9]+\.?([0-9]{1,2})?$/);

/**
 * Function to add a `<br>` element for a mobile friendly experience. :)
 * @param {MediaQueryList} mediaQuery
 */
function mediaQueryFunction(mediaQuery) {
    const selector = ".listItem, .label";
    if (!mediaQuery.matches) {
        document.querySelectorAll(selector).forEach((e) => { e.innerHTML = e.innerHTML.replace(/<br>/, " ") });
        return;
    }
    document.querySelectorAll(selector).forEach((e) => { e.innerHTML = e.innerHTML.replace(/(?<=:)\s/, "<br>") });
}

const mediaQuery = window.matchMedia("(max-width: 325px)");

mediaQueryFunction(mediaQuery)

mediaQuery.addEventListener("change", mediaQueryFunction)

function hardRefresh() {
    if ('URL' in window) {
        const url = new URL(window.location.href);
        url.searchParams.set('reloadTime', Date.now().toString());
        window.location.href = url.toString();
    } else {
        window.location.href = window.location.origin
            + window.location.pathname
            + window.location.search
            + (window.location.search ? '&' : '?')
            + 'reloadTime='
            + Date.now().toString()
            + window.location.hash;
    }
} // https://stackoverflow.com/a/70901317/15055490

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        hardRefresh();
    }
    if (e.ctrlKey && e.key === "a" && document.activeElement.tagName !== "INPUT") { // Check if you are selecting input so that ctrl+a to select text works still.
        e.preventDefault();
        createItemBox();
    }
    if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        const addNew = document.getElementById("addNew");
        if (addNew.previousElementSibling == null) {
            return
        }
        removeItemBox(addNew.previousElementSibling)
    }
})

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
} // https://stackoverflow.com/a/18197341

/**
 * If val is an empty string, return 0. Otherwise, return val.
 * @param val The value to be read.
 */
const zeroIfEmpty = (val) => val == "" ? 0 : val;

/**
 * Renames a key in a map by replacing it with a new key.
 *
 * @param {Map} map The map to modify.
 * @param {string|number} oldKey The key to be replaced.
 * @param {string|number} newKey The new key to replace the old key with.
 */

const rename = (map, oldKey, newKey) => {
    const newMap = new Map();
    for (const [key, value] of map) {
        if (key === oldKey) {
            newMap.set(newKey, value);
        } else {
            newMap.set(key, value);
        }
    }
    return newMap;
}

/**
 * 
 * @param {Map} map 
 * @returns {object}
 */
function mapToObj(map) {
    const obj = {};
    for (let [k, v] of map)
        obj[k] = v;
    return obj;
} // https://stackoverflow.com/a/44740579

/**
 * 
 * @param {object} obj 
 * @returns {Map}
 */
function objToMap(obj) {
    const map = new Map();
    for (const [k, v] of Object.entries(obj))
        map.set(k, v);
    return map;
}

/**
 * Get .nameThing class in .itemBox element.
 * 
 * @param {Element} el 
 */
const getNameThing = (el) => el.closest('.itemBox').querySelector('.nameThing').getAttribute('data-lastValid');

/**
 * Remove characters from the end of a string so that the string matches the regex.
 * @param {string|number} str 
 * @param {RegExp} regex 
 * @returns {string}
 */
const trimLastChar = (str, regex) => {
    let str2 = structuredClone(str).toString();
    if (str2 == "") return "";
    while (!regex.test(str2) && str2 != "") str2 = str2.slice(0, -1);
    return str2;
}

/**
 * @param {string|object} str 
 */
function parseData(str) {
    try {
        let obj;
        if (typeof str == "string") {
            obj = JSON.parse(str);
        } else if (typeof str != "object") {
            throw new SyntaxError();
        }
        for (const [, value] of Object.entries(obj)) {
            if ((!Object.keys(value).every((val) => val == "price" || val == "quantity" || val == "discount")) || Object.keys(value).length != 3) return `Either there is a value not named price, quantity, or discount or there are less or more than 3 values.\nFound error(s): ${value}`;
        }
        return true;
    } catch {
        return "Invalid JSON";
    }
}

let items = new Map();
items.set("item1", {
    price: "1.00",
    quantity: 0,
    discount: "0%"
})

/**
 * Create item boxes based on a map.
 * @param {Map} map 
 */
function load(map) {
    document.getElementById("stuff").innerHTML = '<button id="addNew" title="Add another item!"><i class="fal fa-plus"></i></button>'
    map.forEach((el, name) => {
        createItemBox(name, el.price, el.quantity, el.discount, false);
    })
}

load(items);

document.addEventListener("input", (e) => {
    const rest = items.get(getNameThing(e.target));
    switch (e.target.className) {
        case "nameThing":
            if (items.get(e.target.value) == undefined && new RegExp(/^[\w\-\' ]+$/).test(e.target.value)) {
                items = rename(items, e.target.getAttribute('data-lastValid'), e.target.value);
                e.target.setAttribute('data-lastValid', e.target.value);
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            }
            break;
        case "priceThing":
            if (new RegExp(/^[0-9]+\.?([0-9]{1,2})?$/).test(e.target.value)) {
                e.target.setAttribute('data-lastValid', e.target.value);
                items.set(getNameThing(e.target), {
                    ...rest,
                    price: e.target.value
                })
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            } // https://stackoverflow.com/a/41981763/15055490
            break;
        case "quantityThing":
            if (new RegExp(/^[0-9]{1,10}$/).test(e.target.value) || e.target.value == '') {
                e.target.setAttribute('data-lastValid', e.target.value);
                items.set(getNameThing(e.target), {
                    ...rest,
                    quantity: e.target.value
                })
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            } // https://stackoverflow.com/a/41981763/15055490
            break;
        case "discountThing":
            if (new RegExp(e.target.getAttribute('data-regex')).test(e.target.value) || e.target.value == '') {
                e.target.setAttribute('data-lastValid', e.target.value);
                items.set(getNameThing(e.target), {
                    ...rest,
                    discount: e.target.value.toString() + e.target.nextElementSibling.innerHTML.toString()
                })
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            } // https://stackoverflow.com/a/41981763/15055490
            break;
    }
    switch (e.target.id) {
        case "taxInput":
            if (/^(?:\d{1,2}(?:\.\d{0,3})?|100(?:\.0*)?|0\.)$/.test(e.target.value) || e.target.value == '') {
                e.target.setAttribute('data-lastValid', e.target.value);
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            }
            break;
        case "tipInput":
            if (/^(?:\d{1,2}(?:\.\d{0,3})?|100(?:\.0*)?|0\.)$/.test(e.target.value) || e.target.value == '') {
                e.target.setAttribute('data-lastValid', e.target.value);
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            }
            break;
        case "budget":
            if (/^[0-9]+\.?([0-9]{1,2})?$/.test(e.target.value) || e.target.value == '') {
                e.target.setAttribute('data-lastValid', e.target.value);
            } else {
                e.target.value = e.target.getAttribute('data-lastValid');
            }
            break;
    }
})

document.addEventListener("change", (e) => {
    if (e.target.className == "discountTypeThing") {
        e.target.closest('.itemBox').querySelector('.discountType').innerHTML = e.target.value;
        const discountThing = e.target.closest('.itemBox').querySelector('.discountThing');
        discountThing.setAttribute('data-regex', (e.target.value == '' ? '^[0-9]+\\.?([0-9]{1,2})?$' : '^(?:\\d{1,2}(?:\\.\\d{0,3})?|100(?:\\.0*)?|0\\.)$'));
        discountThing.value = trimLastChar(discountThing.value, new RegExp(discountThing.getAttribute('data-regex')));
        discountThing.setAttribute('data-lastValid', discountThing.value);
        items.set(getNameThing(e.target), {
            ...items.get(getNameThing(e.target)),
            discount: e.target.parentElement.previousElementSibling.querySelector('.discountThing').value.toString() + e.target.parentElement.previousElementSibling.querySelector('.discountType').innerHTML.toString()
        })
    }
})

/**
 * Create item box
 */
function createItemBox(realName = "item", price = "1.00", quantity = 0, discount = "0%", boring = true) {
    const discountData = {
        discount: discount.replace("%", ""),
        discountType: discount.includes("%") ? "Percent" : "Absolute",
    }
    let div = document.createElement("div");
    let i = 1;
    div.id = i;
    while (document.getElementById(i) != null) {
        i++;
        div.id = i;
    }
    let j = 1;
    while (document.querySelector(`input.nameThing[data-lastValid=${'item' + j}]`) != null) {
        j++;
    }
    const reused = document.querySelector(`input.nameThing[data-lastValid="${realName}"]`) != null
    let name = boring || reused ? "item" + j : realName;
    let name2 = "#" + i;
    div.className = "itemBox";
    div.innerHTML = `
<h2>${name2}</h2>
<p>Description:</p>
<ul>
    <li class="listItem">Name: <input class="nameThing" type="text" data-lastValid="${name}" value="${name}"></li>
    <li class="listItem">Price: <input class="priceThing" type="text" data-lastValid="${price}" value="${price}"></li>
</ul>
<label class="label">Quantity: <input class="quantityThing" type="text" data-lastValid="${quantity}" value="${quantity}"></label>
<label class="label">Discount: <input class="discountThing" type="text" data-lastValid="${discountData.discount}" data-regex="^(?:\\d{1,2}(?:\\.\\d{0,3})?|100(?:\\.0*)?|0\\.)$" value="${discountData.discount}"><span class="discountType">${discount.replace(/[\d.]/, "")}</span></label>
<label class="label">Discount Type: <select class="discountTypeThing">
        <option value="%" ${discount.includes("%") ? "selected" : ""}>Percent</option>
        <option value="" ${discount.includes("%") ? "" : "selected"}>Absolute</option>
    </select></label>
<button class="remove"><i class="fas fa-trash-xmark fa-xl"></i>Delete</button>`
    items.set(name, {
        price: price,
        quantity: quantity,
        discount: discount
    })
    const stuffSection = document.getElementById("stuff");
    stuffSection.insertBefore(div, document.getElementById("addNew"));
    stuffSection.scroll({
        behavior: "smooth",
        top: stuffSection.scrollHeight
    })
}
/**
 * Remove itembox forever
 * @param {Element} element 
 */
function removeItemBox(element) {
    items.delete(element.querySelector(".nameThing").getAttribute("data-lastValid"));
    element.remove();
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        }

        reader.onerror = () => {
            reject(undefined);
        }

        reader.readAsText(file);
    });
}

document.addEventListener("click", async (e) => {
    switch (e.target.id) {
        case "saveFromLocalStorage":
            if (confirm('Save to localStorage?')) localStorage.setItem('data', JSON.stringify(mapToObj(items)));
            break;
        case "saveAsText":
            alert(JSON.stringify(mapToObj(items)));
            break;
        case "saveToFile":
            download('data.json', JSON.stringify(mapToObj(items)));
            break;
        case "loadFromLocalStorage":
            if (confirm(`Do you want to load this data?
${JSON.stringify(JSON.parse(localStorage.getItem('data') ?? JSON.stringify(mapToObj(items))), null, 4)}`)) {
                items = objToMap(JSON.parse(localStorage.getItem('data')));
                load(items);
            }
            break;
        case "loadFromText":
            const data = prompt(`Put your data here.`, JSON.stringify(mapToObj(items)));
            if (data != null) {
                try {
                    const returnVal = parseData(data);
                    if (returnVal === true) {
                        items = objToMap(JSON.parse(data));
                        load(items);
                    } else {
                        throw new SyntaxError(returnVal);
                    }
                } catch (e) {
                    if (e instanceof SyntaxError) alert(e.message);
                }
            }
            break;
        case "loadFromFile":
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json,.txt'
            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                const fileData = await readFileAsync(file).then((data) => data).catch((e) => e);
                if (fileData === undefined) {
                    alert('File is undefined (check permissions?)');
                } else if (fileData.trim() != '') {
                    try {
                        const returnVal = parseData(fileData);
                        if (returnVal === true) {
                            items = objToMap(JSON.parse(fileData));
                            load(items);
                        } else {
                            throw new SyntaxError(returnVal);
                        }
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            alert(error.message);
                        }
                    }
                } else {
                    alert('The file is empty.');
                }
            })

            fileInput.click();
            break;
        case "clearLocalStorage":
            if (confirm('Clear localStorage?')) localStorage.removeItem('data');
            break;
        case "addNew":
            createItemBox();
            break;
    }
    if (e.target.className == "remove") {
        removeItemBox(e.target.parentElement);
    }
})

/**
 * Use the numberformat.format method to format a number.
 * @param {Number} x 
 * @param {Boolean} integer `true` if you want to return an integer (negative or positive whole number) and `false` if decimal
 * @returns 
 */
function numberWithCommas(x, integer = false) {
    if (integer) return Math.abs(x) < 1000000 ? parseInt(x).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : numberformat.format(parseInt(x));
    return Math.abs(x) < 1000000 ? parseFloat(x).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : numberformat.format(parseFloat(x));
}
/**
 * Replace `$-` with `-$`
 * @param {String} m 
 * @returns {String}
 */
const formatNegativeMoney = (m) => m.replace(/^\$-/, "-$");

function updateTotal() {
    let total = 0.00;
    let html = [];
    if (items.size > 0) {
        for (const [key, value] of items) {
            const preTotal = value.price * zeroIfEmpty(value.quantity);
            const discount = value.discount.toString().indexOf('%') > -1 ? parseFloat((zeroIfEmpty(value.discount.toString().slice(0, -1)) / 100) * preTotal).toFixed(2) : parseFloat(zeroIfEmpty(value.discount));
            const discountedTotal = value.quantity > 0 ? parseFloat((preTotal - discount).toFixed(2)) : 0;
            total += parseFloat(discountedTotal.toFixed(2));
            html.push(`<tr class="tr"><td>${key}</td><td>$${numberWithCommas(value.price)}</td><td>${numberWithCommas(zeroIfEmpty(value.quantity), true)}</td><td>$${numberWithCommas(preTotal)}</td><td>-$${numberWithCommas(value.quantity > 0 ? discount : 0)}</td><td>$${numberWithCommas(discountedTotal)}</td></tr>`)
        }
    } else {
        html.push('<tr style="display: block; line-height: 0; height: 0; overflow: hidden; border: none;"><td></td></tr>'); // Fix weird borders https://stackoverflow.com/a/951888
    }
    const tbody = document.getElementById("tbody");
    if (tbody.innerHTML.trim() != html.join("").trim()) {
        tbody.innerHTML = html.join("");
    }

    document.getElementById("subtotal").innerHTML = "$" + numberWithCommas(total);

    const tax = (total * (zeroIfEmpty(document.getElementById("taxInput").getAttribute("data-lastValid")) / 100)).toFixed(2);
    const tip = ((parseFloat(total) + parseFloat(tax)).toFixed(2) * (zeroIfEmpty(document.getElementById("tipInput").getAttribute("data-lastValid")) / 100)).toFixed(2);

    total = parseFloat((parseFloat(total) + parseFloat(tax)).toFixed(2));

    document.getElementById("taxPercent").innerHTML = parseFloat(zeroIfEmpty(document.getElementById("taxInput").getAttribute("data-lastValid")));
    document.getElementById("tipPercent").innerHTML = parseFloat(zeroIfEmpty(document.getElementById("tipInput").getAttribute("data-lastValid")));
    document.getElementById("tax").innerHTML = "$" + numberWithCommas(tax);
    document.getElementById("preTipTotal").innerHTML = "$" + numberWithCommas(total);
    document.getElementById("tip").innerHTML = "$" + numberWithCommas(tip);

    total = parseFloat((total + parseFloat(tip)).toFixed(2));

    document.getElementById("total").innerHTML = "$" + numberWithCommas(total);
    document.getElementById("balance").innerHTML = formatNegativeMoney("$" + numberWithCommas((parseFloat(zeroIfEmpty(document.getElementById("budget").value)) - total).toFixed(2)));
    document.getElementById("balance").style.color = document.getElementById("balance").innerHTML.indexOf("-") == -1 ? "green" : "red";

    window.requestAnimationFrame(updateTotal);
}

window.requestAnimationFrame(updateTotal)