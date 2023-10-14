document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth < 299) {
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

const items = {
    "item1": {
        price: 1.00,
        quantity: 1
    }
}

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
            <li>Name: <input class="nameThing" type="text" data-lastValid="${name}" value="${name}" oninput="if (items[\`\${ this.value }\`] == undefined && new RegExp(/^[\\w\\-\\' ]+$/).test(this.value)) {items[\`\${this.value}\`] = items[\`\${ this.getAttribute('data-lastValid')}\`],delete items[\`\${ this.getAttribute('data-lastValid')}\`],this.setAttribute('data-lastValid', this.value)} else {this.value = this.getAttribute('data-lastValid')}"></li>
            <li>Price: $<input class="priceThing" type="text" data-lastValid="1.00" oninput="if (new RegExp(/^[0-9]+\\.?([0-9]{1,2})?$/).test(this.value) || this.value == '') {this.setAttribute('data-lastValid', this.value), items[\`\${ this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid')}\`].price = this.value} else { this.value = this.getAttribute('data-lastValid')} // https://stackoverflow.com/a/41981763/15055490" value="1.00"></li>
        </ul>
        <label>Quantity: <input class="quantityThing" type="text" data-lastValid="1" oninput="if (new RegExp(/^[0-9]{1,10}$/).test(this.value)) {this.setAttribute('data-lastValid', this.value), items[\`\${this.parentElement.previousElementSibling.querySelector('input').getAttribute('data-lastValid')}\`].quantity = this.value} else { this.value = this.getAttribute('data-lastValid')} // https://stackoverflow.com/a/41981763/15055490"></label>
        <button class="remove" onclick="removeItemBox(this.parentElement);"><i class="fas fa-trash-xmark fa-xl"></i>Delete</button>
    `;
    items[name] = {
        price: 1.00,
        quantity: 0
    }
    const stuffSection = document.getElementById("stuff");
    stuffSection.insertBefore(div, document.getElementById("addNew"));
    stuffSection.scroll({
        behavior: "smooth",
        top: stuffSection.scrollHeight
    })
}

function removeItemBox(element) {
    delete items[`${element.querySelector(".nameThing").getAttribute("data-lastValid")}`];
    element.remove();
}

function numberWithCommas(x) {
    return x < 1000000 ? x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : numberformat.format(x);
}

function updateTotal() {
    const table = document.getElementById("table");
    table.querySelector("#subtotal").innerHTML = "$" + numberWithCommas((Object.values(items).reduce((a, b) => a + b.price * b.quantity, 0)).toFixed(2));
    window.requestAnimationFrame(updateTotal);
}

window.requestAnimationFrame(updateTotal)