const dropDown = document.getElementById('search')
// Här hämtas elementet där all information om städerna ska skrivas ut till
const listOfSelected = document.getElementById('cities-list');

let selectedCityId;
let citiesToDropDown;



// Här fylls dropdown menyn på med namn på städer hämtade från cities-apiet hämtat med fetch. Den exekveras när den kallas.
// Arrow-function som körs när den anropas
let populateDropDownMenu = () => {
    fetch('https://avancera.app/cities/')
        .then((response) => response.json())
        .then((result) => {

            // Här läggs ett första väl in där man väljer alla städer.
            citiesToDropDown = `<option value="">Select all</option>`;

            for (i = 0; i < result.length; i++) {

                citiesToDropDown += `<option value="${result[i].id}">${result[i].name}</option>`;

            }

            // Ett select-element, search fylls på med alla städers namn.
            dropDown.innerHTML = citiesToDropDown;

            console.log(citiesToDropDown);

        });
};

// Här anropas metoden/funktionen ovan
// Fyller på drop-down menyn med städer en gång
populateDropDownMenu();

// btn-klick metod med eventlistener
document.getElementById('city-search-button').addEventListener('click', searchCities);

async function searchCities() {


    // Visar elementet som ska fyllas på med städer
    listOfSelected.style.display = 'inline';

    // Fyller på/uppdaterar drop-down menyn med städer en gång
    populateDropDownMenu();



    selectedCityId = document.getElementById('search').value;

    if (citiesToDropDown === '<option value="">Select all</option>'){

        console.log('The list is empty, add a new city to continue')
    }



    try {
        const response = await fetch('https://avancera.app/cities/' + selectedCityId);
        const result = await response.json();

        console.log(selectedCityId);

        // Tömmer diven som listar all info om städerna
        let citiesToList = '';

        if (!selectedCityId) {
            //For-loopen itererar igenom alla object i resultatet
            for (let i = 0; i < result.length; i++) {

              //Förevarje objekt sparas en div med namn och population
              citiesToList += `
              <div class="citieList" id="citieList${i}">
                  <div id="name-population-wrapper${i}" class = "name-population-wrapper">
                      <h2 class="city-name">${result[i].name}</h2>
                      <input type="text" class="edit-city-name-input" placeholder="New city name..." style= "display: none"; >

                      <p class="city-population">Population: ${result[i].population}</p>
                      <input type="text" class="edit-city-population-input" placeholder="New population..." style= "display:none"; >
                  </div>

                  <div id="city-list-btn-wrapper">
                      <div id="slide-down-on-arrow-down${i}" class="slide-down-on-arrow-down">
                       <button data-city-index="${i}" data-city-id=${result[i].id} data-city-population=${result[i].population} id="edit-selected-city${i}" class="edit-selected-city" onclick="editCity(this)">Edit</button>
                       <button data-city-id=${result[i].id} id="remove-selected-city" onclick="removeCity(this)">Remove</button>
                  </div>

                  <svg data-city-index="${i}" data-city-id=${result[i].id} id="arrow-down${i}" class="arrow-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" onclick="handleArrowDownClick(this)">
                  <path d="M6 9l6 6 6-6"/>
                  </svg>
                  </div>
              </div>`;
      }

  } else {

      i = 'oneCitySelected'

      citiesToList = `
      <div class="citieList" id="citieList${i}">
          <div id="name-population-wrapper${i}" class = "name-population-wrapper">
              <h2 class="city-name">${result.name}</h2>
              <input type="text" class="edit-city-name-input" placeholder="New city name..." style="display: none"; >

              <p class="city-population">Population: ${result.population}</p>
              <input type="text" class="edit-city-population-input" placeholder="New population..." style= "display:none"; >
          </div>

          <div id="city-list-btn-wrapper">
          <div id="slide-down-on-arrow-down${i}" class="slide-down-on-arrow-down">
          <button data-city-index="${i}" data-city-id=${result.id} data-city-population=${result.population} id="edit-selected-city${i}" class="edit-selected-city" onclick="editCity(this)">Edit</button>
          <button data-city-index="${i}" data-city-id=${result.id} id="remove-selected-city" onclick="removeCity(this)">Remove</button>
          </div>

          <svg data-city-index="${i}" data-city-id="${result.id}" id="arrow-down${i}" class="arrow-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" onclick="handleArrowDownClick(this)">
          <path d="M6 9l6 6 6-6"/>
          </svg>
          </div>
      </div>`;

        }
        // Skriv ut städer eller stad
        listOfSelected.innerHTML = citiesToList;
        listOfSelected.scrollIntoView({ behavior: 'smooth', block: 'center' })

    } catch (error) {
        console.error('Error getting city data', error);
        alert('Försök igen');
    }
}

let inputNewCityName;
let inputNewPopulation;
const errorMessageP = document.getElementById('error-message-population');
const cityInput = document.getElementById('input-new-city-name');
const populationInput = document.getElementById('input-new-population');

document.getElementById('add-new-city-button').addEventListener('click', addNewCity);

function addNewCity() {
    inputNewCityName = cityInput.value;
    inputNewPopulation = populationInput.value;

    if (inputNewCityName !== "" && inputNewPopulation !== "" && !isNaN(inputNewPopulation) && isNaN(inputNewCityName) ) {

        populationInput.style.border = '1px solid white';
        cityInput.style.border = '1px solid white';

        errorMessageP.innerHTML =""
        cityInput.value =""
        populationInput.value=""

        errorMessageP.innerHTML = `<p id="added-city-message-fade">*${inputNewCityName} has been added to the list.</p>`

        addCityToCities(inputNewCityName,inputNewPopulation)


    } else if (!inputNewPopulation && inputNewCityName !== "") {

        populationInput.style.border = '1px solid red';
        errorMessageP.innerHTML = `<p id="added-city-message-fade">*Please, fill in population for the city.</p>`;

    } else if (!inputNewCityName && inputNewPopulation !== "") {

        cityInput.style.border = '1px solid red';
        errorMessageP.innerHTML = `<p id="added-city-message-fade">*Please, type in city name.</p>`;

    } else {

        populationInput.style.border = '1px solid red';
        cityInput.style.border = '1px solid red';
        errorMessageP.innerHTML = `<p id="added-city-message-fade">*Please, type in a city name and population correctly.</p>`;

    }
}

// Function for adding city
function addCityToCities(name, population){

   fetch('https://avancera.app/cities/',{

    body: '{"name":"' + name + '",      "population": ' + population + '}',
    headers: {
        'Content-Type': 'application/json'
    },
    method: 'POST'

})

    populateDropDownMenu()
    searchCities()

}

// Function som får edit och remove knapparna att slida fram
function handleArrowDownClick(e){

    const cityIndex = e.dataset.cityIndex;
    const cityId = e.dataset.cityId;
    console.log(typeof e)
    console.log(e, 'Detta är e')


    // Hämta det aktuella cityInfoDiv-elementet baserat på cityIndex
    let whichCityInfoDiv = document.getElementById('citieList' + cityIndex);

    // Hämta det specifika slide-down-elementet för det aktuella cityInfoDiv-elementet
    let slideDownElement = whichCityInfoDiv.querySelector('#slide-down-on-arrow-down' + cityIndex);

    // När pilknappen trycks så roterar den 180 grader
    document.getElementById(`arrow-down${cityIndex}`).classList.toggle("rotate-arrow")


    // Uppdatera klassen för att visa slide-down-elementet
    slideDownElement.classList.toggle("slidein");

    // Använd cityId för att utföra åtgärder för den specifika staden
    console.log(`Arrow down clicked for city ${cityId}`);


    // För att handtera edit-inputfälten när man trycker på pilen
    let cityNameElement = document.querySelector('#name-population-wrapper' + cityIndex + ' h2');
    let populationElement = document.querySelector('#name-population-wrapper' + cityIndex + ' p');
    let editCityNameInput = document.querySelector('#name-population-wrapper' + cityIndex + ' .edit-city-name-input');
    let editCityPopulationInput = document.querySelector('#name-population-wrapper' + cityIndex + ' .edit-city-population-input');

    editCityNameInput.style.display = 'none';
    editCityPopulationInput.style.display = 'none';
    cityNameElement.classList.remove('edit');
    populationElement.classList.remove('edit');

    let editButton = document.getElementById('edit-selected-city')
    editButton.innerHTML = 'Edit'

}

// Button-click
function removeCity(e) {

    const removeCityId = e.dataset.cityId;
    const cityIndex = e.dataset.cityIndex;

    let promise = fetch('https://avancera.app/cities/' + removeCityId,{

    body: JSON.stringify({  id: removeCityId, }),
    headers: {
        'Content-Type': 'application/json'
    },
        method: 'DELETE'

    })

    promise
    .then(response => {
    console.log(response)
    populateDropDownMenu();

    if(cityIndex === 'oneCitySelected'){

        let closeThisDiv= document.getElementById('citieListoneCitySelected')
            closeThisDiv.remove();

        let citieContainer =   document.getElementById('cities-list')
        // citieContainer.style.display = 'none';
        citieContainer.classList.toggle('slide-out')

    }
    else{
        searchCities();

    }

    })
}



function editCity(e) {

    const cityIndex = e.dataset.cityIndex;
    const cityId = e.dataset.cityId;

    // Hämtar elementet för stadens namn
    let cityNameElement = document.querySelector('#name-population-wrapper' + cityIndex + ' h2');
    let populationElement = document.querySelector('#name-population-wrapper' + cityIndex + ' p');

    let editCityNameInput = document.querySelector('#name-population-wrapper' + cityIndex + ' .edit-city-name-input');
    let editCityPopulationInput = document.querySelector('#name-population-wrapper' + cityIndex + ' .edit-city-population-input');


    // Om vi inte redan är i redigeringsläge
    if (!cityNameElement.classList.contains('edit')) {

        // Byt klassen för att indikera redigeringsläge
        cityNameElement.classList.add('edit');
        populationElement.classList.add('edit');

        // Visa redigeringsfälten och fyll i befintlig information
        editCityNameInput.style.display = 'inline';
        editCityPopulationInput.style.display = 'inline';

        // editCityNameInput.value = cityNameElement.innerText;
        // editCityPopulationInput.value = population;
        let editButton = document.getElementById(`edit-selected-city${cityIndex}`)
            editButton.innerHTML = 'Save'

    } else {

        // Ta bort redigeringsklassen
        cityNameElement.classList.remove('edit');
        populationElement.classList.remove('edit');


        // Här hämtas den nya staden och populationen
        let newName = editCityNameInput.value;
        let newPopulation = editCityPopulationInput.value;
        //Här konverteras strängen till nummer
        let convertedPopulation = newPopulation * 1;


        // Dölj redigeringsfälten
        editCityNameInput.style.display = 'none';
        editCityPopulationInput.style.display = 'none';


        let changeCityProperties;

        if (newName && convertedPopulation){
            changeCityProperties = {name: newName, population: convertedPopulation}

        }
        else if(newName){

            changeCityProperties = {name:newName}

        }
        else if(convertedPopulation){

            changeCityProperties = { population: convertedPopulation}

        }

        console.log(JSON.stringify(changeCityProperties) + 'change city properties');

        let promise = fetch('https://avancera.app/cities/' + cityId,{

        body: JSON.stringify(changeCityProperties),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PATCH'

    })

    promise
      .then(response => {
        console.log(response)


        searchCities();
        populateDropDownMenu();


        let someOtherPromise = response.json()

        return someOtherPromise

      })

      .then(result => {
        console.log(result)
      })


    }
}
