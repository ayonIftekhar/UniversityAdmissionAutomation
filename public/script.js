
const choice_list = [];

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("department-select");
    const verticalContainer = document.getElementById("vertical-container");

    select.addEventListener("click", (event) => {
        if (event.target.tagName === "OPTION" && event.target.value !== "") {
            const selectedOption = event.target.value;
            const option = document.createElement("div");
            option.classList.add("department-option");
            option.textContent = selectedOption;
            verticalContainer.appendChild(option);
            //process.env.CHOCIE_LIST.push(option);
            event.target.remove(event.target.selectedIndex);
            choice_list.push(event.target.selectedIndex);
        }
    });
});


