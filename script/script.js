const url = "http://localhost:3000";
const container = document.querySelector(".ctn-crocs");
const pickers = document.querySelectorAll(".picker");
let crocs;
let filteredCrocs;

//chargement des crocs

function getFilteredCrocs(crocs) {
    let Window = window.location.pathname.slice(0, window.location.pathname.length-5).split('/').pop().toString()
    let ret = [];
    for (let i = 0; i != crocs.length; i++) {
        if (crocs[i].category.includes(Window)) {
            ret.push(crocs[i])
        }
    }
    return ret
}


function LoadCrocs() {
    fetch(`${url}/crocs`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            crocs = data.crocs;
            filteredCrocs = getFilteredCrocs(crocs);
            
            getCrocs();
            loadcart();
            
        })
        .catch(error => console.log("erreur : " + error));
}

//récupération des crocs
function getCrocs() {
    container.innerHTML = "";
    filteredCrocs.forEach(function(croc, x)  {
        let tmp = "";
        let price = "";
        for(let i = 0;i != croc.colors.length; i++) {
            tmp += "<div class=\" picker round "+croc.colors[i]+"\" onclick=\"Switch("+i+","+ x+")\"></div>\n";
        }
        if (croc.reduction != 0) {
            let reduc = croc.price-(croc.reduction*croc.price)/100;
            price = "<p class=\"oldPrice\">"+croc.price+"€</p><p>&nbsp "+reduc.toFixed(2)+"€</p><p class=reduc>&nbsp-"+croc.reduction+"%</p>";
        } else {
            price = croc.price + "€";
        }
        let crocctn = document.createElement("div");
        crocctn.classList.add("croc-item");
        crocctn.innerHTML += `<img class="croc-img" src="${croc.img_1[0]}" onmouseover="Hover(${x})" onmouseleave="LeaveHover(${x})" />
        <div class="nom-croc"> ${croc.name} </div>
        <div class="crocPrice"> ${price} </div>
        <button onclick="addcrocs(${croc.id})"> Ajouter au panier </button>
        <a href="details.html" target="blank class="crocsDetails" onclick="Details(${croc.id})">détails</a>
        <div class ="color-picker-ctn">
            ${tmp}
        </div>`;
        
        container.appendChild(crocctn);
    });
}


var details = JSON.parse(localStorage.getItem("details")) || [];
function Details(id) {
    let tmp = "";
    let croc = crocs.find(croc => croc.id === id);
    details = croc;
    localStorage.setItem("details", JSON.stringify(details));
    
}


var crocDetails = localStorage.getItem("details") || []
function test2() {
    console.log(crocDetails)
}



function Switch(i, id) {
    img = document.getElementsByClassName("croc-img")
    
    crocs[id].imgID = "img_" + (i + 1);
    if (crocs[id].colors.length >= i+1) {
        img[id].src = crocs[id][crocs[id].imgID][0];
    }
}

function Hover(i) {
    img = document.getElementsByClassName("croc-img")
    img[i].src = crocs[i][crocs[i].imgID][1];
}

function LeaveHover(i) {
    img = document.getElementsByClassName("croc-img")
    img[i].src = crocs[i][crocs[i].imgID][0];
}

//Filtrage

pickers.forEach(picker => {
    picker.addEventListener("click", SelectItem);
});

function SelectItem(e) {
    let picker = e.target;
    let color = e.target.classList[2];
    pickers.forEach((e) => {
        e.classList.remove("selected");

    });
    picker.classList.add("selected");

    console.log(color);
    FilterByColor(color);
}

//Filtrage par couleur

function FilterByColor(color) {
    if (color === "all") {
        filteredCrocs = crocs;
    } else {
        filteredCrocs = crocs.filter((croc) => croc.colors[0] === color || croc.colors[1] === color || croc.colors[2] === color);
        if (filteredCrocs.length <= 0) {
            container.innerHTML = "Aucun résultat";
        }
    }
    
    
    
}

//Tri par prix

const priceBtnAsc = document.querySelector(".price-btn-asc");

priceBtnAsc.addEventListener("click", sortByPriceAsc);

function compareByPriceAscending (a, b) {
    return a.price - b.price;
}

function sortByPriceAsc() {
    filteredCrocs.sort(compareByPriceAscending);
    getCrocs();
}

//toggle 

const cartIcon = document.querySelector(".cart-icon");
const cartCtn = document.querySelector(".cart-ctn");

cartIcon.addEventListener("click", toggleCart);

function toggleCart() {
    cartCtn.classList.toggle("open-cart");
    if(cartCtn.classList.contains("open-cart")) {
        cartIcon.style.backgroundImage = "url('../style/img/close.png')";
    } else {
        cartIcon.style.backgroundImage = "url('../style/img/panier.png')";
    }
}

//localStorage

let cartList = JSON.parse(localStorage.getItem("cart")) || [];
function addcrocs(id) {
    let croc = crocs.find(croc => croc.id === id);
    let imgValue = 0;
    if (croc.imgID == "img_1") {
        imgValue = 0;
    } else if (croc.imgID == "img_2") {
        imgValue = 1;
    }else if (croc.imgID == "img_3") {
        imgValue = 2;
    }
    let tmp = "<img class=\"cart-croc-img\" src=\""+croc[croc.imgID][0]+"\" /> <div> "+croc.name+" </div> <div> "+croc.price+"€ </div> <button onclick=\"removefromcart("+croc.id+", "+imgValue+")\"> Supprimer </button>";
    cartList.push(tmp);
    localStorage.setItem("cart", JSON.stringify(cartList));
    loadcart();
}

function loadcart() {
    cartCtn.innerHTML = "";
    cartList.forEach(function(croc, x) {
        let crocCart = document.createElement("div");
        crocCart.classList.add("cart-item");
        crocCart.innerHTML = cartList[x];
        cartCtn.appendChild(crocCart);
    });
}

function removefromcart(id, value) {
    let toRemove = 0;
    let croc = crocs[id-1]
    let crocHtml = document.getElementsByClassName("cart-croc-img")
    let IDimg = ""
    if (value == 0) {
        IDimg = "img_1";
    } else if (value == 1) {
        IDimg = "img_2";
    } else if (value == 2) {
        IDimg = "img_3";
    }
    let simplifiedImg = ""
    let simplifiedSrc = ""
    for (var i = 0; i != cartList.length; i++) {
        simplifiedImg = croc[IDimg][0].slice(0, croc[IDimg][0].length-5).split('/').pop().toString();
        simplifiedSrc = crocHtml[i].src.slice(0, crocHtml[i].src.length-5).split('/').pop().toString();
        if (simplifiedSrc == simplifiedImg) {
            toRemove = i;
        }
    }
    cartList.splice(toRemove, 1);
    localStorage.setItem("cart", JSON.stringify(cartList));
    loadcart();
}

//lancement de la fonction

LoadCrocs();