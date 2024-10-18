import {setCountryName} from "../../globeTraveler/script.js";

let dest = document.getElementById("dest").addEventListener("click", () => {
    const inputValue = document.getElementById('from').value;
    console.log(inputValue);
    setCountryName(inputValue);
})
