document.addEventListener("DOMContentLoaded", () => {
    if (((window.innerWidth > 0) ? window.innerWidth : screen.width) < 299) { // https://stackoverflow.com/a/6850319
        alert("Your screen is too small to display this website.")
    }
})

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
})

const zeroIfEmpty = (val) => {
    return val == "" ? 0 : val
}

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

let items = new Map();
items.set("item1", {
    price: "1.00",
    quantity: 0
}
)
let total = 0.00;

function createItemBox() {
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
    let name = "item" + j;
    let name2 = "#" + i;
    div.className = "itemBox";
    div.innerHTML = `
<h1>${name2}</h1>
<p>Description:</p>
<ul>
    <li>Name: <input class="nameThing" type="text" data-lastValid="${name}" value="${name}" oninput="if (items.get(this.value) == undefined && new RegExp(/^[\\w\\-\\' ]+$/).test(this.value)) {items = rename(items, this.getAttribute('data-lastValid'), this.value),this.setAttribute('data-lastValid', this.value)} else {this.value = this.getAttribute('data-lastValid')}"></li>
    <li>Price: $<input class="priceThing" type="text" data-lastValid="1.00" oninput="if (new RegExp(/^[0-9]+\\.?([0-9]{1,2})?$/).test(this.value)) {this.setAttribute('data-lastValid', this.value), items.set(this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid'), {price: this.value, quantity: items.get(this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid')).quantity})} else { this.value = this.getAttribute('data-lastValid')} // https://stackoverflow.com/a/41981763/15055490" value="1.00"></li>
</ul>
<label>Quantity: <input class="quantityThing" type="text" data-lastValid="0" value="0" oninput="if (new RegExp(/^[0-9]{1,10}$/).test(this.value) || this.value == '') {this.setAttribute('data-lastValid', this.value), items.set(this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid'), {price: items.get(this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid')).price, quantity: this.value})} else { this.value = this.getAttribute('data-lastValid')} // https://stackoverflow.com/a/41981763/15055490"></label>
<button class="remove" onclick="removeItemBox(this.parentElement);"><i class="fas fa-trash-xmark fa-xl"></i>Delete</button>
    `;
    items.set(name, {
        price: 1.00,
        quantity: 0
    })
    const stuffSection = document.getElementById("stuff");
    stuffSection.insertBefore(div, document.getElementById("addNew"));
    stuffSection.scroll({
        behavior: "smooth",
        top: stuffSection.scrollHeight
    })
}

function removeItemBox(element) {
    items.delete(element.querySelector(".nameThing").getAttribute("data-lastValid"));
    element.remove();
}

function numberWithCommas(x, integer = false) {
    if (integer) return x < 1000000 ? parseInt(x).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : numberformat.format(parseInt(x))
    return x < 1000000 ? parseFloat(x).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : numberformat.format(parseFloat(x));
}

function updateTotal() {
    document.getElementById('tbody').innerHTML = "<tr style='display: none'></tr>";
    for (const [key, value] of items) {
        document.getElementById("tbody").innerHTML += `
            <tr>
                <td>${key}</td>
                <td>$${numberWithCommas(value.price)}</td>
                <td>${numberWithCommas(zeroIfEmpty(value.quantity), true)}</td>
                <td>$${numberWithCommas(value.price * value.quantity)}</td>
            </tr>
        `;
    }
    total = 0.00;
    items.forEach((item) => {
        total += item.price * zeroIfEmpty(item.quantity)
    })
    total = total.toFixed(2);
    document.getElementById("subtotal").innerHTML = "$" + numberWithCommas(total);
    const tax = (total * (zeroIfEmpty(document.getElementById("taxInput").getAttribute("data-lastValid")) / 100)).toFixed(2);
    document.getElementById("taxPercent").innerHTML = parseFloat(zeroIfEmpty(document.getElementById("taxInput").getAttribute("data-lastValid")));
    document.getElementById("tax").innerHTML = "$" + numberWithCommas(tax);
    document.getElementById("total").innerHTML = "$" + numberWithCommas((parseFloat(total) + parseFloat(tax)).toFixed(2));
    window.requestAnimationFrame(updateTotal);
}

window.requestAnimationFrame(updateTotal)