(function () {
  $(function () {
    // set  variables
    const URL = "https://api.coingecko.com/api/v3/coins";
    let cachedCurrency = new Array();
    let cachedMoreInfo = new Map();
    let togglesCollection = new Array();
    let togglesCollectionDetails = new Array();
    let updatedToggleCollection = new Array();

    // function that runs on startup and make navbar work
    addNavbarListeners();

    // add event listeners to navbar
    function addNavbarListeners(){
      $("#navTitle").click(createHome);
      $("#homeButton").click(createHome);
      $("#liveReportButton").click(createLiveReport);
      $("#aboutButton").click(createAbout);
    }

    // make navbar change classes on click
    function changeNavbarButtonsClasses(button){
      // reset all buttons classes
      $(".navbar-nav").find(".active").removeClass("active");
      setActiveBTN(button)
    }
    
    // make the clicked button active
    function setActiveBTN(button){
      let clickedButton = "#"+button;
      $(clickedButton).parent().addClass("active");
    }

    // loads the currencies to home page on start
    createHome();

    // dynamic home creation
    function createHome() {
      clearPage();
      changeNavbarButtonsClasses("homeButton");
      addHomeTitleToUI();
      addSearchToUI();
      addCardsDivToUI();
      checkIfCacheFilled();
    }

    // clear the page (just the title and content)
    function clearPage() {
      $("#pageTitle").empty();
      $("#pageContent").empty();
    }

    // creates home title
    function addHomeTitleToUI() {
      let headerArea = $("<div>");
      headerArea.addClass('title');
      $("#pageTitle").append(headerArea);

      let header = $("<h1>");
      header.html("Currencies - Home");
      headerArea.append(header);
    }

    // adds the searchbar to html
    function addSearchToUI() {
      let searchArea = $("<div>");
      searchArea.attr("id", "searchArea");
      $("#pageContent").append(searchArea);

      let searchInput = $("<input>");
      searchInput.attr("id", "searchInput");
      searchInput.attr("placeholder", "Search Symbol Here");
      searchArea.append(searchInput);

      let searchButton = $("<button>");
      searchButton.attr("id", "searchButton");
      searchButton.html("Search");
      searchButton.click(searchFromUserInput);
      searchArea.append(searchButton);
    }

    // creates html div that will include the cards
    function addCardsDivToUI() {
      let cardsDiv = $("<div>");
      cardsDiv.attr("id", "cardsDiv");
      cardsDiv.attr("class", "innerPageClass");
      $("#pageContent").append(cardsDiv);
    }

    // function that checks if we can use cache and activates further functions accordingly
    function checkIfCacheFilled() {
      if (cachedCurrency.length == 0) {
        getAllCurrenciesFromServer();
        return;
      }
      addCurrenciesToUI(cachedCurrency);
    }

    // function that gets the json and inserts it to array
    function getAllCurrenciesFromServer() {
      // get request
      $.get(URL).then(function (currencies) {
        cachedCurrency = currencies.slice(0, 100);
        addCurrenciesToUI(cachedCurrency);
      })
      // if get failed
      .catch(function (error) {
        console.log(error);
        alert("We Are Sorry, But We Couldn't Find Any Currencies Matching.\nIf You Wish, Please Visit The Console Log For Further Info.");
      });
    }

    // throws the objects received to the next function to make html cards from them 
    function addCurrenciesToUI(currencies) {
      $("#cardsDiv").empty();
      // for each one create card
      for (let currency of currencies) {
        createCurrencyCard(currency);
      }
    }

    // creates the card on UI
    function createCurrencyCard(currency) {
      let newCard = $("<div>");
      newCard.addClass("card");
      $("#cardsDiv").append(newCard);
      
      // callbacks for next functions requiered
      addCurrencyDetailsToCard(currency, newCard);
      addToggleToCard(newCard, currency);
      addMoreInfoButtonToCard(currency, newCard);
    }
    
    // adds the details to the card
    function addCurrencyDetailsToCard(currency, newCard) {
      let currencyName = $("<h3>");
      currencyName.html(currency.name);
      currencyName.addClass("card-title");
      newCard.append(currencyName);

      let currencySymbol = $("<p>");
      currencySymbol.html(currency.symbol);
      currencySymbol.addClass("card-text");
      newCard.append(currencySymbol);

      let currencyID = $("<p>");
      currencyID.html(currency.id);
      currencyID.addClass("card-text");
      newCard.append(currencyID);
    }
    
    // adds the more info btn to card
    function addMoreInfoButtonToCard(currency, newCard) {
      let moreInfoButton = $("<button>");
      moreInfoButton.addClass("btn btn-outline-dark");
      moreInfoButton.attr("id", currency.id);
      moreInfoButton.text("More Info");
      moreInfoButton.click(onMoreInfoClicked);
      newCard.append(moreInfoButton);
    }

    // when more info clicked add the info to the card
    function onMoreInfoClicked() {
      let currentButton = $(this);

      // closes\opens the more info according to the click, if its open - close it, if close - open it
      let clicks = currentButton.data('clicks');
      if (clicks) {
        hideInfo(currentButton);
        currentButton.data("clicks", !clicks);
        return;
      }
      // get the info
      chooseAdditionalCurrencyInfoResource(currentButton);

      currentButton.data("clicks", !clicks);
    }

    function addPreloaderToUI(currentCardBody, currentCurrency) {
      let preloaderDiv = $("<div>");
      preloaderDiv.addClass("preloader");
      preloaderDiv.attr("id", currentCurrency);
      currentCardBody.append(preloaderDiv);
      
      let preloader = $("<img>");
      preloader.attr("src", "loading.gif");
      preloaderDiv.append(preloader);
    }
    
    // add the more info gotten to HTML
    function showMoreInfoInCard(currentCardBody, currentButton, currencyObj, currentCurrency) {
      currentButton.html("Hide");
    
      let collapser = $("<div>");
      collapser.addClass("collapser");
      collapser.attr("id", currentButton[0].id);
      currentCardBody.append(collapser);
      $("#" + (currentButton[0].id)).slideDown("slow");
    
      $(".preloader#" + currentCurrency).remove();
    
      // callbacks that sends the info gotten inside the card's collapser
      addPictureToCard(collapser, currencyObj)
      addIlsToCollapser(collapser, currencyObj);
      addUsdToCollapser(collapser, currencyObj);
      addEurToCollapser(collapser, currencyObj);
    }

    // adds the picture gotten from more info
    function addPictureToCard(collapser, currencyObj){
      let currencyImage = $("<img>");
      currencyImage.addClass("currencyPicture");
      currencyImage.attr("src", currencyObj.currencyImage);
      collapser.append(currencyImage);
    }

    // adds the ILS Value gotten from more info
    function addIlsToCollapser(collapser, currencyObj) {
      let ilsImage = $("<img>");
      ilsImage.addClass("currenciesPictures");
      ilsImage.attr("src", "shekel.svg");
      collapser.append(ilsImage);
    
      let ilsVal = $("<p>");
      ilsVal.addClass("moreInfoText");
      ilsVal.html("Shekel: &nbsp; &nbsp;" + currencyObj.ils + " &#8362;");
      collapser.append(ilsVal);
    }

    // adds the USD Value gotten from more info
    function addUsdToCollapser(collapser, currencyObj) {
      let usdImage = $("<img>");
      usdImage.addClass("currenciesPictures");
      usdImage.attr("src", "dollar.svg");
      collapser.append(usdImage);
    
      let usdVal = $("<p>");
      usdVal.addClass("moreInfoText");
      usdVal.html("Dollar: &nbsp; &nbsp;" + currencyObj.usd + " $");
      collapser.append(usdVal);
    }

    // adds the EUR value gotten from more info
    function addEurToCollapser(collapser, currencyObj) {
      let eurImage = $("<img>");
      eurImage.addClass("currenciesPictures");
      eurImage.attr("src", "euro.svg");
      collapser.append(eurImage);
    
      let eurVal = $("<p>");
      eurVal.addClass("moreInfoText");
      eurVal.html("Euro: &nbsp; &nbsp;" + currencyObj.eur + " &#8364;");
      collapser.append(eurVal);
    }

    // function that closes the more info and change the more info btn text back
    function hideInfo(currentButton) {
      currentButton.html("More Info");
      $(".collapser#" + currentButton[0].id).remove();
    }

    // creates the checkbox toggle inside the card
    function addToggleToCard(newCard, currency) {
      let toggleLabel = $("<label>");
      toggleLabel.addClass("switch");
      newCard.append(toggleLabel);

      let toggleBTN = $("<input>");
      toggleBTN.attr("type", "checkbox");
      toggleBTN.addClass("checkbox");
      toggleBTN.change(toggleCheck);
      toggleBTN.attr("id", currency.symbol);

      if (togglesCollection.includes(currency.symbol)){
        toggleBTN.attr("checked", "checked");
      }

      toggleLabel.append(toggleBTN);
      let toggleShape = $("<span>");
      toggleShape.addClass("slider round");
      toggleLabel.append(toggleShape);
    }

    // function that changes the toggle according to the user input
    function toggleCheck() {
      let currentToggle = $(this);
      let currencySymbol = currentToggle[0].id;

      // callbacks for further functions
      setToggleState(currentToggle, currencySymbol, togglesCollection);
      validateTogglesAmount();
    }

    // updates the togglesCollection array accordingly and gives the proper checked attribute
    function setToggleState(currentToggle, currencySymbol, currentToggleCollection) {
      if (currentToggle.is(":checked")) {
        currentToggle.attr("checked", "checked");
        // inserts the current toggle to togglesCollection array
        currentToggleCollection.push(currencySymbol);
        console.log(currentToggleCollection);
        return;
      }
      
      currentToggle.removeAttr("checked");
      let currencyIndexToRemove = currentToggleCollection.indexOf(currencySymbol);
      //splices the current toggle from togglesCollection array
      currentToggleCollection.splice(currencyIndexToRemove, 1);
      console.log(currentToggleCollection);
    }

    // triggered when a toggle is checked. counts toggles collection, if bigger than 5 a modal will pop up
    function validateTogglesAmount() {
      // makes sure that the length of togglesCollection is more than 5
      if (togglesCollection.length > 5) {
        //for each currency - send currency details to UI
        for (let i = 0; i < togglesCollection.length; i++) {
          let togglesCollectionDetailsInfo = cachedCurrency.find(index => index.symbol == togglesCollection[i]);
          togglesCollectionDetails[i] = togglesCollectionDetailsInfo;
        }

        updatedToggleCollection = togglesCollection.slice();
        createModalOnUI();
      }
    }

    // modal html creation
    function createModalOnUI() {
      let modalBG = createDarkBG();
      let modalContainer = createModalBox(modalBG);

      // create modal's header
      createModalHeader(modalContainer);

      // create modalBody
      let modalBody = createModalBody(modalContainer);

      // callback for function that creates the currencies on modal's UI
      addCurrenciesToModalUI(togglesCollectionDetails, modalBody);

      // create footer
      let modalFooter = createModalFooter(modalContainer);
      
      // add buttons to footer
      createSaveButton(modalFooter);
      createCancelButton(modalFooter);
    }

    // // creates the modal's background
    function createDarkBG() {
      modalBG = $("<div>");
      modalBG.addClass("popUp");
      $("body").append(modalBG);
      return modalBG;
    }

    // creates the modal's container 
    function createModalBox(modalBG) {
      modalContainer = $("<div>");
      modalContainer.addClass("modalContainer")
      modalBG.append(modalContainer);
      return modalContainer;
    }

    // creates the modal's header
    function createModalHeader(modalContainer) {
      let modalHeader = $("<div>");
      modalHeader.addClass("modalHeader");
      modalHeader.html("<h5>Maximum currencies allowed for live report is only 5 currencies.<br>" +
      "Please choose a currency to remove or go back to revert the last tick.</h4>");
      modalContainer.append(modalHeader);
    }

    // creates the modal's body
    function createModalBody(modalContainer) {
      modalBody = $("<div>");
      modalBody.addClass("modalBody");
      modalContainer.append(modalBody);
      return modalBody;
    }

    // creates the modal's footer
    function createModalFooter(modalContainer) {
      modalFooter = $("<div>");
      modalFooter.addClass("modalFooter");
      modalContainer.append(modalFooter);
      return modalFooter;
    }

    // creates the modal's save btn
    function createSaveButton(modalFooter) {
      let saveButton = $("<button>");
      saveButton.addClass("btn btn-info");
      saveButton.attr("id", "saveButton");
      saveButton.text("Save changes");
      saveButton.click(onSaveButtonClicked);
      modalFooter.append(saveButton);
    }

    // triggered when the modal's save btn clicked
    function onSaveButtonClicked(){
      // make sure user unchecked at least 1 toggle;
      if (updatedToggleCollection.length == 6){
        alert("Please Remove At Least One Currency\nMaximum 5 Currencies Allowed");
        return;
      }

      // if he removed, remove the modal from UI and update the original toggles collection accordingly and create the currencies again from the cached currency
      $(".popUp").remove();
      togglesCollection = updatedToggleCollection;
      addCurrenciesToUI(cachedCurrency);
    }

    // create the modal's cancel button
    function createCancelButton(modalFooter) {
      let cancelButton = $("<button>");
      cancelButton.addClass("btn btn-secondary");
      cancelButton.attr("id", "cancelButton");
      cancelButton.text("Cancel");
      cancelButton.click(onCancelButtonClicked);
      modalFooter.append(cancelButton);
    }

    // triggered when modal's cancel btn clicked
    function onCancelButtonClicked(){
      // pop removes the latest currency added to the array
      togglesCollection.pop();
      // remove the modal and create the currencies from cachedCurrency again
      $(".popUp").remove();
      
      addCurrenciesToUI(cachedCurrency);
    }

    // makes currency cards from the toggles array
    function addCurrenciesToModalUI(togglesCollectionDetails, modalBody) {
      // for each currency create card, and add its content
      for (let currency of togglesCollectionDetails) {
        let newCard = $("<div>");
        newCard.addClass("card");
        $(modalBody).append(newCard);

        addCurrencyDetailsToCard(currency, newCard);

        let toggleLabel = $("<label>");
        toggleLabel.addClass("switch");
        newCard.append(toggleLabel);

        createModalToggleBTN(toggleLabel, currency);
        
        let toggleShape = $("<span>");
        toggleShape.addClass("slider round");
        toggleLabel.append(toggleShape);
      }
    }

    // create toggle inside the card
    function createModalToggleBTN(toggleLabel, currency) {
      let toggleBTN = $("<input>");
      toggleBTN.attr("type", "checkbox");
      toggleBTN.attr("id", currency.symbol);
      toggleBTN.attr("checked", "checked");
      toggleBTN.addClass("checkbox");
      toggleBTN.click(() => onModalToggleClicked(currency, toggleBTN));
      toggleLabel.append(toggleBTN);
    }

    // triggered when toggle clicked and changes the updatedTogglesCollection accordingly
    function onModalToggleClicked(currency, toggleBTN){
      let currentCoinSymbol = currency.symbol;
      setToggleState(toggleBTN, currentCoinSymbol, updatedToggleCollection);
    }

    // function that checks if theres matching additional info in cache and activates callbacks accordingly
    function chooseAdditionalCurrencyInfoResource(currentButton) {
      let currentCardBody = currentButton.parent();
      let currentCurrency = currentButton[0].id;

      // if cache has matching details - get from cache;
      if (cachedMoreInfo.has(currentCurrency)) {
        let currencyObj = cachedMoreInfo.get(currentCurrency);
        showMoreInfoInCard(currentCardBody, currentButton, currencyObj, currentCurrency);
        return;
      }
      // else get from server
      currentButton.prop("disabled", true);
      requestSpecificCurrencyFromServer(currentCurrency, currentCardBody, currentButton);
      
      addPreloaderToUI(currentCardBody, currentCurrency);
    }

    // request the desired currency more info
    function requestSpecificCurrencyFromServer(currentCurrency, currentCardBody, currentButton) {
      // get request
      $.get(URL + "/" + currentCurrency).then(function (details) {
        // get the relevant data
        let ilsCurrency = details.market_data.current_price.ils;
        let usdCurrency = details.market_data.current_price.usd;
        let eurCurrency = details.market_data.current_price.eur;
        let currencyImage = details.image.large;

        // create obj from the data recieved
        let currencyObj = {
          ils: ilsCurrency,
          usd: usdCurrency,
          eur: eurCurrency,
          currencyImage: currencyImage
        }

        storeObjInCache(currentCurrency, currencyObj);
        showMoreInfoInCard(currentCardBody, currentButton, currencyObj, currentCurrency);
        currentButton.prop("disabled", false);
      })
      .catch(function (error) {
        console.log(error);
        alert("We Are Sorry, But We Couldn't Find More Info At This Moment\nPlease Try Again Later Or Visit The Consol Log For Further Error Info.");
      });
    }

    // save the created obj in cache for 2 mins
    function storeObjInCache(currentCurrency, currencyObj) {
      cachedMoreInfo.set(currentCurrency, currencyObj);

      // delete the cached more info after 2 mins
      setTimeout(function () {
        cachedMoreInfo.delete(currentCurrency);
      }, 120000);
    }
    

    // searched a specific currency that user searched in searchbar
    function searchFromUserInput() {
      let desiredCurrency = $("#searchInput").val();
      // clears the field and sets the user's input as placeholder
      $("#searchInput").val("");
      $("#searchInput").attr("placeholder", desiredCurrency);

      // if user leaves the field empty then just show all currencies
      if (desiredCurrency.trim().length == 0) {
        addCurrenciesToUI(cachedCurrency);
        $("#searchInput").attr("placeholder", "Search Symbol Here");
        return;
      }

      // if the desired currency was not found - Alert the user
      if (cachedCurrency.find(index => index.symbol == desiredCurrency) == undefined) {
        alert("This currency does not exist.\n Please search A new one");
        return;
      }

      // if the input is ok, show it on UI
      let filteredCurrency = cachedCurrency.filter(index => index.symbol == desiredCurrency);
      addCurrenciesToUI(filteredCurrency);
    }


    // ***************************************************
    // *************  L I V E   R E P O R T  *************
    // ***************************************************

    
    function createLiveReport() {
      // if no toggles checked - Return and alert
      if (!isTogglesAmountValid()){
        return;
      }

      const chartURL = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + togglesCollection + "&tsyms=USD";

      changeNavbarButtonsClasses("liveReportButton");
      clearPage();

      let options = createOptionsVariable();

      addLiveReportTitleToUI(options);

      let chart = addLiveReportDivToUI(options);

      getLiveData(chartURL, options, chart);
      updateChartByInterval(chartURL, options, chart);
    }

    // options variable
    function createOptionsVariable(){
      let options = {
        exportEnabled: true,
        animationEnabled: false,
        axisX: {
          title: "Time"
        },
        axisY: {
          title: "Rate In USD",
          titleFontColor: "#4F81BC",
          lineColor: "#4F81BC",
          labelFontColor: "#4F81BC",
          tickColor: "#4F81BC"
        },
        toolTip: {
          shared: true
        },
        legend: {
          cursor: "pointer",
          itemclick: toggleDataSeries
        },
        data: [] 
      };

      function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }
      return options;
    }

    // validation that at least one toggle is checked
    function isTogglesAmountValid(){
      if (togglesCollection.length < 1){
        alert ("Please check the currencies that you want.");
        return false;
      }
      return true;
    }

    // adds title
    function addLiveReportTitleToUI() {
      let headerArea = $("<div>");
      headerArea.addClass('title');
      $("#pageTitle").append(headerArea);

      let header = $("<h1>");
      header.html("Currencies - Live Report");
      headerArea.append(header);
    }

    // adds the div for live report and gets the chart from options 
    function addLiveReportDivToUI(options){
      let chart = $("<div>");
      chart.attr("id", "chartContainer");
      $("#pageContent").append(chart);
      chart.CanvasJSChart(options);

      return chart;
    }

    // gets live data from get request
    function getLiveData(chartURL, options, chart) {
      $.get(chartURL).then(function(liveData){
        let dataList = Object.entries(liveData);
        for (let currency of dataList){
          let data = createDataFromGetRequest(currency);
          options.data.push(data);
          chart.CanvasJSChart(options);
        }
      })
      .catch(function (error) {
        console.log(error);
        alert("We Are Sorry, But We Couldn't Find Live data this time.\nPlease Try Again Later Or Visit The Console Log For Further Info.");
      });
    }

    // create data obj for live data
    function createDataFromGetRequest(currency){
      let data = {
        type: "spline",
        name: currency[0],
        showInLegend: true,
        xValueFormatString: "MMM YYYY",
        yValueFormatString: "#,##0 United States Dollars",
        dataPoints: [
          { x: new Date(),  y: currency[1].USD }
        ]
      }
      return data;
    }

    // every 2 seconds update chart
    function updateChartByInterval(chartURL, options, chart){
      setInterval(function(){
        updateCurrencyDetailsByInterval(chartURL, options, chart);
      }, 2000)
    }

    // update function that runs every 2 seconds
    function updateCurrencyDetailsByInterval(chartURL, options, chart){
      // get request
      $.get(chartURL).then(function(liveData){
        let dataList = Object.entries(liveData);
        let index = 0;
        for (let data of dataList){
          let updatedData = {
            x: new Date(),
            y: data[1].USD
          }
          options.data[index].dataPoints.push(updatedData);
          index++;
        }
        chart.CanvasJSChart(options);
      })
      // if failed
      .catch(function (error) {
        console.log(error);
        alert("We Are Sorry, But We Couldn't Find Live data this time.\nPlease Try Again Later Or Visit The Console Log For Further Info.");
      });
    }


    // **************************************************
    // ****************    A b o u t    *****************
    // **************************************************

    // create About page
    function createAbout() {
      clearPage();
      changeNavbarButtonsClasses("aboutButton");
      addAboutTitleToUI();
      addAboutMeToUI();
      addAboutProjectToUI();
    }

    // add About Title 
    function addAboutTitleToUI() {
      let headerArea = $("<div>");
      headerArea.addClass('title');
      $("#pageTitle").append(headerArea);

      let header = $("<h1>");
      header.html("Currencies - About");
      headerArea.append(header);
    }
    
    // add Me Section
    function addAboutMeToUI(){
      let aboutMeArea = $("<div>");
      aboutMeArea.addClass('aboutPage');
      $("#pageContent").append(aboutMeArea);

      // callbacks
      addAboutMeHeaderToUI(aboutMeArea);
      addAboutMeParagraphToUI(aboutMeArea);
      addMyPhotosToAboutUI(aboutMeArea);
    }

    // add about me header
    function addAboutMeHeaderToUI(aboutMeArea){
      let aboutMeHeader = $("<h2>");
      aboutMeHeader.attr("id", "aboutMeHeader");
      aboutMeHeader.html("ABOUT  &nbsp&nbsp  ME");
      $(aboutMeArea).append(aboutMeHeader);
    }

    // add about me paragraph
    function addAboutMeParagraphToUI(aboutMeArea){
      let aboutMeParagraph = $("<p>");
      aboutMeParagraph.html("<b>Adar Abadian,</b> 23 Years old from Azor - Israel.<br>" + 
      "Working in DHL as a software QA Engineer and I'm A " + 
      "Full-Stack web development Student.<br><br>" + 

      "<b>Education:</b> <br>" + 
      "2018 - 2019 - ISTQB - QA Course - <i>John Bryce Collage</i> <br>" + 
      "2020 - Present - Full-Stack Web Development Course <i>John Bryce Collage</i> <br><br>" +
      
      "<b>Favorite quotes:</b> <br>" + 
      "<i> &quot;Who Dares Wins&quot;.</i> - S.A.S. <br>" + 
      "<i> &quot;It is not by strength, not by might but by spirit&quot;.</i> - The Bible.");
      $(aboutMeArea).append(aboutMeParagraph);
    }

    // add my photos to about me section
    function addMyPhotosToAboutUI(aboutMeArea){
      let photosArea = $("<div>");
      photosArea.addClass('aboutAlbum');
      aboutMeArea.append(photosArea);


      let carImage = $("<img>");
      carImage.addClass("aboutImages");
      carImage.attr("src", "race.jpg");
      photosArea.append(carImage);

      let workImage = $("<img>");
      workImage.addClass("aboutImages");
      workImage.attr("src", "work.jpg");
      photosArea.append(workImage);

      let teamImage = $("<img>");
      teamImage.addClass("aboutImages");
      teamImage.attr("src", "team.jpg");
      photosArea.append(teamImage);

    }


    // creates about the project section
    function addAboutProjectToUI(){
      let aboutProjectArea = $("<div>");
      aboutProjectArea.addClass('aboutPage');
      $("#pageContent").append(aboutProjectArea);
      
      addAboutProjectHeaderToUI(aboutProjectArea);
      addAboutProjectParagraphToUI(aboutProjectArea);
    }

    // add about project header
    function addAboutProjectHeaderToUI(aboutProjectArea){
      let aboutCurrenciesHeader = $("<h2>");
      aboutCurrenciesHeader.attr("id", "aboutCurrenciesHeader");
      aboutCurrenciesHeader.html("ABOUT  &nbsp&nbsp  CURRENCIES");
      $(aboutProjectArea).append(aboutCurrenciesHeader);
    }

    // adds abbout project paraghraph
    function addAboutProjectParagraphToUI(aboutProjectArea){
      let aboutCurrenciesParagraph = $("<p>");
      aboutCurrenciesParagraph.html("<b>Currencies project</b> is a project written by Adar Abadian.<br>" + 
      "The project was written in jQuery.<br>" +
      "Nowadays, we are learning typescript and looking towards react development.<br><br>" +
      "<b>Technologies used:</b><br>" + 
      "jQuery with Ajax GET requests <br>CSS3 <br>Bootstrap <br>Parallax Scrolling");
      $(aboutProjectArea).append(aboutCurrenciesParagraph);
    }
    
  });
})();