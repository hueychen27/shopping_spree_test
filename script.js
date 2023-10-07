const items = {
    "item1": 1.00
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
            <li>Name: <input class="nameThing" type="text" data-lastValid="${name}" value="${name}" oninput="if (items[\`\${this.value}\`] == undefined && new RegExp(/^[\\w\\-\\' ]+$/).test(this.value)) {items[\`\${this.value}\`] = items[\`\${this.getAttribute('data-lastValid')}\`],delete items[\`\${this.getAttribute('data-lastValid')}\`],this.setAttribute('data-lastValid', this.value)} else {this.value = this.getAttribute('data-lastValid')}"></li>
            <li>Price: $<input class="priceThing" type="text" data-lastValid="1.00" oninput="if (new RegExp(/^[0-9]+\\.?([0-9]{1,2})?$/).test(this.value) || this.value == '') {this.setAttribute('data-lastValid', this.value), items[\`\${this.parentElement.previousElementSibling.querySelector('input').value}\`] = this.value} else { this.value = this.getAttribute('data-lastValid')} // https://stackoverflow.com/a/41981763/15055490" value="1.00"></li>
        </ul>
    `;
    items[name] = 1.00;
    const stuffSection = document.getElementById("stuff");
    stuffSection.insertBefore(div, document.getElementById("addNew"));

}